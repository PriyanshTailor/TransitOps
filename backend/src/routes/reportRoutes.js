import express from 'express';
import { getReports } from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Super Admin', 'Fleet Manager', 'Financial Analyst'), getReports);

export default router;
