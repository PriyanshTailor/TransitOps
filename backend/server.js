import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Helper for JWT
const generateToken = (userId, companyId) => {
  return jwt.sign({ userId, companyId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, companyName } = req.body;

  try {
    // 1. Validate constraints
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // 2. Check if user already exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Start a transaction since we insert into multiple tables
    await pool.query('BEGIN');

    // 4. Create Company
    const companyRes = await pool.query(
      'INSERT INTO companies (name) VALUES ($1) RETURNING id',
      [companyName]
    );
    const companyId = companyRes.rows[0].id;

    // 5. Create User
    const userRes = await pool.query(
      'INSERT INTO users (company_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role',
      [companyId, email, passwordHash, name, 'Admin']
    );
    const user = userRes.rows[0];

    await pool.query('COMMIT');

    // 6. Generate Token
    const token = generateToken(user.id, companyId);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email,
        role: user.role,
        companyId
      }
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Signup error:', err);
    // Handle unique constraint violations
    if (err.code === '23505') {
        return res.status(400).json({ error: 'Company name already exists or Email already exists.' });
    }
    res.status(500).json({ error: 'Server error during signup.' });
  }
});


// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Find user
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate token
    const token = generateToken(user.id, user.company_id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company_id
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});


// Add a protected route example (just for testing authentication middleware later)
app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRes = await pool.query('SELECT id, name, email, role, company_id FROM users WHERE id = $1', [decoded.userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: userRes.rows[0] });
    } catch(err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

// ----------------------------------------------------
// MIDDLEWARE: AUTHENTICATION
// ----------------------------------------------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains userId and companyId
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// ----------------------------------------------------
// DASHBOARD ROUTES
// ----------------------------------------------------
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  try {
    const totalVehiclesRes = await pool.query('SELECT COUNT(*) FROM vehicles WHERE company_id = $1', [companyId]);
    const availableVehiclesRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status = 'Available'", [companyId]);
    const inShopVehiclesRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status = 'In Shop'", [companyId]);
    const activeTripsRes = await pool.query("SELECT COUNT(*) FROM trips WHERE company_id = $1 AND status = 'Dispatched'", [companyId]);
    const pendingTripsRes = await pool.query("SELECT COUNT(*) FROM trips WHERE company_id = $1 AND status = 'Draft'", [companyId]);
    const driversOnDutyRes = await pool.query("SELECT COUNT(*) FROM drivers WHERE company_id = $1 AND status = 'On Trip'", [companyId]);
    
    // Quick fleet utilization calculation (Active Trips / Total Vehicles)
    const totalV = parseInt(totalVehiclesRes.rows[0].count);
    const activeT = parseInt(activeTripsRes.rows[0].count);
    const utilization = totalV > 0 ? Math.round((activeT / totalV) * 100) : 0;

    res.json({
      totalVehicles: totalV,
      availableVehicles: parseInt(availableVehiclesRes.rows[0].count),
      vehiclesInMaintenance: parseInt(inShopVehiclesRes.rows[0].count),
      activeTrips: activeT,
      pendingTrips: parseInt(pendingTripsRes.rows[0].count),
      driversOnDuty: parseInt(driversOnDutyRes.rows[0].count),
      fleetUtilization: utilization
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ----------------------------------------------------
// VEHICLE ROUTES
// ----------------------------------------------------

// GET All Vehicles
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Vehicles Error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// POST Create Vehicle
app.post('/api/vehicles', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicles (company_id, reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, reg_number, name, vehicle_type, capacity, odometer || 0, acquisition_cost || 0.00, status || 'Available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Vehicle Error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'Registration number already exists.' });
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT Update Vehicle
app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vehicles 
       SET reg_number = $1, name = $2, vehicle_type = $3, capacity = $4, odometer = $5, acquisition_cost = $6, status = $7 
       WHERE id = $8 AND company_id = $9 RETURNING *`,
      [reg_number, name, vehicle_type, capacity, odometer, acquisition_cost, status, id, companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Vehicle Error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'Registration number already exists.' });
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE Vehicle
app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 AND company_id = $2 RETURNING id', [id, companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error('Delete Vehicle Error:', err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// ----------------------------------------------------
// DRIVER ROUTES
// ----------------------------------------------------

// GET All Drivers
app.get('/api/drivers', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Drivers Error:', err);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// POST Create Driver
app.post('/api/drivers', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { name, license_number, category, license_expiry, contact_number, score, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO drivers (company_id, name, license_number, category, license_expiry, contact_number, score, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, name, license_number, category, license_expiry, contact_number, score || 100, status || 'Available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Driver Error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'License number already exists.' });
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// PUT Update Driver
app.put('/api/drivers/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { name, license_number, category, license_expiry, contact_number, score, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE drivers 
       SET name = $1, license_number = $2, category = $3, license_expiry = $4, contact_number = $5, score = $6, status = $7 
       WHERE id = $8 AND company_id = $9 RETURNING *`,
      [name, license_number, category, license_expiry, contact_number, score, status, id, companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update Driver Error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'License number already exists.' });
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// DELETE Driver
app.delete('/api/drivers/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 AND company_id = $2 RETURNING id', [id, companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Delete Driver Error:', err);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// ----------------------------------------------------
// TRIP ROUTES
// ----------------------------------------------------

// GET All Trips (with Vehicle Reg and Driver Name)
app.get('/api/trips', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  try {
    const result = await pool.query(`
      SELECT t.*, v.reg_number as vehicle_reg, d.name as driver_name 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.company_id = $1
      ORDER BY t.created_at DESC
    `, [companyId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch Trips Error:', err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST Create Trip
app.post('/api/trips', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { origin, destination, vehicle_id, driver_id, weight, distance, status, trip_date } = req.body;
  try {
    await pool.query('BEGIN');
    
    // Check if vehicle exists and capacity is sufficient
    const vRes = await pool.query('SELECT capacity FROM vehicles WHERE id = $1 AND company_id = $2', [vehicle_id, companyId]);
    if (vRes.rows.length === 0) throw new Error('Vehicle not found');
    
    // Parse weight and capacity to numeric for comparison. We assume formats like "8,500 kg" or just numeric strings.
    const vehicleCap = parseFloat(vRes.rows[0].capacity.replace(/,/g, '').replace('kg', '').trim()) || 0;
    const tripWeight = parseFloat(weight.toString().replace(/,/g, '').replace('kg', '').trim()) || 0;
    
    if (tripWeight > vehicleCap) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: `Cargo weight (${tripWeight}kg) exceeds vehicle maximum capacity (${vehicleCap}kg).` });
    }

    const result = await pool.query(
      `INSERT INTO trips (company_id, origin, destination, vehicle_id, driver_id, weight, distance, status, trip_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, origin, destination, vehicle_id, driver_id, weight, distance || 0.00, status || 'Draft', trip_date]
    );
    const newTrip = result.rows[0];

    // If initial status is Dispatched, update vehicle and driver status
    if (status === 'Dispatched') {
      await pool.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [vehicle_id]);
      await pool.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [driver_id]);
    }

    await pool.query('COMMIT');
    res.status(201).json(newTrip);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Create Trip Error:', err);
    res.status(500).json({ error: err.message || 'Failed to create trip' });
  }
});

// PUT Update Trip
app.put('/api/trips/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { origin, destination, vehicle_id, driver_id, weight, distance, status, trip_date } = req.body;
  try {
    await pool.query('BEGIN');

    // Get old trip state to detect status changes
    const oldTripRes = await pool.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2', [id, companyId]);
    if (oldTripRes.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Trip not found' });
    }
    const oldTrip = oldTripRes.rows[0];

    // Validate weight limit again if changed
    const vRes = await pool.query('SELECT capacity FROM vehicles WHERE id = $1 AND company_id = $2', [vehicle_id, companyId]);
    if (vRes.rows.length > 0) {
      const vehicleCap = parseFloat(vRes.rows[0].capacity.replace(/,/g, '').replace('kg', '').trim()) || 0;
      const tripWeight = parseFloat(weight.toString().replace(/,/g, '').replace('kg', '').trim()) || 0;
      if (tripWeight > vehicleCap) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: `Cargo weight (${tripWeight}kg) exceeds vehicle maximum capacity (${vehicleCap}kg).` });
      }
    }

    const result = await pool.query(
      `UPDATE trips 
       SET origin = $1, destination = $2, vehicle_id = $3, driver_id = $4, weight = $5, distance = $6, status = $7, trip_date = $8 
       WHERE id = $9 AND company_id = $10 RETURNING *`,
      [origin, destination, vehicle_id, driver_id, weight, distance, status, trip_date, id, companyId]
    );

    // Handle Status Transitions
    if (oldTrip.status !== status) {
        if (status === 'Dispatched') {
            await pool.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [vehicle_id]);
            await pool.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [driver_id]);
        } else if (status === 'Completed' || status === 'Cancelled') {
            // Restore old vehicle/driver to available if they were on this trip
            await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [oldTrip.vehicle_id]);
            await pool.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [oldTrip.driver_id]);
        }
    }

    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Update Trip Error:', err);
    res.status(500).json({ error: err.message || 'Failed to update trip' });
  }
});

// DELETE Trip
app.delete('/api/trips/:id', authMiddleware, async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    const oldTripRes = await pool.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2', [id, companyId]);
    if (oldTripRes.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Trip not found' });
    }
    const oldTrip = oldTripRes.rows[0];

    // If it was dispatched, we must free the resources before deleting
    if (oldTrip.status === 'Dispatched') {
        await pool.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [oldTrip.vehicle_id]);
        await pool.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [oldTrip.driver_id]);
    }

    await pool.query('DELETE FROM trips WHERE id = $1', [id]);
    await pool.query('COMMIT');
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Delete Trip Error:', err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
