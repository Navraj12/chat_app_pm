import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMessages, getChatStats } from '../controllers/chatController';

const chatRouter = Router();

// All chat routes are protected
chatRouter.use(authenticate);

chatRouter.get('/messages', getMessages);
chatRouter.get('/stats', getChatStats);

export default chatRouter;