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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Mock Data
const DRIVERS = [
  { id: 'driver-1', lat: 36.7525, lng: 3.0420, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' }, vehicle: 'Scooter', rating: 4.8, phone: '0550-12-34-56' },
  { id: 'driver-2', lat: 36.7600, lng: 3.0500, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' }, vehicle: 'Van', rating: 4.5, phone: '0550-98-76-54' },
  { id: 'driver-3', lat: 36.7400, lng: 3.0600, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' }, vehicle: 'Bike', rating: 4.9, phone: '0551-22-33-44' },
  { id: 'driver-4', lat: 36.7300, lng: 3.0300, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' }, vehicle: 'Scooter', rating: 4.7, phone: '0552-44-55-66' },
  { id: 'driver-5', lat: 36.7700, lng: 3.0700, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' }, vehicle: 'Van', rating: 4.6, phone: '0553-66-77-88' },
  { id: 'driver-6', lat: 36.7200, lng: 3.0200, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' }, vehicle: 'Bike', rating: 4.8, phone: '0554-88-99-00' },
  { id: 'driver-7', lat: 36.7800, lng: 3.0800, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' }, vehicle: 'Scooter', rating: 4.9, phone: '0555-00-11-22' },
  { id: 'driver-8', lat: 36.7100, lng: 3.0100, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' }, vehicle: 'Van', rating: 4.5, phone: '0556-22-33-44' },
  { id: 'driver-9', lat: 36.7900, lng: 3.0900, sacId: null, destination: { lat: 36.71, lng: 2.85, name: 'Zeralda Post' }, vehicle: 'Bike', rating: 4.7, phone: '0557-44-55-66' },
  { id: 'driver-10', lat: 36.7000, lng: 3.0000, sacId: null, destination: { lat: 36.75, lng: 3.04, name: 'Hydra Post' }, vehicle: 'Scooter', rating: 4.8, phone: '0558-66-77-88' },
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
  let driver = DRIVERS.find(d => d.id === req.params.id);

  if (!driver) {
    if (action === 'add') {

      driver = {
        id: req.params.id,
        lat: 36.75 + (Math.random() - 0.5) * 0.05,
        lng: 3.05 + (Math.random() - 0.5) * 0.05,
        sacId: null,
        destination: { lat: 36.75, lng: 3.04, name: 'Unknown' }
      };
      DRIVERS.push(driver);
    } else {
      return res.status(404).json({ error: 'Driver not found' });
    }
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
