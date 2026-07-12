-- ============================================================================
-- TransitOps - Seed Data
-- Populates tables with data matching the frontend mockData.js
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- ROLES (Settings RBAC)
-- ---------------------------------------------------------------------------

INSERT INTO roles (name, description) VALUES
    ('Fleet Manager',      'Full access to vehicles and drivers'),
    ('Dispatcher',         'Access to trips and routing'),
    ('Financial Analyst',  'Access to reports and fuel'),
    ('Admin',              'Full system access')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- PERMISSIONS
-- ---------------------------------------------------------------------------

INSERT INTO permissions (name, module, description) VALUES
    ('vehicles.read',    'vehicles',    'View vehicle registry'),
    ('vehicles.write',   'vehicles',    'Create and edit vehicles'),
    ('vehicles.delete',  'vehicles',    'Delete vehicles'),
    ('drivers.read',     'drivers',     'View driver list'),
    ('drivers.write',    'drivers',     'Create and edit drivers'),
    ('drivers.delete',   'drivers',     'Delete drivers'),
    ('trips.read',       'trips',       'View trips'),
    ('trips.write',      'trips',       'Create and dispatch trips'),
    ('trips.delete',     'trips',       'Cancel trips'),
    ('maintenance.read', 'maintenance', 'View maintenance logs'),
    ('maintenance.write','maintenance', 'Create and update maintenance records'),
    ('fuel.read',        'fuel',        'View fuel logs'),
    ('fuel.write',       'fuel',        'Create fuel logs'),
    ('reports.read',     'reports',     'View reports and analytics'),
    ('settings.read',    'settings',    'View settings'),
    ('settings.write',   'settings',    'Update company profile and roles')
ON CONFLICT (name) DO NOTHING;

-- Fleet Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Fleet Manager'
  AND p.module IN ('vehicles', 'drivers')
ON CONFLICT DO NOTHING;

-- Dispatcher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Dispatcher'
  AND p.module = 'trips'
ON CONFLICT DO NOTHING;

-- Financial Analyst permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Financial Analyst'
  AND p.module IN ('fuel', 'reports')
ON CONFLICT DO NOTHING;

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- LINK EXISTING USER TO ADMIN ROLE
-- ---------------------------------------------------------------------------

UPDATE public."user"
SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
WHERE role_id IS NULL;

-- ---------------------------------------------------------------------------
-- COMPANY PROFILE
-- ---------------------------------------------------------------------------

INSERT INTO company_profile (company_name, support_email, address)
SELECT 'TransitOps Logistics', 'support@transitops.com', '123 Transport Blvd, Industrial City'
WHERE NOT EXISTS (SELECT 1 FROM company_profile LIMIT 1);

-- ---------------------------------------------------------------------------
-- REGIONS (Dashboard filter)
-- ---------------------------------------------------------------------------

INSERT INTO regions (name, code) VALUES
    ('North', 'N'),
    ('South', 'S'),
    ('East',  'E'),
    ('West',  'W')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------

INSERT INTO vehicles (registration_number, name, vehicle_type, capacity_kg, odometer_km, status, region_id) VALUES
    ('KA-01-HH-1234', 'Volvo FH16',      'Heavy Truck',  20000, 154200, 'Available', (SELECT id FROM regions WHERE name = 'South')),
    ('MH-04-AB-9876', 'Tata Signa',      'Medium Truck', 10000,  85300, 'On Trip',   (SELECT id FROM regions WHERE name = 'West')),
    ('DL-01-ZA-1122', 'Ashok Leyland',   'Light Truck',   5000,  24100, 'In Shop',   (SELECT id FROM regions WHERE name = 'North')),
    ('TN-09-CD-3344', 'Mahindra Blazo',  'Heavy Truck',  25000, 210500, 'Available', (SELECT id FROM regions WHERE name = 'South')),
    ('GJ-05-XX-5566', 'Eicher Pro',      'Medium Truck',  8000,  45000, 'On Trip',   (SELECT id FROM regions WHERE name = 'West'))
ON CONFLICT (registration_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- DRIVERS
-- ---------------------------------------------------------------------------

INSERT INTO drivers (full_name, license_number, license_category, license_expiry, safety_score, status) VALUES
    ('Rajesh Kumar',   'DL-1998-001', 'Heavy',  '2028-05-12', 95, 'Available'),
    ('Suresh Singh',   'DL-2005-089', 'Heavy',  '2025-11-20', 88, 'On Trip'),
    ('Amit Patel',     'DL-2010-442', 'Light',  '2024-02-15', 72, 'Suspended'),
    ('Vikram Sharma',  'DL-2015-901', 'Medium', '2027-08-30', 91, 'Off Duty'),
    ('Mohammed Ali',   'DL-2018-333', 'Heavy',  '2029-01-10', 98, 'Available')
ON CONFLICT (license_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- TRIPS
-- ---------------------------------------------------------------------------

INSERT INTO trips (trip_code, origin, destination, vehicle_id, driver_id, cargo_weight_kg, status, trip_date, dispatched_at) VALUES
    ('T1001', 'Mumbai',   'Delhi',     (SELECT id FROM vehicles WHERE registration_number = 'MH-04-AB-9876'),
                                        (SELECT id FROM drivers  WHERE full_name = 'Suresh Singh'),
                                        8500, 'Dispatched', '2026-07-10', '2026-07-10 08:00:00+05:30'),
    ('T1002', 'Chennai',  'Bangalore', (SELECT id FROM vehicles WHERE registration_number = 'GJ-05-XX-5566'),
                                        (SELECT id FROM drivers  WHERE full_name = 'Vikram Sharma'),
                                        6200, 'Completed',  '2026-07-08', '2026-07-08 06:00:00+05:30'),
    ('T1003', 'Delhi',    'Jaipur',    (SELECT id FROM vehicles WHERE registration_number = 'KA-01-HH-1234'),
                                        (SELECT id FROM drivers  WHERE full_name = 'Rajesh Kumar'),
                                        12000, 'Draft',     '2026-07-13', NULL)
ON CONFLICT (trip_code) DO NOTHING;

UPDATE trips SET completed_at = '2026-07-08 18:00:00+05:30' WHERE trip_code = 'T1002';

-- ---------------------------------------------------------------------------
-- MAINTENANCE LOGS
-- ---------------------------------------------------------------------------

INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status)
SELECT v.id, 'Engine Repair', 1200.00, '2026-07-11', 'In Progress'
FROM vehicles v WHERE v.registration_number = 'DL-01-ZA-1122'
  AND NOT EXISTS (
    SELECT 1 FROM maintenance_logs m
    WHERE m.vehicle_id = v.id AND m.service_type = 'Engine Repair' AND m.service_date = '2026-07-11'
  );

INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status)
SELECT v.id, 'Oil Change', 150.00, '2026-06-25', 'Completed'
FROM vehicles v WHERE v.registration_number = 'TN-09-CD-3344'
  AND NOT EXISTS (
    SELECT 1 FROM maintenance_logs m
    WHERE m.vehicle_id = v.id AND m.service_type = 'Oil Change' AND m.service_date = '2026-06-25'
  );

UPDATE maintenance_logs
SET completed_at = '2026-06-25 17:00:00+05:30'
WHERE service_type = 'Oil Change' AND vehicle_id = (SELECT id FROM vehicles WHERE registration_number = 'TN-09-CD-3344');

-- ---------------------------------------------------------------------------
-- FUEL LOGS
-- ---------------------------------------------------------------------------

INSERT INTO fuel_logs (vehicle_id, liters, total_cost, location, fuel_date)
SELECT v.id, 120.00, 145.00, 'Mumbai Pump', '2026-07-10'
FROM vehicles v WHERE v.registration_number = 'MH-04-AB-9876'
  AND NOT EXISTS (
    SELECT 1 FROM fuel_logs f WHERE f.vehicle_id = v.id AND f.fuel_date = '2026-07-10' AND f.location = 'Mumbai Pump'
  );

INSERT INTO fuel_logs (vehicle_id, liters, total_cost, location, fuel_date)
SELECT v.id, 85.00, 105.00, 'Highway Station 4', '2026-07-09'
FROM vehicles v WHERE v.registration_number = 'GJ-05-XX-5566'
  AND NOT EXISTS (
    SELECT 1 FROM fuel_logs f WHERE f.vehicle_id = v.id AND f.fuel_date = '2026-07-09' AND f.location = 'Highway Station 4'
  );

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (Topbar badge)
-- ---------------------------------------------------------------------------

INSERT INTO notifications (user_id, title, message, type)
SELECT 1, 'Trip Dispatched', 'Trip T1001 (Mumbai → Delhi) has been dispatched.', 'info'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Trip Dispatched' AND user_id = 1);

INSERT INTO notifications (user_id, title, message, type)
SELECT 1, 'Maintenance Alert', 'Vehicle DL-01-ZA-1122 engine repair is in progress.', 'warning'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Maintenance Alert' AND user_id = 1);

INSERT INTO notifications (user_id, title, message, type)
SELECT 1, 'License Expiring', 'Driver Amit Patel license expires on 2024-02-15.', 'alert'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'License Expiring' AND user_id = 1);

COMMIT;
