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
        // Fallback hierarchy to extract the exact backend string
        const serverErrorMessage = data.error || data.message || 'Authentication session halted.';
        throw new Error(serverErrorMessage);
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
          <h2>PMMS Engine</h2>
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

        <button type="button" onClick={handleGoogleLogin} className="google-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.28 1.845 15.448 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.714H12.24z"/>
          </svg>
          Continue with Google
        </button>

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