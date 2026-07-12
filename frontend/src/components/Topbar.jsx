import { Search, Bell, User } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search vehicles, drivers, trips..." 
          className="search-input"
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={18} />
        </button>
        <div className="user-profile">
          <User size={20} className="avatar-icon" />
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Fleet Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
