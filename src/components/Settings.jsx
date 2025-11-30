import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('themeColor') || 'red');

    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : { name: 'Admin User', email: 'admin@fasttrack.com' };
    });
    const [isEditing, setIsEditing] = useState(false);

    const [notifications, setNotifications] = useState({
        deliveryUpdates: true,
        driverAlerts: false,
        systemMessages: true
    });

    const handleColorChange = (color) => {
        setAccentColor(color);
        localStorage.setItem('themeColor', color);
        // Update CSS variables globally
        document.documentElement.style.setProperty('--primary', color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6');
        document.documentElement.style.setProperty('--primary-glow', color === 'red' ? 'rgba(239, 68, 68, 0.5)' : color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : color === 'green' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)');
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
                    <div className="nav-item active">
                        <span>⚙️</span> Settings
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Settings</h1>
                </header>
                <Toaster position="top-right" toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }} />

                <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Appearance Card */}
                    <div className="glass-panel card">
                        <div className="card-header">
                            <h2>Appearance</h2>
                        </div>
                        <div style={{ padding: '1rem 0' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Accent Color</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['red', 'blue', 'green', 'purple'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: `3px solid ${accentColor === color ? 'white' : 'transparent'}`,
                                            background: color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#8b5cf6',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s'
                                        }}
                                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div className="glass-panel card">
                        <div className="card-header">
                            <h2>Notifications</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <button
                                        onClick={() => toggleNotification(key)}
                                        style={{
                                            width: '48px',
                                            height: '24px',
                                            background: value ? 'var(--success)' : 'var(--bg-glass-hover)',
                                            borderRadius: '12px',
                                            position: 'relative',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: value ? '26px' : '2px',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="glass-panel card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header">
                            <h2>User Profile</h2>
                            <button
                                className="btn-glass"
                                onClick={() => {
                                    if (isEditing) {
                                        localStorage.setItem('userProfile', JSON.stringify(userProfile));
                                        toast.success('Profile updated!');
                                    }
                                    setIsEditing(!isEditing);
                                }}
                            >
                                {isEditing ? 'Save Profile' : 'Edit Profile'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'white',
                                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                            }}>
                                {userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Name</label>
                                            <input
                                                type="text"
                                                className="search-bar"
                                                value={userProfile.name}
                                                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                                            <input
                                                type="email"
                                                className="search-bar"
                                                value={userProfile.email}
                                                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{userProfile.name}</h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{userProfile.email}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
