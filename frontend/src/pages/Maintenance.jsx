import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchMaintenance, createMaintenance, updateMaintenance, deleteMaintenance, fetchVehicles } from '../services/api';

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    vehicle_id: '', service_type: '', cost: '', service_date: new Date().toISOString().split('T')[0], status: 'In Progress'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, vehiclesData] = await Promise.all([
        fetchMaintenance(),
        fetchVehicles()
      ]);
      setRecords(maintenanceData);
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
      await createMaintenance(formData);
      setIsAdding(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (record, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this record as ${newStatus}?`)) return;
    try {
      await updateMaintenance(record.id, { ...record, status: newStatus });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteMaintenance(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ vehicle_id: '', service_type: '', cost: '', service_date: new Date().toISOString().split('T')[0], status: 'In Progress' });
    setError('');
  };

  const columns = [
    { header: 'Date', accessor: 'service_date', render: (row) => row.service_date ? new Date(row.service_date).toLocaleDateString() : 'N/A' },
    { header: 'Vehicle', accessor: 'vehicle_reg' },
    { header: 'Service Type', accessor: 'service_type' },
    { header: 'Cost', accessor: 'cost', render: (row) => `$${row.cost}` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Completed') variant = 'success';
        if (row.status === 'In Progress') variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-sm">
          {row.status === 'In Progress' && <Button variant="success" className="text-sm" onClick={() => handleStatusChange(row, 'Completed')}>Complete</Button>}
          <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  // Only allow creating records for vehicles that aren't already In Shop
  const availableVehicles = vehicles.filter(v => v.status !== 'In Shop');

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Maintenance Log</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ Record Maintenance'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="New Maintenance Record" className="mb-4">
          <form onSubmit={handleCreate} className="flex-col gap-md" style={{ maxWidth: '600px' }}>
            
            <div className="input-group">
              <label className="input-label">Select Vehicle</label>
              <select className="input-field" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                <option value="">-- Choose Vehicle --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.reg_number} - {v.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-md w-full">
              <Input label="Service Type" name="service_type" placeholder="e.g. Engine Repair, Oil Change" value={formData.service_type} onChange={handleChange} required />
              <Input label="Cost ($)" name="cost" type="number" placeholder="e.g. 500" value={formData.cost} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
                <Input label="Service Date" name="service_date" type="date" value={formData.service_date} onChange={handleChange} required />
                <div className="input-group" style={{flex: 1}}>
                    <label className="input-label">Initial Status</label>
                    <select className="input-field" name="status" value={formData.status} onChange={handleChange} required style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                    <option value="In Progress">In Progress (Will move vehicle to "In Shop")</option>
                    <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Record</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading records...</div> : <Table columns={columns} data={records} />}
      </Card>
    </div>
  );
};

export default Maintenance;
