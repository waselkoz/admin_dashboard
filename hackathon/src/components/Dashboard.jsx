import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock data state
    const [deliveries, setDeliveries] = useState([
        { id: 1, livreur: 'Ahmed', sac: 'Sac-017', status: 'On' },
        { id: 2, livreur: 'Karim', sac: null, status: 'Off' },
        { id: 3, livreur: 'Sarah', sac: 'Sac-042', status: 'On' },
        { id: 4, livreur: 'Yassine', sac: null, status: 'Off' },
    ]);

    const [assignInput, setAssignInput] = useState({});

    const handleAssign = (id) => {
        const sacId = assignInput[id];
        if (sacId) {
            setDeliveries(deliveries.map(d =>
                d.id === id ? { ...d, sac: sacId, status: 'On' } : d
            ));
            setAssignInput({ ...assignInput, [id]: '' });
        }
    };

    const handleInputChange = (id, value) => {
        setAssignInput({ ...assignInput, [id]: value });
    };

    return (
        <div className="dashboard-container">
            {/* Highlight Map Section */}
            <div className="highlight-map-banner" onClick={() => navigate('/map')}>
                <div className="highlight-content">
                    <span className="pulse-dot white"></span>
                    <h2>LIVE MAP TRACKING</h2>
                </div>
                <span className="arrow-icon">&rarr;</span>
            </div>

            <header className="dashboard-header">
                <h1>Delivery Dashboard</h1>
                <span className="badge">Admin Panel</span>
            </header>

            <div className="delivery-list">
                {deliveries.map((delivery) => (
                    <div key={delivery.id} className="delivery-row">
                        {/* Livreur Column */}
                        <div className="col-livreur">
                            <div className="avatar">{delivery.livreur.charAt(0)}</div>
                            <span>{delivery.livreur}</span>
                        </div>

                        {/* Sac Column */}
                        <div className="col-sac">
                            {delivery.sac ? (
                                <span className="sac-badge">{delivery.sac}</span>
                            ) : (
                                <div className="assign-container">
                                    <input
                                        type="text"
                                        placeholder="Sac ID"
                                        className="input-sac"
                                        value={assignInput[delivery.id] || ''}
                                        onChange={(e) => handleInputChange(delivery.id, e.target.value)}
                                    />
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleAssign(delivery.id)}
                                    >
                                        Assign
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status Column */}
                        <div className="col-status">
                            <span className={`status-dot ${delivery.status === 'On' ? 'on' : 'off'}`}
                                style={{ backgroundColor: delivery.status === 'On' ? 'var(--success)' : '#cbd5e1' }}>
                            </span>
                            <span>{delivery.status}</span>
                        </div>

                        {/* Actions Column */}
                        <div className="col-actions">
                            <button
                                className="btn-outline"
                                onClick={() => navigate('/details', { state: { delivery } })}
                                disabled={!delivery.sac}
                                style={{ opacity: delivery.sac ? 1 : 0.5, cursor: delivery.sac ? 'pointer' : 'not-allowed' }}
                            >
                                Voir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
