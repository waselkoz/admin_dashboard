import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapPage = () => {
    const navigate = useNavigate();
    // Algiers default coordinates
    const [viewState, setViewState] = useState({
        latitude: 36.7525,
        longitude: 3.0420,
        zoom: 13
    });

    const [location, setLocation] = useState({ lat: 36.7525, lng: 3.0420 });
    const [loading, setLoading] = useState(true);

    // PLACEHOLDER TOKEN - User must replace this!
    const MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbTV...";

    // Mock API fetching
    useEffect(() => {
        const fetchLocation = () => {
            // Simulate movement
            const newLat = location.lat + (Math.random() - 0.5) * 0.001;
            const newLng = location.lng + (Math.random() - 0.5) * 0.001;

            setLocation({ lat: newLat, lng: newLng });

            // Optional: Follow the marker
            setViewState(prev => ({
                ...prev,
                latitude: newLat,
                longitude: newLng
            }));

            setLoading(false);
        };

        const intervalId = setInterval(fetchLocation, 3000); // Update every 3 seconds

        return () => clearInterval(intervalId);
    }, [location]);

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

                <div className="map-placeholder" style={{ border: 'none', padding: 0 }}>
                    <Map
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                    >
                        <NavigationControl position="top-right" />

                        <Marker
                            latitude={location.lat}
                            longitude={location.lng}
                            anchor="bottom"
                        >
                            <div style={{ fontSize: '2rem' }}>🚚</div>
                        </Marker>
                    </Map>

                    <div className="map-overlay">
                        <h3>Position Actuelle</h3>
                        <p>Latitude: {location.lat.toFixed(6)}</p>
                        <p>Longitude: {location.lng.toFixed(6)}</p>
                        {!MAPBOX_TOKEN.startsWith("pk.") && (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Missing Mapbox Token</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
