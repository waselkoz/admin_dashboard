import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Details = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const delivery = location.state?.delivery || { livreur: 'Unknown', sac: 'Unknown' };

    const [items, setItems] = useState([
        { id: 'yal 01202', name: 'Colis Standard', hash: 'a1b2c3d4', unlocked: false },
        { id: 'yal 01203', name: 'Document Urgent', hash: 'e5f6g7h8', unlocked: false },
        { id: 'yal 01204', name: 'Petit Paquet', hash: 'i9j0k1l2', unlocked: false },
    ]);

    const handleUnlock = (itemId) => {
        const code = window.prompt("Enter Security Code:");
        if (code === "1234") { // Mock code
            setItems(items.map(item =>
                item.id === itemId ? { ...item, unlocked: true } : item
            ));
        } else if (code !== null) {
            alert("Incorrect Code!");
        }
    };

    return (
        <div className="details-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                &larr; Retour au Dashboard
            </button>

            <div className="details-card">
                <header className="dashboard-header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <div>
                        <h1>{delivery.livreur}</h1>
                        <span style={{ color: 'var(--text-secondary)' }}>Sac ID: </span>
                        <span className="sac-badge">{delivery.sac}</span>
                    </div>
                </header>

                <div className="items-list">
                    {items.map((item) => (
                        <div key={item.id} className="item-row">
                            <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-id">{item.id}</span>
                            </div>

                            <div className="hash-section">
                                {item.unlocked ? (
                                    <div className="hash-display">{item.hash}</div>
                                ) : (
                                    <button
                                        className="btn-outline"
                                        onClick={() => handleUnlock(item.id)}
                                    >
                                        Voir Hash
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Details;
