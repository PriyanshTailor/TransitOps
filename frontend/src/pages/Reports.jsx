import Card from '../components/ui/Card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { chartData } from '../utils/mockData';

const Reports = () => {
  return (
    <div className="flex-col gap-lg">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
      </div>

      <div className="kpi-grid">
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Avg Fuel Efficiency</span>
            <span className="kpi-value">4.2 km/L</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Total Operational Cost</span>
            <span className="kpi-value text-danger">$12,450</span>
          </div>
        </Card>
        <Card>
          <div className="kpi-content">
            <span className="kpi-label">Estimated ROI</span>
            <span className="kpi-value text-success">+15.4%</span>
          </div>
        </Card>
      </div>

      <Card title="Operational Cost Trends">
        <div style={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#334155' }}
                itemStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="fuel" name="Fuel Cost" stroke="#ef4444" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="trips" name="Maintenance" stroke="#eab308" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
