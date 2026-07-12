import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/api';

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    reg_number: '', name: '', vehicle_type: 'Medium Truck', capacity: '', 
    odometer: '', acquisition_cost: '', status: 'Available',
    vin_number: '', purchase_date: '', insurance_expiry: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateVehicle(editingId, formData);
      } else {
        await createVehicle(formData);
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      loadVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      reg_number: vehicle.reg_number,
      name: vehicle.name,
      vehicle_type: vehicle.vehicle_type,
      capacity: vehicle.capacity,
      odometer: vehicle.odometer,
      acquisition_cost: vehicle.acquisition_cost,
      status: vehicle.status,
      vin_number: vehicle.vin_number || '',
      purchase_date: vehicle.purchase_date ? new Date(vehicle.purchase_date).toISOString().split('T')[0] : '',
      insurance_expiry: vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toISOString().split('T')[0] : ''
    });
    setEditingId(vehicle.id);
    setIsAdding(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      loadVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ 
      reg_number: '', name: '', vehicle_type: 'Medium Truck', capacity: '', 
      odometer: '', acquisition_cost: '', status: 'Available',
      vin_number: '', purchase_date: '', insurance_expiry: ''
    });
    setError('');
  };

  const columns = [
    { header: 'Registration', accessor: 'reg_number' },
    { header: 'Name/Model', accessor: 'name' },
    { header: 'Type', accessor: 'vehicle_type' },
    { header: 'Capacity', accessor: 'capacity' },
    { header: 'Odometer (km)', accessor: 'odometer' },
    { header: 'Cost ($)', accessor: 'acquisition_cost' },
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
      render: (row) => (
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <Button variant="ghost" className="text-sm" onClick={() => handleEdit(row)}>Edit</Button>
          <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Vehicle Registry</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
          setEditingId(null);
        }}>
          {isAdding ? 'Cancel' : '+ Add Vehicle'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title={editingId ? "Edit Vehicle" : "Add New Vehicle"} className="mb-4">
          <form className="flex-col gap-md" onSubmit={handleSave}>
            <div className="flex gap-md w-full">
                <Input label="Registration Number" name="reg_number" value={formData.reg_number} onChange={handleChange} required placeholder="e.g. MH-01-AB-1234" />
                <Input label="Vehicle Name/Model" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Volvo FH16" />
            </div>
            <div className="flex gap-md w-full">
                <Input label="Vehicle Type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} required placeholder="e.g. Heavy Truck" />
                <Input label="Maximum Capacity" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g. 20,000 kg" />
            </div>
            <div className="flex gap-md w-full">
              <Input label="Initial Odometer" name="odometer" type="number" value={formData.odometer} onChange={handleChange} required />
              <Input label="Acquisition Cost ($)" name="acquisition_cost" type="number" step="0.01" value={formData.acquisition_cost} onChange={handleChange} required />
              <Input label="VIN Number" name="vin_number" value={formData.vin_number} onChange={handleChange} placeholder="e.g. 1HGCM82633A" />
            </div>
            <div className="flex gap-md w-full">
              <Input label="Purchase Date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} />
              <Input label="Insurance Expiry" name="insurance_expiry" type="date" value={formData.insurance_expiry} onChange={handleChange} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)'}}>RC Document Upload (Optional)</label>
                <input type="file" style={{padding: '0.5rem', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}} />
              </div>
            </div>
            {editingId && (
                <div className="flex gap-md w-full">
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        <label style={{fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)'}}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} style={{padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)'}}>
                            <option value="Available">Available</option>
                            <option value="On Trip">On Trip</option>
                            <option value="In Shop">In Shop</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>
                </div>
            )}
            <Button type="submit" style={{alignSelf: 'flex-start', marginTop: '1rem'}}>{editingId ? 'Update Vehicle' : 'Save Vehicle'}</Button>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading vehicles...</div> : <Table columns={columns} data={vehicles} />}
      </Card>
    </div>
  );
};

export default VehicleRegistry;
