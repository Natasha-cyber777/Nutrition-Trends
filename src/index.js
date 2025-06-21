import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // You can create a basic index.css for global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);