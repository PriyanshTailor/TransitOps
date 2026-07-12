import pool from '../db/pool.js';

export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id = $1 AND company_id = $2
      ORDER BY created_at DESC
      LIMIT 20
    `, [req.user.id, req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 AND company_id = $3',
      [id, req.user.id, req.user.companyId]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const createNotification = async (companyId, userId, message, type) => {
  try {
    await pool.query(
      'INSERT INTO notifications (company_id, user_id, message, type) VALUES ($1, $2, $3, $4)',
      [companyId, userId, message, type || 'info']
    );
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};
