import pool from '../db/pool.js';

export const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name as user_name, u.role as user_role 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.company_id = $1
      ORDER BY a.created_at DESC
      LIMIT 100
    `, [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
