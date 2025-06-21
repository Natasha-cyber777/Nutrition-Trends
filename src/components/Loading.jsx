// src/components/Loading.jsx
import React from 'react';
import './Loading.css';
import logo from '../assets/logo.png'; // Make sure this path points to your actual logo
import MinimalNavbar from './MinimalNavbar';
const Loading = () => {
  return (
    <div className="loading-wrapper">
        <MinimalNavbar />
      <img src={logo} alt="Nutrition Trends Logo" className="loading-logo" />
      <div className="custom-spinner"></div>
      <p className="loading-text">Loading Nutrition Trends...</p>
    </div>
  );
};

export default Loading;
