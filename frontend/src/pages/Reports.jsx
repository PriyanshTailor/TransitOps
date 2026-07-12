import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { fetchReports } from '../services/api';

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
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Fleet Total Revenue</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                ${analytics.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0).toFixed(2)}
            </div>
        </Card>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Fleet Operational Cost</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                ${analytics.reduce((sum, row) => sum + parseFloat(row.operational_cost), 0).toFixed(2)}
            </div>
        </Card>
        <Card>
            <h3 style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Avg Fleet ROI</h3>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                {analytics.length > 0 ? (analytics.reduce((sum, row) => sum + parseFloat(row.roi), 0) / analytics.length).toFixed(2) : 0}%
            </div>
        </Card>
      </div>

      <Card title="Vehicle Performance Breakdown">
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Calculating analytics...</div> : <Table columns={columns} data={analytics} />}
      </Card>
    </div>
  );
};

export default Reports;
