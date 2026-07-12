import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <span>🔍</span>
        <input type="text" placeholder="Search vehicles, drivers, trips..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn">
          <span>🔔</span>
        </button>
        <div className="user-profile">
          <span>👤</span>
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
