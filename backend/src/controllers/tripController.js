import pool from '../db/pool.js';
import { logAudit } from '../utils/auditLogger.js';

export const getTrips = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, v.reg_number as vehicle_reg, v.name as vehicle_name, d.name as driver_name 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.company_id = $1 
      ORDER BY t.created_at DESC
    `, [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req, res) => {
  const { 
    trip_number, origin, destination, vehicle_id, driver_id, cargo_weight, 
    cargo_type, expected_distance, expected_time, expected_fuel, expected_cost, 
    revenue, route_details, trip_date 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO trips (
        company_id, trip_number, origin, destination, vehicle_id, driver_id, 
        cargo_weight, cargo_type, expected_distance, expected_time, expected_fuel, 
        expected_cost, revenue, route_details, trip_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Draft') RETURNING *`,
      [req.user.companyId, trip_number, origin, destination, vehicle_id || null, driver_id || null, cargo_weight, cargo_type, expected_distance, expected_time, expected_fuel, expected_cost, revenue || 0, route_details, trip_date]
    );
    
    await logAudit(req.user.companyId, req.user.id, 'CREATE_TRIP', 'trips', result.rows[0].id, `Created trip ${trip_number}`);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Trip number already exists.' });
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Statuses: Draft, Assigned, Approved, Dispatched, In Transit, Completed, Archived

  try {
    await pool.query('BEGIN');
    
    // Get current trip
    const tripRes = await pool.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2', [id, req.user.companyId]);
    if (tripRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Trip not found' });
    }
    const trip = tripRes.rows[0];

    // Business Rules for Dispatching
    if (status === 'Dispatched') {
      if (!trip.vehicle_id || !trip.driver_id) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot dispatch without a vehicle and driver.' });
      }
      // Check if vehicle/driver are available
      const vRes = await pool.query('SELECT status FROM vehicles WHERE id = $1', [trip.vehicle_id]);
      const dRes = await pool.query('SELECT status FROM drivers WHERE id = $1', [trip.driver_id]);
      
      if (vRes.rows[0].status !== 'Available' || dRes.rows[0].status !== 'Available') {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Vehicle or Driver is not currently Available.' });
      }

      // Lock them to "On Trip"
      await pool.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [trip.vehicle_id]);
      await pool.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [trip.driver_id]);
    }

    // Business Rules for Completion
    if (status === 'Completed' || status === 'Archived') {
      if (trip.status === 'Dispatched' || trip.status === 'In Transit') {
        // Free them up
        if (trip.vehicle_id) await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
        if (trip.driver_id) await pool.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
      }
    }

    // Update Trip Status
    const result = await pool.query(
      'UPDATE trips SET status = $1 WHERE id = $2 AND company_id = $3 RETURNING *',
      [status, id, req.user.companyId]
    );

    await logAudit(req.user.companyId, req.user.id, 'UPDATE_TRIP_STATUS', 'trips', id, `Updated trip status from ${trip.status} to ${status}`);

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update trip status' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trips WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};
