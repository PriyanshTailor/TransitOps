import express from 'express';
import { getTrips, createTrip, updateTripStatus, deleteTrip } from '../controllers/tripController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getTrips);
router.post('/', authMiddleware, authorizeRoles('Super Admin', 'Dispatcher'), createTrip);
router.put('/:id/status', authMiddleware, authorizeRoles('Super Admin', 'Dispatcher'), updateTripStatus);
router.delete('/:id', authMiddleware, authorizeRoles('Super Admin', 'Dispatcher'), deleteTrip);

export default router;
