import express from 'express';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDrivers);
router.post('/', authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), createDriver);
router.put('/:id', authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriver);
router.delete('/:id', authMiddleware, authorizeRoles('Fleet Manager', 'Safety Officer'), deleteDriver);

export default router;
