import pool from '../db/pool.js';

export const getExpenses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM expenses 
      WHERE company_id = $1 
      ORDER BY created_at DESC
    `, [req.user.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req, res) => {
  const { category, vendor, amount, gst, payment_method, expense_date, notes } = req.body;
  
  // Financial Analyst and Admin auto-approve. Drivers stay pending.
  const approval_status = (req.user.role === 'Super Admin' || req.user.role === 'Financial Analyst') ? 'Approved' : 'Pending';

  try {
    const result = await pool.query(
      `INSERT INTO expenses (company_id, category, vendor, amount, gst, payment_method, expense_date, notes, approval_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.companyId, category, vendor, amount, gst || 0, payment_method, expense_date, notes, approval_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpenseStatus = async (req, res) => {
  const { id } = req.params;
  const { approval_status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE expenses SET approval_status = $1 WHERE id = $2 AND company_id = $3 RETURNING *',
      [approval_status, id, req.user.companyId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense status' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND company_id = $2 RETURNING id', [req.params.id, req.user.companyId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
