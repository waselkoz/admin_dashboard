import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock Data State
    const [deliveries, setDeliveries] = useState(() => {
        const saved = localStorage.getItem('trackedDrivers');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('trackedDrivers', JSON.stringify(deliveries));
    }, [deliveries]);

    const [newDriverId, setNewDriverId] = useState('');

    const handleAddDriver = async () => {
        if (!newDriverId) return;

        if (deliveries.some(d => d.driverId === newDriverId)) {
            toast.error('Driver already added!');
            return;
        }

        const newDriver = {
            id: Date.now(),
            name: newDriverId,
            sacId: null,
            status: 'On',
            driverId: newDriverId,
            vehicle: 'Scooter', // Default
            rating: 5.0 // Default
        };
        setDeliveries([...deliveries, newDriver]);
        setNewDriverId('');
        toast.success(`${newDriverId} added successfully!`);
    };

    const [inputValues, setInputValues] = useState({});

    const handleInputChange = (id, value) => {
        setInputValues({ ...inputValues, [id]: value });
    };

    const assignSac = async (id) => {
        const sacId = inputValues[id];
        if (!sacId) return;

        const sacRegex = /^sac-\d+$/i;
        if (!sacRegex.test(sacId)) {
            toast.error('Invalid ID format! Please use "sac-XXX" (e.g., sac-012).');
            return;
        }

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
                    className="btn-primary"
                    style={{ background: '#ef4444', padding: '4px 8px', fontSize: '0.8rem' }}
                >
                    Yes
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="btn-glass"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
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
                <span>Remove driver?</span>
                <button
                    onClick={async () => {
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
                    className="btn-primary"
                    style={{ background: '#ef4444', padding: '4px 8px', fontSize: '0.8rem' }}
                >
                    Yes
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="btn-glass"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
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

    // Filtered deliveries
    const filteredDeliveries = deliveries.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.sacId && d.sacId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Stats
    const activeDrivers = deliveries.filter(d => d.status === 'On').length;
    const totalDrivers = deliveries.length;
    const efficiency = totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0;

    // Dynamic Analytics
    const [timeRange, setTimeRange] = useState('week');
    const [hoveredBar, setHoveredBar] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState([45, 60, 75, 50, 80, 95, 70]);

    useEffect(() => {
        // Mock data update based on time range
        if (timeRange === 'week') {
            const activeCount = deliveries.filter(d => d.status === 'On').length;
            setWeeklyStats(prev => {
                const newStats = [45, 60, 75, 50, 80, 95, 70];
                newStats[6] = Math.min(100, Math.max(20, activeCount * 15));
                return newStats;
            });
        } else {
            // Month view mock data (4 weeks)
            setWeeklyStats([320, 450, 380, 510]);
        }
    }, [deliveries, timeRange]);

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Sac ID', 'Status', 'Vehicle', 'Rating'];
        const csvContent = [
            headers.join(','),
            ...deliveries.map(d => [
                d.id,
                `"${d.name}"`,
                d.sacId || '',
                d.status,
                d.vehicle,
                d.rating
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'deliveries_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exported successfully!');
    };

    return (
        <div className="app-container">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }} />

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">FastTrack</div>
                <nav className="nav-links">
                    <Link to="/" className="nav-item active">
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
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Overview</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage your fleet and shipments</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleExport} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📥</span> Export CSV
                        </button>
                        <input
                            type="text"
                            placeholder="Search drivers or sacs..."
                            className="search-bar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Add Name/ID"
                                value={newDriverId}
                                onChange={(e) => setNewDriverId(e.target.value)}
                                className="search-bar"
                                style={{ width: '150px' }}
                            />
                            <button onClick={handleAddDriver} className="btn-primary">
                                + Add
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-value">{totalDrivers}</span>
                        <span className="stat-label">Total Drivers</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {activeDrivers}
                        </span>
                        <span className="stat-label">Active Deliveries</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{efficiency}%</span>
                        <span className="stat-label">Efficiency</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value" style={{ color: 'var(--accent)' }}>0</span>
                        <span className="stat-label">Pending Issues</span>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="glass-panel card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Delivery Volume</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {weeklyStats.reduce((a, b) => a + b, 0)}
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>Total</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {Math.round(weeklyStats.reduce((a, b) => a + b, 0) / weeklyStats.length)}
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>Avg</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                                    +12.5% <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>vs last period</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                            {['Week', 'Month'].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setTimeRange(period.toLowerCase())}
                                    style={{
                                        background: timeRange === period.toLowerCase() ? 'var(--primary)' : 'transparent',
                                        color: timeRange === period.toLowerCase() ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '10px' }}>
                        {weeklyStats.map((height, i) => (
                            <div
                                key={i}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}
                                onMouseEnter={() => setHoveredBar(i)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                {hoveredBar === i && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        marginBottom: '8px',
                                        background: '#1e293b',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        border: '1px solid var(--border)',
                                        zIndex: 10,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {height} Deliveries
                                    </div>
                                )}
                                <div style={{
                                    width: '100%',
                                    height: `${(height / Math.max(...weeklyStats)) * 100}%`,
                                    background: hoveredBar === i ? 'var(--primary)' : `linear-gradient(to top, var(--primary-glow), var(--primary))`,
                                    borderRadius: '4px 4px 0 0',
                                    opacity: hoveredBar === i ? 1 : 0.8,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }} />
                                <span style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {timeRange === 'week'
                                        ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]
                                        : `${i * 4 + 1}`
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="dashboard-table">
                    <div className="table-header">
                        <div>Driver</div>
                        <div>Sac ID</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>

                    {filteredDeliveries.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No drivers found. Add one to get started.
                        </div>
                    ) : (
                        filteredDeliveries.map((delivery) => (
                            <div key={delivery.id} className="table-row">
                                <div className="col-livreur">
                                    <div className="avatar">{delivery.name.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div
                                            onClick={() => handleLocateDriver(delivery.driverId, delivery.name)}
                                            style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--text-primary)' }}
                                        >
                                            {delivery.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {delivery.vehicle || 'Scooter'} • ⭐ {delivery.rating || '5.0'}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sac">
                                    {delivery.sacId ? (
                                        <span className="sac-badge">{delivery.sacId}</span>
                                    ) : (
                                        <div className="sac-input-group">
                                            <input
                                                type="text"
                                                placeholder="Assign ID..."
                                                className="search-bar"
                                                style={{ padding: '0.4rem 0.8rem', width: '120px', fontSize: '0.875rem' }}
                                                value={inputValues[delivery.id] || ''}
                                                onChange={(e) => handleInputChange(delivery.id, e.target.value)}
                                            />
                                            <button
                                                className="btn-glass"
                                                onClick={() => assignSac(delivery.id)}
                                                style={{ padding: '0.4rem 0.8rem' }}
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="col-status">
                                    <span className={`status-badge ${delivery.status.toLowerCase()}`}>
                                        <span className="status-dot"></span>
                                        {delivery.status}
                                    </span>
                                </div>

                                <div className="col-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    {delivery.sacId && (
                                        <>
                                            <button
                                                className="btn-glass"
                                                onClick={() => navigate('/details', { state: { sacId: delivery.sacId } })}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn-glass"
                                                onClick={() => unassignSac(delivery.id)}
                                                style={{ color: 'var(--primary)', borderColor: 'rgba(239,68,68,0.3)' }}
                                            >
                                                Unassign
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => removeDriver(delivery.id)}
                                        className="btn-glass"
                                        style={{ color: 'var(--primary)', borderColor: 'rgba(239,68,68,0.3)' }}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
