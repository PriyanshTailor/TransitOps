import { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockTrips, mockVehicles, mockDrivers } from '../utils/mockData';

const TripManagement = () => {
  const [trips, setTrips] = useState(mockTrips);
  const [isAdding, setIsAdding] = useState(false);
  
  // Trip Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const [weight, setWeight] = useState('');

  const columns = [
    { header: 'Trip ID', accessor: 'id' },
    { header: 'Origin', accessor: 'origin' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Driver', accessor: 'driver' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Completed') variant = 'success';
        if (row.status === 'Dispatched') variant = 'info';
        if (row.status === 'Draft') variant = 'warning';
        if (row.status === 'Cancelled') variant = 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-sm">
          {row.status === 'Draft' && <Button variant="primary" className="text-sm">Dispatch</Button>}
          {row.status === 'Dispatched' && <Button variant="success" className="text-sm">Complete</Button>}
        </div>
      )
    }
  ];

  const availableVehicles = mockVehicles.filter(v => v.status === 'Available');
  const availableDrivers = mockDrivers.filter(d => d.status === 'Available');

  const handleCreateTrip = (e) => {
    e.preventDefault();
    alert('Trip created (draft)');
    setIsAdding(false);
  };

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Trip Dispatcher</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Create Trip'}
        </Button>
      </div>

      {isAdding && (
        <Card title="New Trip Dispatch" className="mb-4">
          <form onSubmit={handleCreateTrip} className="flex-col gap-md" style={{ maxWidth: '600px' }}>
            <div className="flex gap-md w-full">
              <Input label="Source" placeholder="e.g. Warehouse A" value={source} onChange={(e)=>setSource(e.target.value)} required />
              <Input label="Destination" placeholder="e.g. Retail B" value={destination} onChange={(e)=>setDestination(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label className="input-label">Select Vehicle</label>
              <select className="input-field" value={vehicle} onChange={(e)=>setVehicle(e.target.value)} required>
                <option value="">-- Choose Available Vehicle --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.reg}>{v.reg} - {v.name} (Max: {v.capacity})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Select Driver</label>
              <select className="input-field" value={driver} onChange={(e)=>setDriver(e.target.value)} required>
                <option value="">-- Choose Available Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.category})</option>
                ))}
              </select>
            </div>

            <Input label="Cargo Weight (kg)" type="number" value={weight} onChange={(e)=>setWeight(e.target.value)} required />

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Draft Trip</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={trips} />
      </Card>
    </div>
  );
};

export default TripManagement;
