import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication
    if (email && password) {
      onLogin();
      navigate('/dashboard');
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
          
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" style={{ marginTop: '1rem', padding: '0.75rem' }}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
