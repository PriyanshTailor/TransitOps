import { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockVehicles } from '../utils/mockData';

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { header: 'Registration', accessor: 'reg' },
    { header: 'Name/Model', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Capacity', accessor: 'capacity' },
    { header: 'Odometer (km)', accessor: 'odometer' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Available') variant = 'success';
        if (row.status === 'On Trip') variant = 'info';
        if (row.status === 'In Shop') variant = 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: () => (
        <Button variant="ghost" className="text-sm">Edit</Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Vehicle Registry</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Vehicle'}
        </Button>
      </div>

      {isAdding && (
        <Card title="Add New Vehicle" className="mb-4">
          <form className="flex-col gap-md" style={{ maxWidth: '500px' }}>
            <Input label="Registration Number" placeholder="e.g. MH-01-AB-1234" />
            <Input label="Vehicle Name/Model" placeholder="e.g. Volvo FH16" />
            <div className="flex gap-md w-full">
              <Input label="Maximum Capacity (kg)" type="number" />
              <Input label="Initial Odometer" type="number" />
            </div>
            <Button type="button">Save Vehicle</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={vehicles} />
      </Card>
    </div>
  );
};

export default VehicleRegistry;
