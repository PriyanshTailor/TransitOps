import pool from '../db/pool.js';

export const getReports = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Complex query to get vehicle performance breakdown
    const query = `
      SELECT 
        v.reg_number AS vehicle_reg,
        v.name AS vehicle_name,
        COALESCE(SUM(t.expected_distance), 0) AS total_distance,
        COALESCE(SUM(t.revenue), 0) AS total_revenue,
        COALESCE(SUM(t.actual_cost), 0) + 
        COALESCE((SELECT SUM(f.total_cost) FROM fuel_records f WHERE f.vehicle_id = v.id), 0) +
        COALESCE((SELECT SUM(m.actual_cost) FROM maintenance_records m WHERE m.vehicle_id = v.id), 0) AS operational_cost,
        
        -- Fuel Efficiency: Total Distance / Total Liters
        CASE WHEN COALESCE((SELECT SUM(f.liters) FROM fuel_records f WHERE f.vehicle_id = v.id), 0) > 0 
             THEN ROUND((COALESCE(SUM(t.expected_distance), 0) / (SELECT SUM(f.liters) FROM fuel_records f WHERE f.vehicle_id = v.id))::numeric, 2)
             ELSE 0 
        END AS fuel_efficiency,
        
        -- ROI = ((Total Revenue - Operational Cost) / Acquisition Cost) * 100
        CASE WHEN v.acquisition_cost > 0 
             THEN ROUND((((COALESCE(SUM(t.revenue), 0) - (COALESCE(SUM(t.actual_cost), 0) + COALESCE((SELECT SUM(f.total_cost) FROM fuel_records f WHERE f.vehicle_id = v.id), 0) + COALESCE((SELECT SUM(m.actual_cost) FROM maintenance_records m WHERE m.vehicle_id = v.id), 0))) / v.acquisition_cost) * 100)::numeric, 2)
             ELSE 0
        END AS roi
        
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
      WHERE v.company_id = $1
      GROUP BY v.id
    `;
    
    const result = await pool.query(query, [companyId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};
