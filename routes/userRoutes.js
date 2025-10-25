import express from 'express';
import {
  getChatLogs,
  getChatLogByPlatform,
  createChatLog,
} from '../controllers/chatLogController.js';

const router = express.Router();

//Routes to perform chatlogs crud operations
router.get('/chatLogs', getChatLogs);
router.get('/chatLogs/:id', getChatLogByPlatform);
router.post('/chatLogs', createChatLog);

export default router;
