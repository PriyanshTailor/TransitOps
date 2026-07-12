import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Route, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings,
  Truck
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/vehicles', label: 'Vehicle Registry', icon: <Car size={20} /> },
  { path: '/drivers', label: 'Driver Management', icon: <Users size={20} /> },
  { path: '/trips', label: 'Trip Management', icon: <Route size={20} /> },
  { path: '/maintenance', label: 'Maintenance', icon: <Wrench size={20} /> },
  { path: '/fuel', label: 'Fuel & Expense', icon: <Fuel size={20} /> },
  { path: '/reports', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Truck size={20} color="white" />
          </div>
          <h2>TransitOps</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
