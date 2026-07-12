import express from 'express';
import { getExpenses, createExpense, updateExpenseStatus, deleteExpense } from '../controllers/expenseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getExpenses);
router.post('/', authMiddleware, authorizeRoles('Super Admin', 'Financial Analyst', 'Fleet Manager', 'Driver'), createExpense);
router.put('/:id/status', authMiddleware, authorizeRoles('Super Admin', 'Financial Analyst'), updateExpenseStatus);
router.delete('/:id', authMiddleware, authorizeRoles('Super Admin', 'Financial Analyst'), deleteExpense);

export default router;
