import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Replace with your actual Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWlzc291IiwiYSI6ImNtaWhtM2t5MzBrMnUzY3FzcTVtNHNpZ3EifQ.rR88Ai9y1Iv8Igs8KdIuYg';
// Note: You must provide a valid token for the map to load.

mapboxgl.accessToken = MAPBOX_TOKEN;

// Distinct Color Palette
const DRIVER_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16'  // Lime
];

// Helper to generate distinct colors
const getDriverColor = (driverId) => {
    // Extract number from driverId (e.g., "driver-1" -> 1)
    const num = parseInt(driverId.split('-')[1]) || 0;
    return DRIVER_COLORS[num % DRIVER_COLORS.length];
};

const DriverMarker = ({ map, driver, onClick, onHover, onLeave }) => {
    const markerRef = useRef(null);
    const requestRef = useRef();
    const currentPos = useRef([driver.lng, driver.lat]); // Mapbox uses [lng, lat]
    const targetPos = useRef([driver.lng, driver.lat]);

    // Update target when driver prop changes
    useEffect(() => {
        targetPos.current = [driver.lng, driver.lat];
    }, [driver.lng, driver.lat]);

    const driverRef = useRef(driver);

    // Update driver ref when prop changes
    useEffect(() => {
        driverRef.current = driver;
    }, [driver]);

    // Initialize marker
    useEffect(() => {
        if (!map) return;

        const el = document.createElement('div');
        el.className = 'driver-marker';
        el.style.backgroundColor = getDriverColor(driver.driverId);
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        el.style.cursor = 'pointer';

        // Click handling
        el.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click
            onClick(driverRef.current, currentPos.current);
        });

        // Hover handling
        el.addEventListener('mouseenter', () => {
            onHover(driverRef.current, currentPos.current);
        });

        el.addEventListener('mouseleave', () => {
            onLeave();
        });

        const marker = new mapboxgl.Marker(el)
            .setLngLat(currentPos.current)
            .addTo(map);

        markerRef.current = marker;

        return () => {
            marker.remove();
        };
    }, [map, driver.driverId]); // Re-create if map or ID changes (unlikely)

    // Animation loop
    useEffect(() => {
        const animate = () => {
            const [curLng, curLat] = currentPos.current;
            const [targetLng, targetLat] = targetPos.current;

            const distLng = targetLng - curLng;
            const distLat = targetLat - curLat;

            // Stop if close enough
            if (Math.abs(distLng) < 0.00001 && Math.abs(distLat) < 0.00001) {
                if (markerRef.current) {
                    markerRef.current.setLngLat([targetLng, targetLat]);
                }
                currentPos.current = [targetLng, targetLat];
                return;
            }

            const ease = 0.1;
            const newLng = curLng + distLng * ease;
            const newLat = curLat + distLat * ease;

            currentPos.current = [newLng, newLat];
            if (markerRef.current) {
                markerRef.current.setLngLat([newLng, newLat]);
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [driver.lng, driver.lat]);

    return null;
};

// Post Locations
const POSTS = [
    { name: 'Zeralda Post', lat: 36.71, lng: 2.85 },
    { name: 'Hydra Post', lat: 36.75, lng: 3.04 }
];

// Haversine Distance Calculation (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const MapTab = ({ backendUrl = 'http://localhost:3000', focusDriverId }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [drivers, setDrivers] = useState({});
    const [mapLoaded, setMapLoaded] = useState(false);
    const socketRef = useRef(null);

    // Initialize Map
    useEffect(() => {
        if (mapRef.current) return; // Already initialized

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [3.05, 36.75], // [lng, lat] for Algiers
            zoom: 12
        });

        map.on('load', () => {
            setMapLoaded(true);
            mapRef.current = map;

            // Add Post Markers
            POSTS.forEach(post => {
                const el = document.createElement('div');
                el.className = 'post-marker';
                el.style.backgroundColor = '#1e293b'; // Dark blue/black
                el.style.width = '24px';
                el.style.height = '24px';
                el.style.borderRadius = '4px'; // Square for posts
                el.style.border = '2px solid white';
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                el.style.cursor = 'pointer';
                el.title = post.name;

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

    // Socket.IO Connection
    useEffect(() => {
        socketRef.current = io(backendUrl);
        const socket = socketRef.current;

        // Get tracked drivers from localStorage
        const tracked = JSON.parse(localStorage.getItem('trackedDrivers') || '[]');
        const trackedIds = new Set(tracked.map(d => d.driverId));

        socket.on('connect', () => {
            console.log('Connected to backend');
        });

        socket.onAny((eventName, ...args) => {
            if (eventName.startsWith('live:')) {
                const driverId = eventName.split(':')[1];

                // Only process if tracked
                if (!trackedIds.has(driverId)) return;

                const data = args[0]; // { lat, lng, sacId: [], destination: {} }

                // Debug Toast
                // if (data.sacId) {
                //    toast.success(`Driver ${driverId} update: ${data.sacId}`, { id: `debug-${driverId}` });
                // }

                setDrivers(prev => ({
                    ...prev,
                    [driverId]: {
                        driverId,
                        lat: data.lat,
                        lng: data.lng,
                        sacId: data.sacId || null,
                        destination: data.destination
                    }
                }));
            }
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [backendUrl]);

    const popupRef = useRef(null);

    const showPopup = (driver, position) => {
        if (!mapRef.current) return;

        // Remove existing popup
        if (popupRef.current) {
            popupRef.current.remove();
        }

        // Create new popup
        const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(position)
            .setHTML(`
                <div style="min-width: 150px; font-family: 'Inter', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; border-bottom: 2px solid #dc2626; padding-bottom: 4px; color: #1e293b; font-size: 14px; font-weight: 700;">
                        ${driver.driverId}
                    </h3>
                    <div>
                        <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Sac ID:</strong>
                        ${(driver.sacId)
                    ? `<div style="margin-top: 4px; color: #334155; font-size: 14px; font-weight: 600;">
                                ${driver.sacId}
                               </div>`
                    : '<div style="color: #94a3b8; font-style: italic; font-size: 12px; margin-top: 4px;">No Sac Assigned</div>'
                }
                    </div>
                </div>
            `)
            .addTo(mapRef.current);

        popupRef.current = popup;
    };

    const hidePopup = () => {
        if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }
    };

    const handleMarkerClick = (driver, position) => {
        if (!mapRef.current) return;

        // Pan to driver
        mapRef.current.flyTo({
            center: position,
            zoom: 15,
            speed: 1.2
        });

        showPopup(driver, position);
    };

    const hasFlownToDriver = useRef(false);

    // Reset fly status when focusDriverId changes
    useEffect(() => {
        hasFlownToDriver.current = false;
    }, [focusDriverId]);

    // Handle focusDriverId
    useEffect(() => {
        if (!mapLoaded || !focusDriverId || !drivers[focusDriverId]) return;
        if (hasFlownToDriver.current) return; // Already flown

        const driver = drivers[focusDriverId];
        const position = [driver.lng, driver.lat];

        handleMarkerClick(driver, position);
        hasFlownToDriver.current = true;

    }, [mapLoaded, focusDriverId, drivers]);

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>
            {/* Sidebar - Now static on the left */}
            <div style={{
                width: '300px',
                height: '100%',
                background: '#ffffff',
                borderRight: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
                zIndex: 10,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: '#1e293b',
                    borderLeft: '4px solid #dc2626', // Red accent
                    paddingLeft: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Active Drivers
                </h3>

                {Object.keys(drivers).length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                    }}>
                        No drivers active
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {Object.values(drivers).map(driver => (
                            <li
                                key={driver.driverId}
                                onClick={() => {
                                    const position = [driver.lng, driver.lat];
                                    handleMarkerClick(driver, position);
                                }}
                                style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#dc2626';
                                    e.currentTarget.style.background = '#fef2f2'; // Light red
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fee2e2', // Light red bg for icon
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#dc2626',
                                    fontWeight: 'bold',
                                    border: '2px solid #fecaca'
                                }}>
                                    {driver.driverId.charAt(driver.driverId.length - 1)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>
                                            {driver.driverId}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                            {driver.sacId && driver.sacId.length > 0 ? `${driver.sacId.length} Active Sacs` : 'Online'}
                                        </span>
                                    </div>

                                    {/* Nearest Post & Distance */}
                                    {(() => {
                                        let nearest = null;
                                        let minDist = Infinity;
                                        POSTS.forEach(post => {
                                            const dist = calculateDistance(driver.lat, driver.lng, post.lat, post.lng);
                                            if (dist < minDist) {
                                                minDist = dist;
                                                nearest = post;
                                            }
                                        });
                                        return nearest ? (
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                                Nearest: <strong>{nearest.name}</strong> ({minDist.toFixed(1)} km)
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Show Destination Button */}
                                    {driver.destination && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (mapRef.current) {
                                                    mapRef.current.flyTo({
                                                        center: [driver.destination.lng, driver.destination.lat],
                                                        zoom: 14,
                                                        speed: 1.5
                                                    });
                                                    new mapboxgl.Popup()
                                                        .setLngLat([driver.destination.lng, driver.destination.lat])
                                                        .setHTML(`<b>Destination: ${driver.destination.name}</b>`)
                                                        .addTo(mapRef.current);
                                                }
                                            }}
                                            style={{
                                                marginTop: '8px',
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                background: '#fee2e2',
                                                color: '#dc2626',
                                                border: '1px solid #fecaca',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            Show Destination
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map Container - Takes remaining space */}
            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

                {/* Render DriverMarkers only when map is loaded */}
                {mapLoaded && Object.values(drivers).map(driver => (
                    <DriverMarker
                        key={driver.driverId}
                        map={mapRef.current}
                        driver={driver}
                        onClick={handleMarkerClick}
                        onHover={showPopup}
                        onLeave={hidePopup}
                    />
                ))}
            </div>
        </div>
    );
};

export default MapTab;
