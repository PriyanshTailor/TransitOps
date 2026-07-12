import { Bell, Search, UserCircle } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Fleet Manager</span>
            <span className="user-role">Admin</span>
          </div>
          <UserCircle size={32} className="avatar-icon" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
