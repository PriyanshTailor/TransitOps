import pool from '../db/pool.js';

export const getVehicles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE company_id = $1 ORDER BY created_at DESC', [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const createVehicle = async (req, res) => {
  const { reg_number, name, model, manufacturer, year, vin_number, vehicle_type, capacity, fuel_type, odometer, acquisition_cost, purchase_date, insurance_details, insurance_expiry, gps_device_id, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicles (company_id, reg_number, name, model, manufacturer, year, vin_number, vehicle_type, capacity, fuel_type, odometer, acquisition_cost, purchase_date, insurance_details, insurance_expiry, gps_device_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [req.user.companyId, reg_number, name, model, manufacturer, year, vin_number, vehicle_type, capacity, fuel_type, odometer || 0, acquisition_cost || 0, purchase_date, insurance_details, insurance_expiry, gps_device_id, status || 'Available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Registration number or VIN already exists.' });
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { reg_number, name, model, manufacturer, year, vin_number, vehicle_type, capacity, fuel_type, odometer, acquisition_cost, purchase_date, insurance_details, insurance_expiry, gps_device_id, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vehicles 
       SET reg_number = $1, name = $2, model = $3, manufacturer = $4, year = $5, vin_number = $6, vehicle_type = $7, capacity = $8, fuel_type = $9, odometer = $10, acquisition_cost = $11, purchase_date = $12, insurance_details = $13, insurance_expiry = $14, gps_device_id = $15, status = $16 
       WHERE id = $17 AND company_id = $18 RETURNING *`,
      [reg_number, name, model, manufacturer, year, vin_number, vehicle_type, capacity, fuel_type, odometer, acquisition_cost, purchase_date, insurance_details, insurance_expiry, gps_device_id, status, id, req.user.companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Registration number or VIN already exists.' });
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};
