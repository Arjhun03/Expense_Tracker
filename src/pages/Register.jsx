import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, UserPlus } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, googleSignIn, redirectError, setRedirectError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectError) {
      if (redirectError.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not authorized in your Firebase console. Please go to Firebase Console > Authentication > Settings > Authorized Domains and add "${window.location.hostname}" to the list.`);
      } else {
        setError(redirectError.message || 'Failed to sign in with Google.');
      }
      setRedirectError(null);
    }
  }, [redirectError, setRedirectError]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account.');
      console.error(err);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      const user = await googleSignIn();
      if (user) {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not authorized in your Firebase console. Please go to Firebase Console > Authentication > Settings > Authorized Domains and add "${window.location.hostname}" to the list.`);
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked by your browser. Please allow popups for this site or try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Popup closed before completing sign-in. Please try again.');
      } else {
        setError('Failed to sign in with Google: ' + (err.message || 'unknown error'));
      }
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <Wallet size={48} className="brand-icon" />
          <h2>Create Account</h2>
          <p className="text-muted">Start tracking your expenses today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              required 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <button disabled={loading} type="submit" className="btn-primary auth-submit">
            <UserPlus size={18} />
            Sign Up
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          type="button"
          disabled={loading} 
          onClick={handleGoogleLogin} 
          className="btn-secondary google-btn"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer text-muted">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
