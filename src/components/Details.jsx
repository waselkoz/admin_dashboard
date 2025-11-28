import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Details = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sacId = location.state?.sacId || 'Sac-017';

    // Mock Data
    const [items, setItems] = useState([
        { id: 'yal 01202', name: 'Colis Standard', hash: 'a1b2c3d4', revealed: false },
        { id: 'yal 01203', name: 'Document Urgent', hash: 'e5f67890', revealed: false },
        { id: 'yal 01204', name: 'Petit Paquet', hash: '12345678', revealed: false },
    ]);

    const handleRevealHash = (itemId) => {
        const code = prompt("Enter Security Code (Mock: 1234):");

        if (code === "1234") {
            setItems(items.map(item =>
                item.id === itemId ? { ...item, revealed: true } : item
            ));
        } else {
            alert("Incorrect Code!");
        }
    };

    return (
        <div className="details-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                &larr; Retour au Dashboard
            </button>

            <div className="details-card">
                <header className="details-header">
                    <h1>Détails du Sac</h1>
                    <div className="sac-badge">{sacId}</div>
                </header>

                <div className="items-section">
                    <h2>Contenu du Sac</h2>
                    <ul className="items-list">
                        {items.map((item) => (
                            <li key={item.id} className="item-row">
                                <div className="item-info">
                                    <span className="item-id">{item.id}</span>
                                    <span className="item-name">{item.name}</span>
                                </div>

                                <div className="hash-section">
                                    {item.revealed ? (
                                        <span className="hash-code">{item.hash}</span>
                                    ) : (
                                        <button
                                            className="btn-hash"
                                            onClick={() => handleRevealHash(item.id)}
                                        >
                                            <span>🔒</span> Voir Hash
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Details;
