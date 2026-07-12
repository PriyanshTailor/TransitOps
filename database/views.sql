-- ============================================================================
-- TransitOps - Database Views (for Dashboard KPIs & Reports)
-- ============================================================================

BEGIN;

-- Dashboard KPIs (computed from live data)
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
    COUNT(*) FILTER (WHERE status IN ('Available', 'On Trip'))              AS active_vehicles,
    COUNT(*) FILTER (WHERE status = 'Available')                            AS available_vehicles,
    COUNT(*) FILTER (WHERE status = 'In Shop')                              AS in_maintenance,
    (SELECT COUNT(*) FROM trips WHERE status = 'Dispatched')                AS active_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'Draft')                     AS pending_trips,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'On Trip')::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1
    )                                                                       AS fleet_utilization
FROM vehicles;

-- Weekly fleet activity (for dashboard chart)
CREATE OR REPLACE VIEW v_weekly_activity AS
SELECT
    TO_CHAR(d.day, 'Dy') AS day_name,
    d.day,
    COALESCE(t.trip_count, 0)  AS trips,
    COALESCE(f.fuel_liters, 0) AS fuel_liters
FROM (
    SELECT generate_series(
        date_trunc('week', CURRENT_DATE),
        date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
        INTERVAL '1 day'
    )::DATE AS day
) d
LEFT JOIN (
    SELECT trip_date, COUNT(*) AS trip_count
    FROM trips
    WHERE status IN ('Dispatched', 'Completed')
    GROUP BY trip_date
) t ON t.trip_date = d.day
LEFT JOIN (
    SELECT fuel_date, SUM(liters) AS fuel_liters
    FROM fuel_logs
    GROUP BY fuel_date
) f ON f.fuel_date = d.day
ORDER BY d.day;

-- Operational cost summary (Reports page)
CREATE OR REPLACE VIEW v_operational_costs AS
SELECT
    DATE_TRUNC('month', period_date)::DATE AS month,
    SUM(fuel_cost)       AS total_fuel_cost,
    SUM(maintenance_cost) AS total_maintenance_cost,
    SUM(fuel_cost) + SUM(maintenance_cost) AS total_operational_cost
FROM (
    SELECT fuel_date AS period_date, total_cost AS fuel_cost, 0 AS maintenance_cost
    FROM fuel_logs
    UNION ALL
    SELECT service_date, 0, cost
    FROM maintenance_logs
    WHERE status = 'Completed'
) costs
GROUP BY DATE_TRUNC('month', period_date)
ORDER BY month;

-- Fuel efficiency per vehicle
CREATE OR REPLACE VIEW v_fuel_efficiency AS
SELECT
    v.registration_number,
    v.name AS vehicle_name,
    SUM(f.liters) AS total_liters,
    SUM(f.total_cost) AS total_fuel_cost,
    v.odometer_km,
    CASE
        WHEN SUM(f.liters) > 0
        THEN ROUND(v.odometer_km::NUMERIC / SUM(f.liters), 2)
        ELSE 0
    END AS km_per_liter
FROM vehicles v
LEFT JOIN fuel_logs f ON f.vehicle_id = v.id
GROUP BY v.id, v.registration_number, v.name, v.odometer_km;

-- Full trip details (joins vehicle + driver info for UI tables)
CREATE OR REPLACE VIEW v_trip_details AS
SELECT
    t.id,
    t.trip_code,
    t.origin,
    t.destination,
    v.registration_number AS vehicle_reg,
    v.name                AS vehicle_name,
    d.full_name           AS driver_name,
    t.cargo_weight_kg,
    t.status,
    t.trip_date,
    t.dispatched_at,
    t.completed_at,
    t.created_at
FROM trips t
JOIN vehicles v ON v.id = t.vehicle_id
JOIN drivers  d ON d.id = t.driver_id;

COMMIT;
