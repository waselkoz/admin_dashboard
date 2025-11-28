import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock Data State
    const [deliveries, setDeliveries] = useState([
        { id: 1, name: 'Ahmed', sacId: 'Sac-017', status: 'On' },
        { id: 2, name: 'Karim', sacId: null, status: 'Off' },
        { id: 3, name: 'Sarah', sacId: null, status: 'Off' },
        { id: 4, name: 'Yassine', sacId: 'Sac-042', status: 'On' },
    ]);

    const [inputValues, setInputValues] = useState({});

    const handleInputChange = (id, value) => {
        setInputValues({ ...inputValues, [id]: value });
    };

    const assignSac = (id) => {
        const sacId = inputValues[id];
        if (!sacId) return;

        setDeliveries(deliveries.map(d =>
            d.id === id ? { ...d, sacId: sacId, status: 'On' } : d
        ));

        // Clear input
        const newInputValues = { ...inputValues };
        delete newInputValues[id];
        setInputValues(newInputValues);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Delivery Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn-map" onClick={() => navigate('/map')}>
                        Map
                    </button>
                    <span className="badge">Admin Panel</span>
                </div>
            </header>

            <div className="dashboard-table">
                <div className="table-header">
                    <div>Livreur</div>
                    <div>Sac ID</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>

                {deliveries.map((delivery) => (
                    <div key={delivery.id} className="table-row">
                        {/* Livreur Column */}
                        <div className="col-livreur">
                            <div className="avatar">{delivery.name.charAt(0)}</div>
                            <span>{delivery.name}</span>
                        </div>

                        {/* Sac Column */}
                        <div className="col-sac">
                            {delivery.sacId ? (
                                <span className="sac-badge">{delivery.sacId}</span>
                            ) : (
                                <div className="sac-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter ID..."
                                        className="sac-input"
                                        value={inputValues[delivery.id] || ''}
                                        onChange={(e) => handleInputChange(delivery.id, e.target.value)}
                                    />
                                    <button
                                        className="btn-assign"
                                        onClick={() => assignSac(delivery.id)}
                                    >
                                        Assign
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status Column */}
                        <div className="col-status">
                            <span className={`status-badge ${delivery.status.toLowerCase()}`}>
                                <span className="status-dot"></span>
                                {delivery.status}
                            </span>
                        </div>

                        {/* Actions Column */}
                        <div className="col-actions">
                            {delivery.sacId && (
                                <button
                                    className="btn-view"
                                    onClick={() => navigate('/details', { state: { sacId: delivery.sacId } })}
                                >
                                    Voir
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
