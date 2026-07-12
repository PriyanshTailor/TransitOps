import express from 'express';
import { getTrips, createTrip, updateTripStatus, deleteTrip } from '../controllers/tripController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Driver', 'Fleet Manager', 'Financial Analyst', 'Safety Officer'), getTrips);
router.post('/', authMiddleware, authorizeRoles('Driver'), createTrip);
router.put('/:id/status', authMiddleware, authorizeRoles('Driver'), updateTripStatus);
router.delete('/:id', authMiddleware, authorizeRoles('Driver'), deleteTrip);

export default router;
