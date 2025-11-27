import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState({ lat: 36.7525, lng: 3.0420 }); // Algiers default
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock API fetching
    useEffect(() => {
        const fetchLocation = () => {
            // Simulate API call
            // In real app: fetch('https://api.example.com/deliverer-location')

            // Simulate movement
            setLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.001,
                lng: prev.lng + (Math.random() - 0.5) * 0.001
            }));
            setLoading(false);
        };

        const intervalId = setInterval(fetchLocation, 3000); // Update every 3 seconds
        fetchLocation(); // Initial call

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="map-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                &larr; Retour au Dashboard
            </button>

            <div className="map-card">
                <header className="map-header">
                    <h1>Suivi en Temps Réel</h1>
                    <div className="live-indicator">
                        <span className="pulse-dot"></span>
                        LIVE
                    </div>
                </header>

                <div className="map-placeholder">
                    {/* Visual representation of map */}
                    <div className="map-grid">
                        <div
                            className="deliverer-marker"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(${location.lng * 1000 % 50}px, ${location.lat * 1000 % 50}px)` // Mock movement visual
                            }}
                        >
                            🚚
                        </div>
                    </div>

                    <div className="map-overlay">
                        <h3>Position Actuelle</h3>
                        <p>Latitude: {location.lat.toFixed(6)}</p>
                        <p>Longitude: {location.lng.toFixed(6)}</p>
                        <p className="api-note">Fetching from: <code>api.friend.com/location</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
