import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for hackathon simplicity
    methods: ["GET", "POST"]
  }
});

// Mock Data
const DRIVERS = [
  { id: 'driver-1', lat: 36.7525, lng: 3.0420, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' } },
  { id: 'driver-2', lat: 36.7600, lng: 3.0500, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' } },
  { id: 'driver-3', lat: 36.7400, lng: 3.0600, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' } },
  { id: 'driver-4', lat: 36.7300, lng: 3.0300, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' } },
  { id: 'driver-5', lat: 36.7700, lng: 3.0700, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' } },
  { id: 'driver-6', lat: 36.7200, lng: 3.0200, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' } },
  { id: 'driver-7', lat: 36.7800, lng: 3.0800, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' } },
  { id: 'driver-8', lat: 36.7100, lng: 3.0100, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' } },
  { id: 'driver-9', lat: 36.7900, lng: 3.0900, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' } },
  { id: 'driver-10', lat: 36.7000, lng: 3.0000, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' } },
];

app.get('/verify-driver/:id', (req, res) => {
  const driver = DRIVERS.find(d => d.id === req.params.id);
  if (driver) {
    res.json({ valid: true, driver });
  } else {
    res.json({ valid: false });
  }
});

app.post('/driver/:id/sac', (req, res) => {
  const { sacId, action } = req.body;
  const driver = DRIVERS.find(d => d.id === req.params.id);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  if (action === 'add') {
    // Assign string directly
    driver.sacId = sacId;
  } else if (action === 'remove') {
    driver.sacId = null;
  }

  res.json({ success: true, sacId: driver.sacId });
});

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
      sacId: driver.sacId,
      destination: driver.destination
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
