// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/NavbarStyles.css'; // Ensure this CSS file exists
import logo from '../assets/logo.png'; // adjust path if different

const Navbar = ({ userRole }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Replace with the actual Firebase UID of the dietician
  const dieticianUserId = 'L5HhLGExcwRafGWW7Sl9oJpZad72';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User logged out successfully!');
      localStorage.removeItem('role'); // Clear role from local storage
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <span className="navbar-title">Nutrition Trends</span>
      </div>
      <button className="navbar-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>
      <ul className={`navbar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {userRole === 'client' && (
          <>
            <li className="nav-item">
              <Link to="/client/dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
            <Link
  to="/client/customers"
  className="nav-link"
  onClick={() => setIsMobileMenuOpen(false)}
>
  Customers
</Link>
            </li>
            <li className="nav-item">
              <Link to="/client/clientprofilepage" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link logout-button">
                Logout
              </button>
            </li>
          </>
        )}

        {userRole === 'customer' && (
          <>
            <li className="nav-item">
              <Link to="/customer/dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/customer/myprogress" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                My Progress
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/customer/customerprofile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                My Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/customer/publiclientprofile/${dieticianUserId}`}
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Dietician
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;