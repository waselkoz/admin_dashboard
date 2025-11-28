import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for hackathon simplicity
    methods: ["GET", "POST"]
  }
});

// Mock Data
const DRIVERS = [
  { id: 'driver-1', lat: 36.7525, lng: 3.0420, sacId: ['SAC-001', 'SAC-002'] },
  { id: 'driver-2', lat: 36.7600, lng: 3.0500, sacId: ['SAC-003'] },
  { id: 'driver-3', lat: 36.7400, lng: 3.0600, sacId: ['SAC-004', 'SAC-005', 'SAC-006'] },
];

// Simulation Logic
const simulateMovement = () => {
  DRIVERS.forEach(driver => {
    // Move randomly slightly
    const moveLat = (Math.random() - 0.5) * 0.001;
    const moveLng = (Math.random() - 0.5) * 0.001;
    
    driver.lat += moveLat;
    driver.lng += moveLng;

    // Emit event
    const emitDriver = `live:${driver.id}`;
    const payload = {
      lat: driver.lat,
      lng: driver.lng,
      sacId: driver.sacId
    };

    io.emit(emitDriver, payload);
    // console.log(`Emitted ${eventName}`, payload);
  });
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Run simulation every 2 seconds
setInterval(simulateMovement, 1500);

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
