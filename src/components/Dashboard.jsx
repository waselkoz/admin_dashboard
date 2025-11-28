import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock Data State - Initialized from localStorage or empty
    const [deliveries, setDeliveries] = useState(() => {
        const saved = localStorage.getItem('trackedDrivers');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage whenever deliveries change
    React.useEffect(() => {
        localStorage.setItem('trackedDrivers', JSON.stringify(deliveries));
    }, [deliveries]);

    const [newDriverId, setNewDriverId] = useState('');

    const handleAddDriver = async () => {
        if (!newDriverId) return;

        // Check if already exists
        if (deliveries.some(d => d.driverId === newDriverId)) {
            toast.error('Driver already added!');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/verify-driver/${newDriverId}`);
            const data = await res.json();

            if (data.valid) {
                const newDriver = {
                    id: Date.now(), // Internal ID for React keys
                    name: `Driver ${newDriverId.split('-')[1]}`, // Simple name generation
                    sacId: null, // Force empty Sac ID
                    status: 'On',
                    driverId: newDriverId
                };
                setDeliveries([...deliveries, newDriver]);
                setNewDriverId('');
                toast.success(`${newDriverId} added successfully!`);
            } else {
                toast.error('Driver ID not found in system.');
            }
        } catch (error) {
            console.error('Error verifying driver:', error);
            toast.error('Failed to verify driver. Is backend running?');
        }
    };

    const [inputValues, setInputValues] = useState({});

    const handleInputChange = (id, value) => {
        setInputValues({ ...inputValues, [id]: value });
    };

    const assignSac = async (id) => {
        const sacId = inputValues[id];
        if (!sacId) return;

        // Regex Validation: sac-XXX (case insensitive)
        const sacRegex = /^sac-\d+$/i;
        if (!sacRegex.test(sacId)) {
            toast.error('Invalid ID format! Please use "sac-XXX" (e.g., sac-012).');
            return;
        }

        // Find driver ID associated with this delivery row
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        try {
            await fetch(`http://localhost:3000/driver/${delivery.driverId}/sac`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sacId, action: 'add' })
            });

            setDeliveries(deliveries.map(d =>
                d.id === id ? { ...d, sacId: sacId, status: 'On' } : d
            ));

            toast.success(`Sac ${sacId} assigned successfully!`);

            // Clear input
            const newInputValues = { ...inputValues };
            delete newInputValues[id];
            setInputValues(newInputValues);
        } catch (error) {
            console.error('Error assigning Sac:', error);
            toast.error('Failed to update backend.');
        }
    };

    const unassignSac = (id) => {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Unassign this Sac?</span>
                <button
                    onClick={async () => {
                        try {
                            await fetch(`http://localhost:3000/driver/${delivery.driverId}/sac`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sacId: delivery.sacId, action: 'remove' })
                            });

                            setDeliveries(prev => prev.map(d =>
                                d.id === id ? { ...d, sacId: null, status: 'Off' } : d
                            ));
                            toast.dismiss(t.id);
                            toast.success('Sac unassigned!');
                        } catch (error) {
                            console.error('Error unassigning Sac:', error);
                            toast.error('Failed to update backend.');
                        }
                    }}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Yes
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                        background: '#e2e8f0',
                        color: '#1e293b',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    No
                </button>
            </div>
        ), { duration: 5000 });
    };

    const removeDriver = (id) => {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Remove this driver?</span>
                <button
                    onClick={async () => {
                        // Clear backend state first
                        try {
                            await fetch(`http://localhost:3000/driver/${delivery.driverId}/sac`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sacId: null, action: 'remove' })
                            });
                        } catch (err) {
                            console.error('Failed to clear backend state:', err);
                        }

                        setDeliveries(prev => prev.filter(d => d.id !== id));
                        toast.dismiss(t.id);
                        toast.success('Driver removed!');
                    }}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Yes
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                        background: '#e2e8f0',
                        color: '#1e293b',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    No
                </button>
            </div>
        ), { duration: 5000 });
    };

    const handleLocateDriver = (driverId, driverName) => {
        if (driverId) {
            navigate('/map', { state: { focusDriverId: driverId, focusDriverName: driverName } });
        }
    };

    return (
        <div className="dashboard-container">
            <Toaster position="top-center" reverseOrder={false} />
            <header className="dashboard-header">
                <h1>Delivery Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Add Driver ID (e.g. driver-5)"
                            value={newDriverId}
                            onChange={(e) => setNewDriverId(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        />
                        <button
                            onClick={handleAddDriver}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Add
                        </button>
                    </div>
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
                            <span
                                className="driver-name-link"
                                onClick={() => handleLocateDriver(delivery.driverId, delivery.name)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                title="Locate on Map"
                            >
                                {delivery.name}
                            </span>
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
                                <>
                                    <button
                                        className="btn-view"
                                        onClick={() => navigate('/details', { state: { sacId: delivery.sacId } })}
                                    >
                                        Voir
                                    </button>
                                    <button
                                        className="btn-unassign"
                                        onClick={() => unassignSac(delivery.id)}
                                        style={{
                                            marginLeft: '8px',
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ef4444',
                                            background: 'white',
                                            color: '#ef4444',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#ef4444';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                    >
                                        Unassign
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => removeDriver(delivery.id)}
                                style={{
                                    marginLeft: '8px',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                title="Remove Driver"
                            >
                                &#10005;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
