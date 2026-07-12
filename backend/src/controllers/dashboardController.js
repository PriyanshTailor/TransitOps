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

    // 6. Total Expenses
    const totExpRes = await pool.query("SELECT SUM(amount) FROM expenses WHERE company_id = $1 AND approval_status = 'Approved'", [companyId]);
    const totalExpenses = totExpRes.rows[0].sum || 0;

    // 7. Total Fuel Cost
    const fuelRes = await pool.query("SELECT SUM(total_cost) FROM fuel_records WHERE company_id = $1", [companyId]);
    const totalFuelCost = fuelRes.rows[0].sum || 0;

    // 8. Dynamic Chart Data (Last 6 Months)
    const chartRes = await pool.query(`
      SELECT 
        months.month_name as name,
        COALESCE(t.trips_count, 0)::numeric as trips,
        COALESCE(t.revenue, 0)::numeric as revenue,
        COALESCE(f.fuel_liters, 0)::numeric as fuel,
        COALESCE(e.expenses, 0)::numeric as expenses
      FROM (
        SELECT TO_CHAR(current_date - interval '1 month' * s.i, 'Mon') as month_name,
               DATE_TRUNC('month', current_date - interval '1 month' * s.i) as month_date
        FROM generate_series(5, 0, -1) AS s(i)
      ) months
      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) as month_date, COUNT(*) as trips_count, SUM(revenue) as revenue
        FROM trips WHERE company_id = $1 GROUP BY 1
      ) t ON months.month_date = t.month_date
      LEFT JOIN (
        SELECT DATE_TRUNC('month', fuel_date) as month_date, SUM(liters) as fuel_liters
        FROM fuel_records WHERE company_id = $1 GROUP BY 1
      ) f ON months.month_date = f.month_date
      LEFT JOIN (
        SELECT DATE_TRUNC('month', expense_date) as month_date, SUM(amount) as expenses
        FROM expenses WHERE company_id = $1 AND approval_status = 'Approved' GROUP BY 1
      ) e ON months.month_date = e.month_date
      ORDER BY months.month_date ASC
    `, [companyId]);

    const chartData = chartRes.rows.map(row => ({
      name: row.name,
      trips: Number(row.trips),
      revenue: Number(row.revenue),
      fuel: Number(row.fuel),
      expenses: Number(row.expenses)
    }));

    res.json({
      totalVehicles,
      activeTrips,
      vehiclesInShop,
      pendingExpenses,
      totalRevenue,
      totalExpenses,
      totalFuelCost,
      chartData
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

export const globalSearch = async (req, res) => {
  const companyId = req.user.companyId;
  const q = req.query.q || '';
  
  if (q.length < 2) return res.json({ vehicles: [], drivers: [], trips: [] });
  
  try {
    const searchTerm = `%${q}%`;
    
    const vehiclesRes = await pool.query(
      "SELECT id, name, reg_number, status FROM vehicles WHERE company_id = $1 AND (name ILIKE $2 OR reg_number ILIKE $2) LIMIT 5",
      [companyId, searchTerm]
    );
    
    const driversRes = await pool.query(
      "SELECT id, name, license_number, status FROM drivers WHERE company_id = $1 AND (name ILIKE $2 OR license_number ILIKE $2) LIMIT 5",
      [companyId, searchTerm]
    );
    
    const tripsRes = await pool.query(
      "SELECT id, origin, destination, status FROM trips WHERE company_id = $1 AND (origin ILIKE $2 OR destination ILIKE $2) LIMIT 5",
      [companyId, searchTerm]
    );
    
    res.json({
      vehicles: vehiclesRes.rows,
      drivers: driversRes.rows,
      trips: tripsRes.rows
    });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: 'Search failed' });
  }
};
