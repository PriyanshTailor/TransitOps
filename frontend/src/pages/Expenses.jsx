import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { fetchExpenses, createExpense, updateExpenseStatus, deleteExpense } from '../services/api';

const Expenses = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  const [formData, setFormData] = useState({
    category: 'Fuel', vendor: '', amount: '', gst: '', payment_method: 'Card', expense_date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses();
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load expenses');
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
      await createExpense(formData);
      setIsAdding(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Mark this expense as ${newStatus}?`)) return;
    try {
      await updateExpenseStatus(id, { approval_status: newStatus });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ category: 'Fuel', vendor: '', amount: '', gst: '', payment_method: 'Card', expense_date: new Date().toISOString().split('T')[0], notes: '' });
    setError('');
  };

  const columns = [
    { header: 'Date', accessor: 'expense_date', render: (row) => new Date(row.expense_date).toLocaleDateString() },
    { header: 'Category', accessor: 'category' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Amount', accessor: 'amount', render: (row) => `$${row.amount}` },
    { 
      header: 'Status', 
      accessor: 'approval_status',
      render: (row) => {
        let variant = 'default';
        if (row.approval_status === 'Approved') variant = 'success';
        if (row.approval_status === 'Pending') variant = 'warning';
        if (row.approval_status === 'Rejected') variant = 'danger';
        return <Badge variant={variant}>{row.approval_status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{display: 'flex', gap: '0.5rem'}}>
          {(userRole === 'Super Admin' || userRole === 'Financial Analyst') && row.approval_status === 'Pending' && (
            <>
                <Button variant="success" className="text-sm" onClick={() => handleStatusChange(row.id, 'Approved')}>Approve</Button>
                <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleStatusChange(row.id, 'Rejected')}>Reject</Button>
            </>
          )}
          {(userRole === 'Super Admin' || userRole === 'Financial Analyst') && (
            <Button variant="ghost" className="text-sm" style={{color: 'var(--danger)'}} onClick={() => handleDelete(row.id)}>Delete</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Expense Management</h2>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (!isAdding) resetForm();
        }}>
          {isAdding ? 'Cancel' : '+ Record Expense'}
        </Button>
      </div>

      {error && <div style={{color: 'var(--danger)', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      {isAdding && (
        <Card title="New Expense Record" className="mb-4">
          <form onSubmit={handleCreate} className="flex-col gap-md" style={{ maxWidth: '800px' }}>
            
            <div className="flex gap-md w-full">
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Category</label>
                <select className="input-field" name="category" value={formData.category} onChange={handleChange} style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                  <option value="Fuel">Fuel</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <Input label="Vendor / Payee" name="vendor" placeholder="e.g. Shell Gas Station" value={formData.vendor} onChange={handleChange} required />
            </div>

            <div className="flex gap-md w-full">
              <Input label="Amount ($)" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
              <Input label="GST / Tax ($)" name="gst" type="number" step="0.01" value={formData.gst} onChange={handleChange} />
            </div>

            <div className="flex gap-md w-full">
                <Input label="Expense Date" name="expense_date" type="date" value={formData.expense_date} onChange={handleChange} required />
                <div className="input-group" style={{flex: 1}}>
                    <label className="input-label">Payment Method</label>
                    <select className="input-field" name="payment_method" value={formData.payment_method} onChange={handleChange} style={{backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}}>
                    <option value="Card">Corporate Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-md w-full">
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)'}}>Invoice/Receipt Upload</label>
                <input type="file" style={{padding: '0.5rem', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)'}} />
              </div>
            </div>

            <div className="flex gap-md mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Expense</Button>
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

export default Expenses;
