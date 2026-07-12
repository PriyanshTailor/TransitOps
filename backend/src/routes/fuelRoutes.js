import express from 'express';
import { getFuel, createFuel, deleteFuel } from '../controllers/fuelController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Fleet Manager', 'Financial Analyst'), getFuel);
router.post('/', authMiddleware, authorizeRoles('Fleet Manager', 'Financial Analyst'), createFuel);
router.delete('/:id', authMiddleware, authorizeRoles('Fleet Manager', 'Financial Analyst'), deleteFuel);

export default router;
