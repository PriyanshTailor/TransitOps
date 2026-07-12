import pool from '../db/pool.js';

export const getDashboardStats = async (req, res) => {
  const companyId = req.user.companyId;

  try {
    // 1. Total active vehicles
    const vehiclesRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status != 'Retired'", [companyId]);
    const totalVehicles = parseInt(vehiclesRes.rows[0].count);

    // 2. Active Trips
    const tripsRes = await pool.query("SELECT COUNT(*) FROM trips WHERE company_id = $1 AND status IN ('Dispatched', 'In Transit')", [companyId]);
    const activeTrips = parseInt(tripsRes.rows[0].count);

    // 3. Vehicles in Shop
    const shopRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status = 'In Shop'", [companyId]);
    const vehiclesInShop = parseInt(shopRes.rows[0].count);

    // 4. Pending Expenses
    const expRes = await pool.query("SELECT COUNT(*) FROM expenses WHERE company_id = $1 AND approval_status = 'Pending'", [companyId]);
    const pendingExpenses = parseInt(expRes.rows[0].count);

    // 5. Total Revenue (Completed Trips this month - simplified to all time for now)
    const revRes = await pool.query("SELECT SUM(revenue) FROM trips WHERE company_id = $1 AND status = 'Completed'", [companyId]);
    const totalRevenue = revRes.rows[0].sum || 0;

    res.json({
      totalVehicles,
      activeTrips,
      vehiclesInShop,
      pendingExpenses,
      totalRevenue
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};
