import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { getHeaders } from '../services/api';

const API_URL = 'http://localhost:5000/api';

const fetchAuditLogs = async () => {
  const response = await fetch(`${API_URL}/audit-logs`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Timestamp', accessor: 'created_at', render: (row) => new Date(row.created_at).toLocaleString() },
    { header: 'User', accessor: 'user_name', render: (row) => <div><strong>{row.user_name}</strong><br/><small>{row.user_role}</small></div> },
    { header: 'Action', accessor: 'action', render: (row) => <Badge variant="info">{row.action}</Badge> },
    { header: 'Entity', accessor: 'entity_type', render: (row) => `${row.entity_type} (#${row.entity_id})` },
    { header: 'Details', accessor: 'details' }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>System Audit Logs</h2>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading logs...</div> : <Table columns={columns} data={logs} />}
      </Card>
    </div>
  );
};

export default AuditLogs;
