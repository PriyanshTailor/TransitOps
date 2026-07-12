import express from 'express';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Only specific roles can manage vehicles
router.get('/', authMiddleware, authorizeRoles('Fleet Manager', 'Driver', 'Financial Analyst', 'Dispatcher'), getVehicles);
router.post('/', authMiddleware, authorizeRoles('Fleet Manager'), createVehicle);
router.put('/:id', authMiddleware, authorizeRoles('Fleet Manager'), updateVehicle);
router.delete('/:id', authMiddleware, authorizeRoles('Fleet Manager'), deleteVehicle);

export default router;
