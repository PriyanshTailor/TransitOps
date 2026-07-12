import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Super Admin'), getAuditLogs);

export default router;
