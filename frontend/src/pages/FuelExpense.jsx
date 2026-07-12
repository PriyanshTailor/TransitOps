import { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockFuel, mockVehicles } from '../utils/mockData';

const FuelExpense = () => {
  const [logs, setLogs] = useState(mockFuel);
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { header: 'Log ID', accessor: 'id' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Liters', accessor: 'liters' },
    { header: 'Cost', accessor: 'cost' },
    { header: 'Location', accessor: 'location' },
    { header: 'Date', accessor: 'date' },
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Fuel & Expense Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Log Fuel'}
        </Button>
      </div>

      {isAdding && (
        <Card title="Add Fuel Log" className="mb-4">
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
            <div className="flex gap-md w-full">
              <Input label="Liters" type="number" step="0.1" />
              <Input label="Total Cost ($)" type="number" step="0.01" />
            </div>
            <Input label="Gas Station Location" placeholder="e.g. Highway Pump 4" />
            <Input label="Date" type="date" />
            <Button type="button">Save Log</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={logs} />
      </Card>
    </div>
  );
};

export default FuelExpense;
