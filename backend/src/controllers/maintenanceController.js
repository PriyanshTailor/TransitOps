import pool from '../db/pool.js';

export const getMaintenance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, v.reg_number as vehicle_reg, v.name as vehicle_name 
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.company_id = $1
      ORDER BY m.created_at DESC
    `, [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

export const createMaintenance = async (req, res) => {
  const { vehicle_id, maintenance_type, service_type, mechanic, garage, priority, estimated_cost, service_date, status } = req.body;
  try {
    await pool.query('BEGIN');
    
    // Create record
    const result = await pool.query(
      `INSERT INTO maintenance_records (company_id, vehicle_id, maintenance_type, service_type, mechanic, garage, priority, estimated_cost, service_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.companyId, vehicle_id, maintenance_type || 'Corrective', service_type, mechanic, garage, priority || 'Medium', estimated_cost || 0, service_date, status || 'In Progress']
    );

    // If In Progress, update vehicle to In Shop
    if (status === 'In Progress') {
      await pool.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle_id]);
    }

    await pool.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create maintenance record' });
  }
};

export const updateMaintenance = async (req, res) => {
  const { id } = req.params;
  const { vehicle_id, maintenance_type, service_type, mechanic, garage, priority, estimated_cost, actual_cost, service_date, completion_date, parts_replaced, status } = req.body;
  try {
    await pool.query('BEGIN');
    
    const result = await pool.query(
      `UPDATE maintenance_records 
       SET maintenance_type = $1, service_type = $2, mechanic = $3, garage = $4, priority = $5, estimated_cost = $6, actual_cost = $7, service_date = $8, completion_date = $9, parts_replaced = $10, status = $11
       WHERE id = $12 AND company_id = $13 RETURNING *`,
      [maintenance_type, service_type, mechanic, garage, priority, estimated_cost, actual_cost, service_date, completion_date, parts_replaced, status, id, req.user.companyId]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    // Handle Vehicle Status
    if (status === 'Completed') {
      await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [vehicle_id]);
    } else if (status === 'In Progress') {
      await pool.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle_id]);
    }

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update maintenance record' });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_records WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
};
