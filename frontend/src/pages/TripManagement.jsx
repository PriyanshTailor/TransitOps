import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { fetchTrips, createTrip, updateTrip, deleteTrip, fetchVehicles, fetchDrivers } from '../services/api';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    trip_number: `TRP-${Date.now().toString().slice(-6)}`,
    origin: '', destination: '', vehicle_id: '', driver_id: '',
    cargo_weight: '', expected_distance: '', revenue: '', trip_date: new Date().toISOString().split('T')[0]
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
      setVehicles(vehiclesData.filter(v => v.status === 'Available'));
      setDrivers(driversData.filter(d => d.status === 'Available'));
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTrip(formData);
      setIsAdding(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    }
  };

  const handleAutoAssign = async (trip) => {
    if (vehicles.length === 0 || drivers.length === 0) {
      alert("AI requires at least one available vehicle and driver to optimize assignments.");
      return;
    }
    
    // Sort available drivers by safety score descending, and vehicles just by ID for now
    const bestDriver = [...drivers].sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0))[0];
    const bestVehicle = vehicles[0]; 
    
    try {
      setLoading(true);
      await updateTrip(trip.id, { 
        ...trip, 
        driver_id: bestDriver.id, 
        vehicle_id: bestVehicle.id, 
        status: 'Assigned' 
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Auto-assign failed');
      setLoading(false);
    }
  };

  const advanceTripStatus = async (trip) => {
    const statusFlow = ['Draft', 'Assigned', 'Approved', 'Dispatched', 'In Transit', 'Completed', 'Archived'];
    const currentIndex = statusFlow.indexOf(trip.status);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;
    
    const nextStatus = statusFlow[currentIndex + 1];
    
    // Check requirements before advancing
    if (nextStatus === 'Assigned' && (!trip.vehicle_id || !trip.driver_id)) {
      alert("You must assign a Vehicle and Driver before moving to Assigned stage.");
      return;
    }

    if (nextStatus === 'Dispatched') {
      if (!window.confirm("Dispatching will lock the Vehicle and Driver. Proceed?")) return;
    }
    
    if (nextStatus === 'Completed') {
      if (!window.confirm("Completing the trip will free up the Vehicle and Driver. Proceed?")) return;
    }

    try {
      await updateTrip(trip.id, { ...trip, status: nextStatus });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update status');
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
    setFormData({
      trip_number: `TRP-${Date.now().toString().slice(-6)}`,
      origin: '', destination: '', vehicle_id: '', driver_id: '',
      cargo_weight: '', expected_distance: '', revenue: '', trip_date: new Date().toISOString().split('T')[0]
    });
    setError('');
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'Draft': return 'default';
      case 'Assigned': return 'info';
      case 'Approved': return 'info';
      case 'Dispatched': return 'warning';
      case 'In Transit': return 'warning';
      case 'Completed': return 'success';
      case 'Archived': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Trip Dispatch Workflow</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ New Trip'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="Plan New Trip" className="mb-4">
          <form onSubmit={handleCreate} className="flex-col gap-md" style={{ maxWidth: '800px' }}>
            <div className="flex gap-md w-full">
              <Input label="Trip ID" name="trip_number" value={formData.trip_number} readOnly />
              <Input label="Date" name="trip_date" type="date" value={formData.trip_date} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
              <Input label="Origin" name="origin" placeholder="e.g. Mumbai" value={formData.origin} onChange={handleChange} required />
              <Input label="Destination" name="destination" placeholder="e.g. Delhi" value={formData.destination} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Assign Vehicle</label>
                <select className="input-field" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.reg_number} ({v.capacity}kg max)</option>)}
                </select>
              </div>

              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Assign Driver</label>
                <select className="input-field" name="driver_id" value={formData.driver_id} onChange={handleChange} style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-md w-full">
              <Input label="Expected Distance (km)" name="expected_distance" type="number" value={formData.expected_distance} onChange={handleChange} />
              <Input label="Expected Revenue ($)" name="revenue" type="number" value={formData.revenue} onChange={handleChange} />
              <Input label="Cargo Weight (kg)" name="cargo_weight" type="number" value={formData.cargo_weight} onChange={handleChange} />
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Trip (Draft)</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div style={{padding: '2rem', textAlign: 'center'}}>Loading trips...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {trips.map(trip => (
            <Card key={trip.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: trip.status === 'Archived' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{trip.trip_number}</strong>
                <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div>📍 {trip.origin} → {trip.destination}</div>
                <div>🚚 {trip.vehicle_reg || 'Unassigned'}</div>
                <div>👤 {trip.driver_name || 'Unassigned'}</div>
                <div>💰 Revenue: ${trip.revenue}</div>
                <div>📅 Date: {new Date(trip.trip_date).toLocaleDateString()}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <Button variant="ghost" style={{color: 'var(--danger)', padding: 0}} onClick={() => handleDelete(trip.id)}>
                   Delete
                </Button>
                
                {trip.status === 'Draft' && (
                  <Button variant="secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6'}} onClick={() => handleAutoAssign(trip)}>
                    ✨ AI Auto-Assign
                  </Button>
                )}
                
                {trip.status !== 'Archived' && (
                  <Button variant="primary" onClick={() => advanceTripStatus(trip)}>
                    Advance Stage →
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripManagement;
