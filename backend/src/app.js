import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);

// TODO: Implement the rest of the modular routes
// app.use('/api/trips', tripRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/fuel', fuelRoutes);
// app.use('/api/reports', reportRoutes);

export default app;
