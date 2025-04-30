import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const [credentials, setCredentials] = useState({
    employeeId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.employeeId || !credentials.password) {
      setError('Both Employee ID and Password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log(credentials.employeeId, credentials.password);

    try {
      console.log(`https://dontsign.mpeoplesnet.com/api/login?${credentials.employeeId}&${credentials.password}`);
      
      const response = await fetch(`https://dontsign.mpeoplesnet.com/api/login?email=${credentials.employeeId}&password=${credentials.password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log(response);
      

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log(data);
      
      // Store the response data in localStorage
      localStorage.setItem('authData', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Login successful!');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // setError(err.message || 'Invalid credentials. Please try again.');
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Employee Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={credentials.employeeId}
              onChange={handleChange}
              placeholder="Enter your employee ID"
            />
          </div>
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;