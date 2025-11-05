import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMessages, getChatStats } from '../controllers/chatController';

const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get('/messages', getMessages);
chatRouter.get('/stats', getChatStats);

export default chatRouter;