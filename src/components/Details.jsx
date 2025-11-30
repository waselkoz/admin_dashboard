import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Details = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sacId = location.state?.sacId || 'Sac-017';
    const driverName = location.state?.driverName || 'Unknown Driver';

    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);

    // Mock Data for Items
    const [items] = useState([
        { id: '01202', name: 'Colis Standard', weight: '2.5 kg', status: 'In Transit' },
        { id: '01203', name: 'Document Urgent', weight: '0.1 kg', status: 'Pending' },
        { id: '01204', name: 'Petit Paquet', weight: '1.2 kg', status: 'Delivered' },
    ]);

    // Mock Data for Driver (simulating a fetch)
    const driverInfo = {
        name: driverName,
        vehicle: 'Scooter Yamaha NMAX',
        rating: 4.8,
        phone: '+213 555 123 456',
        trips: 124
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">FastTrack</div>
                <nav className="nav-links">
                    <Link to="/" className="nav-item">
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/map" className="nav-item">
                        <span>🗺️</span> Live Map
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <span>⚙️</span> Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} className="btn-glass">
                            &larr; Back
                        </button>
                        <h1 style={{ margin: 0 }}>Delivery Details</h1>
                    </div>
                </header>

                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', display: 'grid', gap: '2rem' }}>
                    {/* Driver Info Card */}
                    <div className="glass-panel card">
                        <div className="card-header">
                            <h2>Driver Information</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: 'white',
                                marginBottom: '1rem',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                            }}>
                                {driverInfo.name.charAt(0)}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{driverInfo.name}</h3>
                            <div style={{ color: '#fbbf24', marginTop: '0.25rem' }}>
                                {'★'.repeat(Math.floor(driverInfo.rating))}
                                <span style={{ color: 'var(--text-secondary)', marginLeft: '4px', fontSize: '0.875rem' }}>
                                    ({driverInfo.rating})
                                </span>
                            </div>
                        </div>

                        <div className="info-row" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Vehicle</span>
                            <span style={{ fontWeight: '600' }}>{driverInfo.vehicle}</span>
                        </div>
                        <div className="info-row" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                            <span style={{ fontWeight: '600' }}>{driverInfo.phone}</span>
                        </div>
                        <div className="info-row" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Trips</span>
                            <span style={{ fontWeight: '600' }}>{driverInfo.trips}</span>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => setShowChat(true)}
                        >
                            💬 Message Driver
                        </button>
                    </div>

                    {/* Sac Content Card */}
                    <div className="glass-panel card">
                        <div className="card-header">
                            <h2>Sac Content</h2>
                            <span className="status-badge status-active">{sacId}</span>
                        </div>

                        <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem' }}>Item ID</th>
                                    <th style={{ padding: '1rem' }}>Description</th>
                                    <th style={{ padding: '1rem' }}>Weight</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--primary)' }}>{item.id}</td>
                                        <td style={{ padding: '1rem' }}>{item.name}</td>
                                        <td style={{ padding: '1rem' }}>{item.weight}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`status-badge ${item.status === 'Delivered' ? 'status-completed' :
                                                item.status === 'In Transit' ? 'status-active' : 'status-pending'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chat Modal */}
                {showChat && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="glass-panel" style={{ width: '400px', height: '500px', display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Chat with {driverInfo.name}</h3>
                                <button onClick={() => setShowChat(false)} className="btn-glass" style={{ padding: '4px 8px' }}>✕</button>
                            </div>
                            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem 1rem 1rem 0' }}>
                                    Hello! I am on my way to the destination.
                                </div>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{ alignSelf: 'flex-end', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '1rem 1rem 0 1rem' }}>
                                        {msg}
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="search-bar"
                                    style={{ flex: 1 }}
                                    placeholder="Type a message..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value) {
                                            setMessages([...messages, e.target.value]);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button className="btn-primary">Send</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Details;
