import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Settings = () => {
  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Settings & RBAC</h2>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Card title="Company Profile">
          <form className="flex-col gap-md">
            <Input label="Company Name" defaultValue="TransitOps Logistics" />
            <Input label="Support Email" defaultValue="support@transitops.com" />
            <Input label="Address" defaultValue="123 Transport Blvd, Industrial City" />
            <Button type="button" className="w-full mt-4">Update Profile</Button>
          </form>
        </Card>

        <Card title="Role-Based Access Control">
          <div className="flex-col gap-md">
            <div className="flex items-center justify-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div>
                <strong>Fleet Manager</strong>
                <p className="text-secondary text-sm">Full access to vehicles and drivers</p>
              </div>
              <Button variant="secondary" className="text-sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div>
                <strong>Dispatcher</strong>
                <p className="text-secondary text-sm">Access to Trips and Routing</p>
              </div>
              <Button variant="secondary" className="text-sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div>
                <strong>Financial Analyst</strong>
                <p className="text-secondary text-sm">Access to Reports & Fuel</p>
              </div>
              <Button variant="secondary" className="text-sm">Edit</Button>
            </div>
            
            <Button variant="primary" className="mt-2">+ Create New Role</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
