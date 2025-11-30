import React from 'react';
import { useLocation } from 'react-router-dom';
import MapTab from './MapTab';

const MapPage = () => {
    const location = useLocation();
    const focusDriverId = location.state?.focusDriverId;

    return <MapTab focusDriverId={focusDriverId} />;
};

export default MapPage;
