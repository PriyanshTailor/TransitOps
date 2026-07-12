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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
