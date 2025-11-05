import type { Response } from 'express';
import Message from '../models/message';
import User from '../models/user';
import type { AuthRequest } from '../middleware/authMiddleware';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username email');

    res.json({
      count: messages.length,
      messages: messages.reverse()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getChatStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalMessages = await Message.countDocuments();
    const totalUsers = await User.countDocuments();
    
   
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    res.json({
      totalMessages,
      totalUsers,
      recentMessages24h: recentMessages
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};