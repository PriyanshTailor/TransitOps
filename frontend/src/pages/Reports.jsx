import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { fetchReports } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e'];

const Reports = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (analytics.length === 0) return;
    
    // Create CSV headers
    const headers = ['Vehicle Registration', 'Vehicle Name', 'Total Distance (km)', 'Total Revenue ($)', 'Operational Cost ($)', 'Fuel Efficiency (km/L)', 'ROI'];
    
    // Create CSV rows
    const csvRows = analytics.map(row => [
      row.vehicle_reg,
      row.vehicle_name,
      row.total_distance,
      row.total_revenue,
      row.operational_cost,
      row.fuel_efficiency,
      row.roi
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TransitOps_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { header: 'Vehicle', accessor: 'vehicle_reg', render: (row) => `${row.vehicle_reg} (${row.vehicle_name})` },
    { header: 'Total Distance', accessor: 'total_distance', render: (row) => `${row.total_distance} km` },
    { header: 'Total Revenue', accessor: 'total_revenue', render: (row) => `$${row.total_revenue}` },
    { header: 'Operational Cost', accessor: 'operational_cost', render: (row) => `$${row.operational_cost}` },
    { header: 'Fuel Efficiency', accessor: 'fuel_efficiency', render: (row) => `${row.fuel_efficiency} km/L` },
    { 
        header: 'Vehicle ROI', 
        accessor: 'roi',
        render: (row) => {
            const isPositive = !row.roi.startsWith('-');
            return <span style={{color: isPositive && parseFloat(row.roi) > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600}}>{row.roi}</span>;
        }
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <Button onClick={handleExportCSV} variant="success">
          ↓ Export CSV
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Total Distance Driven</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--info)'}}>
                {analytics.reduce((sum, row) => sum + parseFloat(row.total_distance), 0).toFixed(0)} km
            </div>
        </Card>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Fleet Total Revenue</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)'}}>
                ${analytics.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0).toFixed(2)}
            </div>
        </Card>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Fleet Operational Cost</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)'}}>
                ${analytics.reduce((sum, row) => sum + parseFloat(row.operational_cost), 0).toFixed(2)}
            </div>
        </Card>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Avg Fleet ROI</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)'}}>
                {analytics.length > 0 ? (analytics.reduce((sum, row) => sum + parseFloat(row.roi), 0) / analytics.length).toFixed(2) : 0}%
            </div>
        </Card>
      </div>

      {analytics.length > 0 && !loading && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <Card title="Revenue vs Operational Cost">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="vehicle_reg" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Legend />
                  <Bar dataKey="total_revenue" name="Total Revenue ($)" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="operational_cost" name="Operational Cost ($)" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Vehicle Fuel Efficiency (km/L)">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="vehicle_reg" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="fuel_efficiency" name="Fuel Efficiency (km/L)" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Operational Cost Distribution">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <Pie
                    data={analytics.map(item => ({ ...item, numeric_cost: parseFloat(item.operational_cost) }))}
                    dataKey="numeric_cost"
                    nameKey="vehicle_reg"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {analytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <Card title="Vehicle Performance Breakdown">
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Calculating analytics...</div> : <Table columns={columns} data={analytics} />}
      </Card>
    </div>
  );
};

export default Reports;
