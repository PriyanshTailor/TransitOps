import express from 'express';
import { handleChat, parseOcr } from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, handleChat);
router.post('/parse-ocr', authMiddleware, parseOcr);

export default router;
