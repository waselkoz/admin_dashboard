import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapTab from './MapTab';

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const focusDriverId = location.state?.focusDriverId;
    const focusDriverName = location.state?.focusDriverName;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Floating Back Button - Red & White Theme */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 20,
                    background: '#dc2626', // Red
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b91c1c'; // Darker red
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'none';
                }}
            >
                &larr; Dashboard
            </button>



            {/* Full Screen Map Tab */}
            <MapTab focusDriverId={focusDriverId} />
        </div>
    );
};

export default MapPage;
