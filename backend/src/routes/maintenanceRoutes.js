import express from 'express';
import { getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Fleet Manager', 'Driver', 'Financial Analyst'), getMaintenance);
router.post('/', authMiddleware, authorizeRoles('Fleet Manager'), createMaintenance);
router.put('/:id', authMiddleware, authorizeRoles('Fleet Manager'), updateMaintenance);
router.delete('/:id', authMiddleware, authorizeRoles('Fleet Manager'), deleteMaintenance);

export default router;
