import pool from '../db/pool.js';

export const getDrivers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE company_id = $1 ORDER BY created_at DESC', [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

export const createDriver = async (req, res) => {
  const { name, email, phone, address, emergency_contact, license_number, category, license_expiry, joining_date, experience_years, blood_group, medical_fitness, score, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO drivers (company_id, name, email, phone, address, emergency_contact, license_number, category, license_expiry, joining_date, experience_years, blood_group, medical_fitness, score, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [req.user.companyId, name, email, phone, address, emergency_contact, license_number, category, license_expiry, joining_date, experience_years, blood_group, medical_fitness, score || 100, status || 'Available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'License number already exists.' });
    res.status(500).json({ error: 'Failed to create driver' });
  }
};

export const updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, emergency_contact, license_number, category, license_expiry, joining_date, experience_years, blood_group, medical_fitness, score, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE drivers 
       SET name = $1, email = $2, phone = $3, address = $4, emergency_contact = $5, license_number = $6, category = $7, license_expiry = $8, joining_date = $9, experience_years = $10, blood_group = $11, medical_fitness = $12, score = $13, status = $14 
       WHERE id = $15 AND company_id = $16 RETURNING *`,
      [name, email, phone, address, emergency_contact, license_number, category, license_expiry, joining_date, experience_years, blood_group, medical_fitness, score, status, id, req.user.companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'License number already exists.' });
    res.status(500).json({ error: 'Failed to update driver' });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete driver' });
  }
};
