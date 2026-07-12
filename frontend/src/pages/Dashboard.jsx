import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { chartData } from '../utils/mockData';
import { fetchDashboardStats } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [filter, setFilter] = useState('All');
  const [kpiData, setKpiData] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchDashboardStats();
        setKpiData(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field">
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="kpi-grid">
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Active Vehicles</span>
            <span className="kpi-value text-info">{loading ? '...' : (kpiData.totalVehicles - kpiData.vehiclesInMaintenance)}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Available Vehicles</span>
            <span className="kpi-value text-success">{loading ? '...' : kpiData.availableVehicles}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">In Maintenance</span>
            <span className="kpi-value text-warning">{loading ? '...' : kpiData.vehiclesInMaintenance}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Active Trips</span>
            <span className="kpi-value text-primary">{loading ? '...' : kpiData.activeTrips}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Pending Trips</span>
            <span className="kpi-value text-secondary">{loading ? '...' : kpiData.pendingTrips}</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Fleet Utilization</span>
            <span className="kpi-value">{loading ? '...' : kpiData.fleetUtilization}%</span>
          </div>
        </Card>
      </div>

      <div className="dashboard-charts">
        <Card title="Fleet Activity & Fuel Consumption" className="chart-card">
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#334155' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="trips" name="Trips" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="fuel" name="Fuel (L)" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
