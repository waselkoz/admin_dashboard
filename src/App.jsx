import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Details from './components/Details';
import MapPage from './components/MapPage';
import Settings from './components/Settings';
import './App.css';

import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor') || 'red';
    const color = savedColor;
    document.documentElement.style.setProperty('--primary', color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6');
    document.documentElement.style.setProperty('--primary-glow', color === 'red' ? 'rgba(239, 68, 68, 0.5)' : color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : color === 'green' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/details" element={<Details />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
