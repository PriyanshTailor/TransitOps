import { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockDrivers } from '../utils/mockData';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { header: 'Driver Name', accessor: 'name' },
    { header: 'License No', accessor: 'license' },
    { header: 'Category', accessor: 'category' },
    { header: 'Expiry Date', accessor: 'expiry' },
    { 
      header: 'Safety Score', 
      accessor: 'score',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: 'var(--surface-hover)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${row.score}%`, 
              backgroundColor: row.score > 90 ? 'var(--success)' : row.score > 75 ? 'var(--warning)' : 'var(--danger)'
            }} />
          </div>
          <span>{row.score}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Available') variant = 'success';
        if (row.status === 'On Trip') variant = 'info';
        if (row.status === 'Suspended') variant = 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: () => (
        <Button variant="ghost" className="text-sm">View</Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Driver Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Driver'}
        </Button>
      </div>

      {isAdding && (
        <Card title="Add New Driver" className="mb-4">
          <form className="flex-col gap-md" style={{ maxWidth: '500px' }}>
            <Input label="Full Name" placeholder="e.g. John Doe" />
            <Input label="License Number" placeholder="e.g. DL-123456789" />
            <div className="flex gap-md w-full">
              <Input label="Category" placeholder="e.g. Heavy" />
              <Input label="Expiry Date" type="date" />
            </div>
            <Button type="button">Save Driver</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={drivers} />
      </Card>
    </div>
  );
};

export default DriverManagement;
