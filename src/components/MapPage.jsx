import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapTab from './MapTab';

const MapPage = () => {
    const navigate = useNavigate();

    return (
        <div className="details-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                &larr; Retour au Dashboard
            </button>

            <div className="details-card">
                <header className="details-header">
                    <h1>Carte en Direct</h1>
                    <div className="badge">Socket.io Ready</div>
                </header>

                <div className="map-container-wrapper">
                    <MapTab />
                </div>
            </div>
        </div>
    );
};

export default MapPage;
