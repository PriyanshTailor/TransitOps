import express from 'express';
import { getDashboardStats, globalSearch } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, authorizeRoles('Fleet Manager', 'Financial Analyst', 'Driver', 'Safety Officer'), getDashboardStats);
router.get('/search', authMiddleware, globalSearch);

export default router;
