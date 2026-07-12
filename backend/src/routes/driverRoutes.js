import express from 'express';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Safety Officer', 'Driver', 'Fleet Manager', 'Financial Analyst'), getDrivers);
router.post('/', authMiddleware, authorizeRoles('Safety Officer'), createDriver);
router.put('/:id', authMiddleware, authorizeRoles('Safety Officer'), updateDriver);
router.delete('/:id', authMiddleware, authorizeRoles('Safety Officer'), deleteDriver);

export default router;
