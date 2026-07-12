import { useState, useEffect } from 'react';
import { Bell, Search, UserCircle, Sun, Moon } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial state
    if (document.body.classList.contains('light-mode')) {
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-mode');
    setIsLightMode(!isLightMode);
  };
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      
      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
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
