import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Replace with your actual Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWlzc291IiwiYSI6ImNtaWhtM2t5MzBrMnUzY3FzcTVtNHNpZ3EifQ.rR88Ai9y1Iv8Igs8KdIuYg'; 
// Note: You must provide a valid token for the map to load.

mapboxgl.accessToken = MAPBOX_TOKEN;

// Helper to generate distinct colors
const getDriverColor = (driverId) => {
    let hash = 0;
    for (let i = 0; i < driverId.length; i++) {
        hash = driverId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
};

const DriverMarker = ({ map, driver, onClick }) => {
    const markerRef = useRef(null);
    const requestRef = useRef();
    const currentPos = useRef([driver.lng, driver.lat]); // Mapbox uses [lng, lat]
    const targetPos = useRef([driver.lng, driver.lat]);

    // Update target when driver prop changes
    useEffect(() => {
        targetPos.current = [driver.lng, driver.lat];
    }, [driver.lng, driver.lat]);

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
            onClick(driver, currentPos.current);
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
                return; // Stop loop until next update restarts it? 
                // Actually, for React `requestAnimationFrame` usually runs continuously or we restart it.
                // Here we'll just keep it running for simplicity, or we could optimize.
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
    }, [driver.lng, driver.lat]); // Restart animation loop logic if target changes

    return null; // This component doesn't render DOM itself, it manages a Mapbox marker
};

const MapTab = ({ backendUrl = 'http://localhost:3000' }) => {
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

        socket.on('connect', () => {
            console.log('Connected to backend');
        });

        socket.onAny((eventName, ...args) => {
            if (eventName.startsWith('live:')) {
                const driverId = eventName.split(':')[1];
                const data = args[0]; // { lat, lng, sacId: [] }
                
                setDrivers(prev => ({
                    ...prev,
                    [driverId]: {
                        driverId,
                        lat: data.lat,
                        lng: data.lng,
                        sacId: data.sacId || []
                    }
                }));
            }
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [backendUrl]);

    const handleMarkerClick = (driver, position) => {
        if (!mapRef.current) return;

        // Pan to driver
        mapRef.current.flyTo({
            center: position,
            zoom: 15,
            speed: 1.2
        });

        // Show popup
        new mapboxgl.Popup()
            .setLngLat(position)
            .setHTML(`
                <div style="min-width: 150px; font-family: sans-serif;">
                    <h3 style="margin: 0 0 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                        Driver: ${driver.driverId}
                    </h3>
                    <div>
                        <strong>SAC-IDs:</strong>
                        <ul style="margin: 4px 0; padding-left: 20px;">
                            ${(driver.sacId || []).map(id => `<li>${id}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `)
            .addTo(mapRef.current);
    };

    return (
        <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            
            {/* Render DriverMarkers only when map is loaded */}
            {mapLoaded && Object.values(drivers).map(driver => (
                <DriverMarker 
                    key={driver.driverId}
                    map={mapRef.current}
                    driver={driver}
                    onClick={handleMarkerClick}
                />
            ))}
        </div>
    );
};

export default MapTab;

