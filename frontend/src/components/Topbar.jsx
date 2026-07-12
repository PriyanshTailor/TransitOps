import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, fetchGlobalSearch } from '../services/api';
import './Topbar.css';

const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const Topbar = ({ onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ vehicles: [], drivers: [], trips: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (e) {
        console.error("Failed to load notifications");
      }
    };
    loadNotifs();
    
    // Poll every 30 seconds
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, searchRef]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ vehicles: [], drivers: [], trips: [] });
      setShowSearch(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchGlobalSearch(searchQuery);
        setSearchResults(results);
        setShowSearch(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="topbar">
      <div className="topbar-search" ref={searchRef} style={{ position: 'relative' }}>
        <IconSearch />
        <input 
          type="text" 
          placeholder="Search vehicles, drivers, trips..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchQuery.length >= 2) setShowSearch(true); }}
        />
        {showSearch && (
          <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', minWidth: '350px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 100, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {isSearching ? (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Searching...</div>
            ) : (
              <>
                {searchResults.vehicles.length > 0 && (
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', textTransform: 'uppercase' }}>Vehicles</div>
                    {searchResults.vehicles.map(v => (
                      <div key={v.id} onClick={() => { navigate('/vehicles'); setShowSearch(false); }} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v.reg_number}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.name} - {v.status}</div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.drivers.length > 0 && (
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', textTransform: 'uppercase' }}>Drivers</div>
                    {searchResults.drivers.map(d => (
                      <div key={d.id} onClick={() => { navigate('/drivers'); setShowSearch(false); }} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.license_number} - {d.status}</div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.trips.length > 0 && (
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', textTransform: 'uppercase' }}>Trips</div>
                    {searchResults.trips.map(t => (
                      <div key={t.id} onClick={() => { navigate('/trips'); setShowSearch(false); }} style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.origin} → {t.destination}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.status}</div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.vehicles.length === 0 && searchResults.drivers.length === 0 && searchResults.trips.length === 0 && (
                   <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No results found</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {isDarkMode ? <IconSun /> : <IconMoon />}
        </button>
        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <IconBell />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', fontSize: '0.7rem', padding: '2px 5px', borderRadius: '50%' }}>
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', zIndex: 100, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Notifications</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.875rem' }}>{n.message}</div>
                      {!n.is_read && (
                        <button onClick={() => handleMarkRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem' }}>Mark Read</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="user-profile">
          <IconUser className="avatar-icon" />
          <div className="user-info">
            <span className="user-name">{user.name || 'Admin User'}</span>
            <span className="user-role">{user.role || 'Fleet Manager'}</span>
          </div>
        </div>
        <button className="icon-btn" onClick={onLogout} title="Logout" style={{marginLeft: '0.5rem', color: 'var(--danger)'}}>
          <IconLogout />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
