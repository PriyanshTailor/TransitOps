import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchTrips, createTrip, updateTrip, deleteTrip, fetchVehicles, fetchDrivers } from '../services/api';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  // Trip Form State
  const [formData, setFormData] = useState({
    origin: '', destination: '', vehicle_id: '', driver_id: '', weight: '', distance: '', status: 'Draft', trip_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        fetchTrips(),
        fetchVehicles(),
        fetchDrivers()
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTrip(formData);
      setIsAdding(false);
      resetForm();
      loadData(); // Reload everything to update vehicle/driver statuses if dispatched
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (trip, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this trip as ${newStatus}?`)) return;
    try {
      await updateTrip(trip.id, { ...trip, status: newStatus });
      loadData(); // Reload to update statuses
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ origin: '', destination: '', vehicle_id: '', driver_id: '', weight: '', distance: '', status: 'Draft', trip_date: new Date().toISOString().split('T')[0] });
    setError('');
  };

  const columns = [
    { header: 'Date', accessor: 'trip_date', render: (row) => row.trip_date ? new Date(row.trip_date).toLocaleDateString() : 'N/A' },
    { header: 'Origin', accessor: 'origin' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Vehicle', accessor: 'vehicle_reg' },
    { header: 'Driver', accessor: 'driver_name' },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Distance', accessor: 'distance' },
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
          {row.status === 'Draft' && <Button variant="primary" className="text-sm" onClick={() => handleStatusChange(row, 'Dispatched')}>Dispatch</Button>}
          {row.status === 'Dispatched' && <Button variant="success" className="text-sm" onClick={() => handleStatusChange(row, 'Completed')}>Complete</Button>}
          {(row.status === 'Draft' || row.status === 'Dispatched') && <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleStatusChange(row, 'Cancelled')}>Cancel</Button>}
          <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Trip Dispatcher</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ Create Trip'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="New Trip Dispatch" className="mb-4">
          <form onSubmit={handleCreateTrip} className="flex-col gap-md" style={{ maxWidth: '600px' }}>
            <div className="flex gap-md w-full">
              <Input label="Source/Origin" name="origin" placeholder="e.g. Warehouse A" value={formData.origin} onChange={handleChange} required />
              <Input label="Destination" name="destination" placeholder="e.g. Retail B" value={formData.destination} onChange={handleChange} required />
            </div>
            
            <div className="flex gap-md w-full">
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Select Vehicle</label>
                <select className="input-field" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">-- Choose Available Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.reg_number} - {v.name} (Max: {v.capacity})</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Select Driver</label>
                <select className="input-field" name="driver_id" value={formData.driver_id} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">-- Choose Available Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-md w-full">
              <Input label="Cargo Weight (kg)" name="weight" type="number" placeholder="e.g. 5000" value={formData.weight} onChange={handleChange} required />
              <Input label="Planned Distance (km)" name="distance" type="number" placeholder="e.g. 150" value={formData.distance} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
                <Input label="Trip Date" name="trip_date" type="date" value={formData.trip_date} onChange={handleChange} required />
                <div className="input-group" style={{flex: 1}}>
                    <label className="input-label">Initial Status</label>
                    <select className="input-field" name="status" value={formData.status} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                    <option value="Draft">Draft</option>
                    <option value="Dispatched">Dispatched</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Trip</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading trips...</div> : <Table columns={columns} data={trips} />}
      </Card>
    </div>
  );
};

export default TripManagement;
