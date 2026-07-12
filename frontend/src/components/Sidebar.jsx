import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <span>📊</span> },
  { path: '/vehicles', label: 'Vehicle Registry', icon: <span>🚗</span> },
  { path: '/drivers', label: 'Driver Management', icon: <span>👥</span> },
  { path: '/trips', label: 'Trip Management', icon: <span>🛣️</span> },
  { path: '/maintenance', label: 'Maintenance', icon: <span>🔧</span> },
  { path: '/fuel', label: 'Fuel & Expense', icon: <span>⛽</span> },
  { path: '/reports', label: 'Reports & Analytics', icon: <span>📈</span> },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"></div>
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
          <span>⚙️</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
