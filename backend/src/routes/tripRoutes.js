import express from 'express';
import { getTrips, createTrip, updateTripStatus, deleteTrip } from '../controllers/tripController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Driver', 'Fleet Manager', 'Financial Analyst', 'Safety Officer', 'Dispatcher'), getTrips);
router.post('/', authMiddleware, authorizeRoles('Driver', 'Dispatcher'), createTrip);
router.put('/:id/status', authMiddleware, authorizeRoles('Driver', 'Dispatcher'), updateTripStatus);
router.delete('/:id', authMiddleware, authorizeRoles('Driver', 'Dispatcher'), deleteTrip);

export default router;
