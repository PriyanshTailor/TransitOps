import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Login.css';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Driver');
  const [companyName, setCompanyName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = ['Driver', 'Dispatcher', 'Fleet Manager', 'Financial Analyst', 'Super Admin'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
      const body = isLogin 
        ? { email, password } 
        : { name, email, password, role, companyName };
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon lg">
            <Truck size={28} color="white" />
          </div>
          <h2>TransitOps</h2>
          <p>Smart Transport Operations Platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          
          {!isLogin && (
            <>
              <Input 
                label="Full Name" 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input 
                label="Company Name" 
                type="text" 
                placeholder="FastTrack Logistics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <div className="custom-select-container">
                <label className="custom-select-label">Role</label>
                <div 
                  className="custom-select-button" 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{role}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {isDropdownOpen && (
                  <div className="custom-select-dropdown">
                    {roles.map(r => (
                      <div 
                        key={r} 
                        className={`custom-select-option ${r === role ? 'selected' : ''}`}
                        onClick={() => {
                          setRole(r);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Input 
            label="Email Address" 
            type="email" 
            placeholder="admin@transitops.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {isLogin && (
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          
          <div className="auth-toggle">
            {isLogin ? (
              <p>Don't have an account? <span onClick={() => { setIsLogin(false); setError(''); }}>Sign up</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => { setIsLogin(true); setError(''); }}>Sign in</span></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
