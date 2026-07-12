import pool from '../db/pool.js';

export const getFuel = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, v.reg_number as vehicle_reg, d.name as driver_name 
      FROM fuel_records f
      JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
      WHERE f.company_id = $1
      ORDER BY f.created_at DESC
    `, [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fuel records' });
  }
};

export const createFuel = async (req, res) => {
  const { vehicle_id, driver_id, fuel_station, fuel_type, liters, price_per_liter, total_cost, odometer_before, odometer_after, fuel_date, location } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO fuel_records (company_id, vehicle_id, driver_id, fuel_station, fuel_type, liters, price_per_liter, total_cost, odometer_before, odometer_after, fuel_date, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [req.user.companyId, vehicle_id, driver_id || null, fuel_station, fuel_type, liters, price_per_liter, total_cost, odometer_before, odometer_after, fuel_date, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fuel record' });
  }
};

export const deleteFuel = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fuel_records WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete fuel record' });
  }
};
