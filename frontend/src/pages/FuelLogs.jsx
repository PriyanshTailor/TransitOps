import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchFuel, createFuel, deleteFuel, fetchVehicles } from '../services/api';

const FuelLogs = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    vehicle_id: '', liters: '', cost: '', fuel_date: new Date().toISOString().split('T')[0], location: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fuelData, vehiclesData] = await Promise.all([
        fetchFuel(),
        fetchVehicles()
      ]);
      setRecords(fuelData);
      setVehicles(vehiclesData);
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
      await createFuel(formData);
      setIsAdding(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteFuel(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ vehicle_id: '', liters: '', cost: '', fuel_date: new Date().toISOString().split('T')[0], location: '' });
    setError('');
  };

  const columns = [
    { header: 'Date', accessor: 'fuel_date', render: (row) => row.fuel_date ? new Date(row.fuel_date).toLocaleDateString() : 'N/A' },
    { header: 'Vehicle', accessor: 'vehicle_reg' },
    { header: 'Location', accessor: 'location' },
    { header: 'Liters', accessor: 'liters', render: (row) => `${row.liters} L` },
    { header: 'Cost', accessor: 'cost', render: (row) => `$${row.cost}` },
    {
      header: 'Actions',
      render: (row) => (
        <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Fuel Logs</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ Add Fuel Log'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="New Fuel Log" className="mb-4">
          <form onSubmit={handleCreate} className="flex-col gap-md" style={{ maxWidth: '600px' }}>
            
            <div className="input-group">
              <label className="input-label">Select Vehicle</label>
              <select className="input-field" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.reg_number} - {v.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-md w-full">
              <Input label="Volume (Liters)" name="liters" type="number" placeholder="e.g. 100" value={formData.liters} onChange={handleChange} required />
              <Input label="Total Cost ($)" name="cost" type="number" placeholder="e.g. 120" value={formData.cost} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
                <Input label="Refuel Date" name="fuel_date" type="date" value={formData.fuel_date} onChange={handleChange} required />
                <Input label="Gas Station / Location" name="location" placeholder="e.g. Highway Pump 4" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Log</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading logs...</div> : <Table columns={columns} data={records} />}
      </Card>
    </div>
  );
};

export default FuelLogs;
