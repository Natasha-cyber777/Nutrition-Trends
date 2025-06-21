// src/components/layout/MinimalNavbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavbarStyles.css';
import logo from '../assets/logo.png'; // Adjust path if needed

const MinimalNavbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <span className="navbar-title">Nutrition Trends</span>
      </div>
    </nav>
  );
};

export default MinimalNavbar;
