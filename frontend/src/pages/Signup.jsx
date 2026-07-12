import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
      return 'All fields are required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character.';
    }
    return null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Automatically log them in after signup
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
      window.location.reload(); // Quick way to update top-level App state

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
          <h2>Create an Account</h2>
          <p>Join TransitOps to manage your fleet</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="Full Name" 
            type="text" 
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input 
            label="Company Name" 
            type="text" 
            name="companyName"
            placeholder="FastTrack Logistics"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
          <Input 
            label="Email Address" 
            type="email" 
            name="email"
            placeholder="admin@transitops.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Button type="submit" className="w-full" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <div className="login-options" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <span>Already have an account? <Link to="/login" className="forgot-password">Sign In</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
