import { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockMaintenance, mockVehicles } from '../utils/mockData';

const Maintenance = () => {
  const [logs, setLogs] = useState(mockMaintenance);
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { header: 'Log ID', accessor: 'id' },
    { header: 'Vehicle Reg', accessor: 'vehicle' },
    { header: 'Service Type', accessor: 'type' },
    { header: 'Cost', accessor: 'cost' },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        row.status === 'In Progress' && <Button variant="success" className="text-sm">Mark Complete</Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Maintenance Logs</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ New Record'}
        </Button>
      </div>

      {isAdding && (
        <Card title="Log Maintenance" className="mb-4">
          <form className="flex-col gap-md" style={{ maxWidth: '500px' }}>
            <div className="input-group">
              <label className="input-label">Vehicle</label>
              <select className="input-field" required>
                <option value="">Select Vehicle</option>
                {mockVehicles.map(v => (
                  <option key={v.id} value={v.reg}>{v.reg} - {v.name}</option>
                ))}
              </select>
            </div>
            <Input label="Service Type" placeholder="e.g. Oil Change, Tire Replacement" />
            <Input label="Cost ($)" type="number" />
            <Input label="Date" type="date" />
            <Button type="button">Save Record</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={logs} />
      </Card>
    </div>
  );
};

export default Maintenance;
