import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { fetchDashboardStats } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [filter, setFilter] = useState('All');
  const [kpiData, setKpiData] = useState({
    totalVehicles: 0,
    activeTrips: 0,
    vehiclesInShop: 0,
    pendingExpenses: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

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
        {userRole === 'Financial Analyst' ? (
          <>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value text-success">{loading ? '...' : `$${kpiData.totalRevenue}`}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Total Expenses</span>
                <span className="kpi-value text-danger">{loading ? '...' : `$${kpiData.totalExpenses || 0}`}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Fuel Costs</span>
                <span className="kpi-value text-warning">{loading ? '...' : `$${kpiData.totalFuelCost || 0}`}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Pending Approvals</span>
                <span className="kpi-value text-info">{loading ? '...' : kpiData.pendingExpenses}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Net Profit</span>
                <span className="kpi-value text-success">{loading ? '...' : `$${(kpiData.totalRevenue - (kpiData.totalExpenses || 0) - (kpiData.totalFuelCost || 0)).toFixed(2)}`}</span>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Total Vehicles</span>
                <span className="kpi-value text-info">{loading ? '...' : kpiData.totalVehicles}</span>
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
                <span className="kpi-label">Vehicles In Shop</span>
                <span className="kpi-value text-danger">{loading ? '...' : kpiData.vehiclesInShop}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Pending Expenses</span>
                <span className="kpi-value text-warning">{loading ? '...' : kpiData.pendingExpenses}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value text-success">{loading ? '...' : `$${kpiData.totalRevenue}`}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi-content">
                <span className="kpi-label">Fleet Utilization</span>
                <span className="kpi-value">{loading ? '...' : (kpiData.totalVehicles > 0 ? Math.round(((kpiData.totalVehicles - kpiData.vehiclesInShop) / kpiData.totalVehicles) * 100) : 0)}%</span>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="dashboard-charts">
        {userRole === 'Financial Analyst' ? (
          <Card title="Financial Activity (Revenue vs Expenses)" className="chart-card">
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={kpiData.chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#334155' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                  <Bar yAxisId="right" dataKey="expenses" name="Expenses ($)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card title="Fleet Activity & Fuel Consumption" className="chart-card">
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={kpiData.chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
