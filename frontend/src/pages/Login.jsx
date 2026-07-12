import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Removed lucide-react import
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store JWT in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLogin(); // Tell App component we are logged in
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
            <span style={{fontSize: '32px'}}>🚚</span>
          </div>
          <h2>TransitOps</h2>
          <p>Smart Transport Operations Platform</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="Email Address" 
            type="email" 
            name="email"
            placeholder="admin@fasttrack.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="login-options" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <span>Don't have an account? <Link to="/signup" className="forgot-password">Sign Up</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
