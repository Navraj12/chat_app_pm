import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMessages, getChatStats, getConversations, startConversation, createGroup } from '../controllers/chatController';

const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get('/', getConversations);
chatRouter.post('/', startConversation);
chatRouter.post('/group', createGroup);
chatRouter.get('/messages/:conversationId', getMessages);
chatRouter.get('/stats', getChatStats);

export default chatRouter;