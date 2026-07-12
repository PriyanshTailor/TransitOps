import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';

export const signup = async (req, res) => {
  const { name, email, password, companyName, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    
    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await pool.query('BEGIN');
    
    // Check if company exists, if not create
    let companyId;
    const finalCompanyName = companyName || 'TransitOps';
    const compRes = await pool.query('SELECT id FROM companies WHERE name = $1', [finalCompanyName]);
    if (compRes.rows.length > 0) {
      companyId = compRes.rows[0].id;
    } else {
      const newComp = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [finalCompanyName]);
      companyId = newComp.rows[0].id;
    }

    // Get Role ID
    const finalRole = role || 'Super Admin';
    const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [finalRole]);
    const roleId = roleRes.rows.length > 0 ? roleRes.rows[0].id : 1;

    // Create User
    const userRes = await pool.query(
      'INSERT INTO users (company_id, role_id, email, password_hash, name) VALUES ($1, $2, $3, $4, $5) RETURNING id, name',
      [companyId, roleId, email, passwordHash, name]
    );
    const user = userRes.rows[0];

    await pool.query('COMMIT');

    const accessToken = generateAccessToken(user.id, companyId, finalRole);
    const refreshToken = generateRefreshToken(user.id, companyId, finalRole);

    res.status(201).json({
      message: 'Signup successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email,
        role: finalRole,
        companyId
      }
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const userRes = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = $1
    `, [email]);

    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
    
    const user = userRes.rows[0];
    if (user.status !== 'Active') return res.status(403).json({ error: 'Account is deactivated.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    const accessToken = generateAccessToken(user.id, user.company_id, user.role_name);
    const refreshToken = generateRefreshToken(user.id, user.company_id, user.role_name);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        companyId: user.company_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.userId, decoded.companyId, decoded.role);
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const me = async (req, res) => {
  try {
    const userRes = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.company_id, r.name as role 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1
    `, [req.user.userId]);
    
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userRes.rows[0] });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
};
