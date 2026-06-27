import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    const endpoint = isRegistering 
      ? 'http://localhost:5000/api/auth/signup' 
      : 'http://localhost:5000/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const serverErrorMessage = data.error || data.message || 'Authentication session halted.';
        const serverErrorCode = data.code ? ` [${data.code}${data.status ? `, ${data.status}` : ''}]` : '';
        throw new Error(`${serverErrorMessage}${serverErrorCode}`);
      }

      if (isRegistering) {
        alert('Security profile compiled! You can now log in.');
        setIsRegistering(false); 
        setPassword('');
      } else {
        localStorage.setItem('token', data.token);
        // Force clean navigation state transition
        window.location.href = '/dashboard'; 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-header">
          <h2>TASK MANAGER </h2>
          <p>{isRegistering ? 'Compile new user credentials' : 'Initialize secure system session'}</p>
        </div>

        {error && <div className="login-error-alert">⚠️ {error}</div>}

        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="operator@domain.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? 'Interrogating Core...' : isRegistering ? 'Create Profile' : 'Authorize Session'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        

        <p className="toggle-auth-text">
          {isRegistering ? 'Already authenticated?' : 'New system operator?'}{' '}
          <span onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Sign In' : 'Register Profile'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;