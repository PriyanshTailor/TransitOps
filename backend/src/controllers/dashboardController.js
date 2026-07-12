import pool from '../db/pool.js';

export const getDashboardStats = async (req, res) => {
  const { companyId } = req.user;
  try {
    const totalVehiclesRes = await pool.query('SELECT COUNT(*) FROM vehicles WHERE company_id = $1', [companyId]);
    const availableVehiclesRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status = 'Available'", [companyId]);
    const inShopVehiclesRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE company_id = $1 AND status = 'In Shop'", [companyId]);
    const activeTripsRes = await pool.query("SELECT COUNT(*) FROM trips WHERE company_id = $1 AND status = 'Dispatched'", [companyId]);
    const pendingTripsRes = await pool.query("SELECT COUNT(*) FROM trips WHERE company_id = $1 AND status = 'Draft'", [companyId]);
    const driversOnDutyRes = await pool.query("SELECT COUNT(*) FROM drivers WHERE company_id = $1 AND status = 'On Trip'", [companyId]);
    
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
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
