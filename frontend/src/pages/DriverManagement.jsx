import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from '../services/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', license_number: '', category: 'Heavy', license_expiry: '', 
    contact_number: '', score: '100', status: 'Available',
    experience_years: '', blood_group: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load drivers');
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
        await updateDriver(editingId, formData);
      } else {
        await createDriver(formData);
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      loadDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      license_number: driver.license_number,
      category: driver.category,
      // Format date for input[type="date"]
      license_expiry: driver.license_expiry ? new Date(driver.license_expiry).toISOString().split('T')[0] : '',
      contact_number: driver.contact_number || '',
      score: driver.score,
      status: driver.status,
      experience_years: driver.experience_years || '',
      blood_group: driver.blood_group || ''
    });
    setEditingId(driver.id);
    setIsAdding(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await deleteDriver(id);
      loadDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

    setFormData({ 
      name: '', license_number: '', category: 'Heavy', license_expiry: '', 
      contact_number: '', score: '100', status: 'Available',
      experience_years: '', blood_group: ''
    });
  };

  const columns = [
    { header: 'Driver Name', accessor: 'name' },
    { header: 'License No', accessor: 'license_number' },
    { header: 'Contact', accessor: 'contact_number' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Expiry Date', 
      accessor: 'license_expiry',
      render: (row) => row.license_expiry ? new Date(row.license_expiry).toLocaleDateString() : 'N/A'
    },
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
        <h2>Driver Management</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
          setEditingId(null);
        }}>
          {isAdding ? 'Cancel' : '+ Add Driver'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title={editingId ? "Edit Driver" : "Add New Driver"} className="mb-4">
          <form className="flex-col gap-md" onSubmit={handleSave}>
            <div className="flex gap-md w-full">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe" />
                <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} required placeholder="e.g. DL-123456789" />
            </div>
            <div className="flex gap-md w-full">
                <Input label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="e.g. +1 234 567 890" />
                <Input label="Category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Heavy" />
            </div>
            <div className="flex gap-md w-full">
                <Input label="Expiry Date" name="license_expiry" type="date" value={formData.license_expiry} onChange={handleChange} required />
                <Input label="Safety Score (0-100)" name="score" type="number" min="0" max="100" value={formData.score} onChange={handleChange} />
            </div>
            <div className="flex gap-md w-full">
              <Input label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
              <Input label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)'}}>DL Document Upload</label>
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
                            <option value="Off Duty">Off Duty</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            )}
            <Button type="submit" style={{alignSelf: 'flex-start', marginTop: '1rem'}}>{editingId ? 'Update Driver' : 'Save Driver'}</Button>
          </form>
        </Card>
      )}

      <Card>
        {loading ? <div style={{padding: '2rem', textAlign: 'center'}}>Loading drivers...</div> : <Table columns={columns} data={drivers} />}
      </Card>
    </div>
  );
};

export default DriverManagement;
