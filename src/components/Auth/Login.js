// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleAuthProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { db } from '../../firebase'; // Import db here to fetch role immediately (optional but good practice)
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import '../../styles/AuthStyles.css';
import MinimalNavbar from '../MinimalNavbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to fetch user role after successful authentication
  const fetchUserRoleAndNavigate = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const fetchedRole = data.role;
        if (fetchedRole) {
          localStorage.setItem('role', fetchedRole); // Keep localStorage updated
          console.log('Login.js: Role fetched and set in localStorage:', fetchedRole);
          // Navigate based on fetched role
          if (fetchedRole === 'client') {
            navigate('/client/dashboard', { replace: true });
          } else if (fetchedRole === 'customer') {
            navigate('/customer/dashboard', { replace: true });
          } else {
            // Handle unassigned/unknown roles
            console.warn('Login.js: User has an unassigned or unknown role:', fetchedRole);
            navigate('/login', { replace: true }); // Or to a profile setup page
          }
        } else {
          console.warn('Login.js: User document exists, but role field is missing for UID:', user.uid);
          navigate('/login', { replace: true }); // Role missing, redirect to login/profile setup
        }
      } else {
        console.warn('Login.js: Authenticated user document not found in Firestore for UID:', user.uid);
        navigate('/login', { replace: true }); // No user document, redirect to login/profile setup
      }
    } catch (err) {
      console.error('Login.js: Error fetching role after login:', err);
      navigate('/login', { replace: true }); // Error fetching role, redirect to login
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login.js: User logged in successfully (email/password)!');
      await fetchUserRoleAndNavigate(userCredential.user); // Fetch role and navigate immediately

    } catch (error) {
      console.error('Login.js: Login failed:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (loading) {
      console.log('Login.js: Google sign-in already in progress. Ignoring.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      console.log('Login.js: User signed in with Google!');
      await fetchUserRoleAndNavigate(userCredential.user); // Fetch role and navigate immediately

    } catch (error) {
      console.error('Login.js: Google sign-in failed:', error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in process cancelled.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <MinimalNavbar />
      <div className='auth-card'>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="button-container">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </button>
            <button type="button" onClick={signInWithGoogle} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In with Google'}
            </button>
          </div>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;