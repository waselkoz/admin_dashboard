import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Link } from 'react-router-dom';

// TODO: Replace with your actual Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWlzc291IiwiYSI6ImNtaWhtM2t5MzBrMnUzY3FzcTVtNHNpZ3EifQ.rR88Ai9y1Iv8Igs8KdIuYg';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Distinct Color Palette
const DRIVER_COLORS = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const getDriverColor = (driverId) => {
    const num = parseInt(driverId.split('-')[1]) || 0;
    return DRIVER_COLORS[num % DRIVER_COLORS.length];
};

const DriverMarker = ({ map, driver, onClick, onHover, onLeave }) => {
    const markerRef = useRef(null);
    const currentPos = useRef([driver.lng, driver.lat]);
    const requestRef = useRef();

    useEffect(() => {
        if (!map) return;

        const el = document.createElement('div');
        el.className = 'driver-marker';
        el.innerHTML = `<div style="
            background-color: ${getDriverColor(driver.driverId)};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        ">${driver.driverId.split('-')[1]}</div>`;
        el.style.cursor = 'pointer';

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(driver, currentPos.current);
        });

        el.addEventListener('mouseenter', () => onHover(driver, currentPos.current));
        el.addEventListener('mouseleave', onLeave);

        const marker = new mapboxgl.Marker(el)
            .setLngLat(currentPos.current)
            .addTo(map);

        markerRef.current = marker;

        return () => marker.remove();
    }, [map, driver.driverId]);

    // Animation
    useEffect(() => {
        const animate = () => {
            const [curLng, curLat] = currentPos.current;
            const targetLng = driver.lng;
            const targetLat = driver.lat;

            const distLng = targetLng - curLng;
            const distLat = targetLat - curLat;

            if (Math.abs(distLng) < 0.00001 && Math.abs(distLat) < 0.00001) {
                if (markerRef.current) markerRef.current.setLngLat([targetLng, targetLat]);
                currentPos.current = [targetLng, targetLat];
                return;
            }

            const ease = 0.1;
            const newLng = curLng + distLng * ease;
            const newLat = curLat + distLat * ease;

            currentPos.current = [newLng, newLat];
            if (markerRef.current) markerRef.current.setLngLat([newLng, newLat]);

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [driver.lng, driver.lat]);

    return null;
};

const POSTS = [
    { name: 'Zeralda Post', lat: 36.71, lng: 2.85 },
    { name: 'Hydra Post', lat: 36.75, lng: 3.04 }
];

const MapTab = ({ backendUrl = 'http://localhost:3000', focusDriverId }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [drivers, setDrivers] = useState({});
    const [mapLoaded, setMapLoaded] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
            center: [3.05, 36.75],
            zoom: 12
        });

        map.on('load', () => {
            setMapLoaded(true);
            mapRef.current = map;

            // Add Posts
            POSTS.forEach(post => {
                const el = document.createElement('div');
                el.innerHTML = '📮';
                el.style.fontSize = '24px';
                new mapboxgl.Marker(el)
                    .setLngLat([post.lng, post.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<b>${post.name}</b>`))
                    .addTo(map);
            });
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Socket & Route Lines
    useEffect(() => {
        socketRef.current = io(backendUrl);
        const socket = socketRef.current;
        const tracked = JSON.parse(localStorage.getItem('trackedDrivers') || '[]');
        const trackedIds = new Set(tracked.map(d => d.driverId));

        socket.on('connect', () => console.log('Connected to backend'));

        socket.onAny((eventName, ...args) => {
            if (eventName.startsWith('live:')) {
                const driverId = eventName.split(':')[1];
                if (!trackedIds.has(driverId)) return;

                const data = args[0];
                setDrivers(prev => ({
                    ...prev,
                    [driverId]: { driverId, ...data }
                }));

                // Update Route Line
                if (mapRef.current && mapLoaded && data.destination) {
                    const sourceId = `route-${driverId}`;
                    const coordinates = [
                        [data.lng, data.lat],
                        [data.destination.lng, data.destination.lat]
                    ];

                    const geojson = {
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates }
                    };

                    if (mapRef.current.getSource(sourceId)) {
                        mapRef.current.getSource(sourceId).setData(geojson);
                    } else {
                        mapRef.current.addSource(sourceId, { type: 'geojson', data: geojson });
                        mapRef.current.addLayer({
                            id: sourceId,
                            type: 'line',
                            source: sourceId,
                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                            paint: {
                                'line-color': getDriverColor(driverId),
                                'line-width': 3,
                                'line-opacity': 0.6,
                                'line-dasharray': [2, 2]
                            }
                        });
                    }
                }
            }
        });

        return () => socket.disconnect();
    }, [backendUrl, mapLoaded]);

    const currentPopup = useRef(null);

    const showPopup = (driver, position) => {
        if (!mapRef.current) return;

        // Remove existing popup
        if (currentPopup.current) {
            currentPopup.current.remove();
        }

        const popup = new mapboxgl.Popup({ closeButton: false, className: 'glass-popup' })
            .setLngLat(position)
            .setHTML(`
                <div style="padding: 8px;">
                    <h3 style="margin: 0; color: #1e293b;">${driver.driverId}</h3>
                    <p style="margin: 4px 0 0; color: #64748b;">${driver.sacId || 'No Sac'}</p>
                </div>
            `)
            .addTo(mapRef.current);

        currentPopup.current = popup;
    };

    const handleMarkerClick = (driver, position) => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: position, zoom: 15 });
        showPopup(driver, position);
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
                    <Link to="/map" className="nav-item active">
                        <span>🗺️</span> Live Map
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <span>⚙️</span> Settings
                    </Link>
                </nav>

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Active Drivers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {Object.values(drivers).map(driver => (
                            <div
                                key={driver.driverId}
                                onClick={() => handleMarkerClick(driver, [driver.lng, driver.lat])}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '1rem',
                                    cursor: 'pointer',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: getDriverColor(driver.driverId)
                                }} />
                                <div>
                                    <div style={{ fontWeight: '600' }}>{driver.driverId}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {driver.sacId || 'Idle'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Map */}
            <main className="main-content" style={{ padding: 0, position: 'relative', height: '100vh', overflow: 'hidden' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
                {mapLoaded && Object.values(drivers).map(driver => (
                    <DriverMarker
                        key={driver.driverId}
                        map={mapRef.current}
                        driver={driver}
                        onClick={handleMarkerClick}
                        onHover={() => { }}
                        onLeave={() => { }}
                    />
                ))}
            </main>
        </div>
    );
};

export default MapTab;
