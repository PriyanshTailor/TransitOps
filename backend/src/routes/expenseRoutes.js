import express from 'express';
import { getExpenses, createExpense, updateExpenseStatus, deleteExpense } from '../controllers/expenseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Financial Analyst'), getExpenses);
router.post('/', authMiddleware, authorizeRoles('Financial Analyst'), createExpense);
router.put('/:id/status', authMiddleware, authorizeRoles('Financial Analyst'), updateExpenseStatus);
router.delete('/:id', authMiddleware, authorizeRoles('Financial Analyst'), deleteExpense);

export default router;
