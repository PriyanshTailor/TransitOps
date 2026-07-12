import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchFuel, createFuel, deleteFuel, fetchVehicles, fetchDrivers } from '../services/api';

const FuelExpense = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  const [formData, setFormData] = useState({
    vehicle_id: '', driver_id: '', fuel_station: '', fuel_type: 'Diesel', 
    liters: '', price_per_liter: '', total_cost: '', 
    odometer_before: '', odometer_after: '', fuel_date: new Date().toISOString().split('T')[0], location: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fuelData, vehiclesData, driversData] = await Promise.all([
        fetchFuel(),
        fetchVehicles(),
        fetchDrivers()
      ]);
      setLogs(fuelData);
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
    const { name, value } = e.target;
    let newForm = { ...formData, [name]: value };
    
    // Auto calculate total cost if liters or price changes
    if (name === 'liters' || name === 'price_per_liter') {
      const liters = parseFloat(name === 'liters' ? value : newForm.liters);
      const price = parseFloat(name === 'price_per_liter' ? value : newForm.price_per_liter);
      if (!isNaN(liters) && !isNaN(price)) {
        newForm.total_cost = (liters * price).toFixed(2);
      }
    }
    setFormData(newForm);
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
    setFormData({
      vehicle_id: '', driver_id: '', fuel_station: '', fuel_type: 'Diesel', 
      liters: '', price_per_liter: '', total_cost: '', 
      odometer_before: '', odometer_after: '', fuel_date: new Date().toISOString().split('T')[0], location: ''
    });
    setError('');
  };

  const columns = [
    { header: 'Date', accessor: 'fuel_date', render: (row) => new Date(row.fuel_date).toLocaleDateString() },
    { header: 'Vehicle', accessor: 'vehicle_reg' },
    { header: 'Driver', accessor: 'driver_name', render: (row) => row.driver_name || 'N/A' },
    { header: 'Fuel Type', accessor: 'fuel_type' },
    { header: 'Liters', accessor: 'liters' },
    { header: 'Cost', accessor: 'total_cost', render: (row) => `$${row.total_cost}` },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{display: 'flex', gap: '0.5rem'}}>
          {(userRole === 'Super Admin' || userRole === 'Fleet Manager' || userRole === 'Financial Analyst') && (
            <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Fuel Management</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ Log Fuel'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="Add Fuel Log" className="mb-4">
          <form onSubmit={handleCreate} className="flex-col gap-md" style={{ maxWidth: '800px' }}>
            
            <div className="flex gap-md w-full">
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Vehicle</label>
                <select className="input-field" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.reg_number}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Driver (Optional)</label>
                <select className="input-field" name="driver_id" value={formData.driver_id} onChange={handleChange} style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-md w-full">
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Fuel Type</label>
                <select className="input-field" name="fuel_type" value={formData.fuel_type} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="EV Charge">EV Charge</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <Input label="Fuel Station Name" name="fuel_station" placeholder="e.g. Shell Pump 4" value={formData.fuel_station} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
              <Input label="Quantity (Liters/kWh)" name="liters" type="number" step="0.1" value={formData.liters} onChange={handleChange} required />
              <Input label="Price per Unit ($)" name="price_per_liter" type="number" step="0.01" value={formData.price_per_liter} onChange={handleChange} required />
              <Input label="Total Cost ($)" name="total_cost" type="number" step="0.01" value={formData.total_cost} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
              <Input label="Odometer Before" name="odometer_before" type="number" value={formData.odometer_before} onChange={handleChange} />
              <Input label="Odometer After" name="odometer_after" type="number" value={formData.odometer_after} onChange={handleChange} />
              <Input label="Date" name="fuel_date" type="date" value={formData.fuel_date} onChange={handleChange} required />
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Fuel Log</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading logs...</div> : <Table columns={columns} data={logs} />}
      </Card>
    </div>
  );
};

export default FuelExpense;
