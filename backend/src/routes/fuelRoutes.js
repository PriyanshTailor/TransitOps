import express from 'express';
import { getFuel, createFuel, deleteFuel } from '../controllers/fuelController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getFuel);
router.post('/', authMiddleware, authorizeRoles('Super Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), createFuel);
router.delete('/:id', authMiddleware, authorizeRoles('Super Admin', 'Fleet Manager', 'Financial Analyst'), deleteFuel);

export default router;
