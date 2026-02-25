import type { Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/message';
import Conversation from '../models/Conversation';
import User from '../models/user';
import type { AuthRequest } from '../middleware/authMiddleware';


// Fetch all conversations for the logged-in user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username email')
      .populate('lastMessage.sender', 'username')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create or get a private conversation between two users
export const startConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.user?.id;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [userId, participantId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        type: 'private'
      });
    }

    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await Message.find({ conversationId })
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
    const totalConversations = await Conversation.countDocuments();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    res.json({
      totalMessages,
      totalUsers,
      totalConversations,
      recentMessages24h: recentMessages
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create a new group conversation
export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, participants } = req.body;
    const userId = req.user?.id;

    console.log("Creating group:", { name, participants, userId });

    if (!name || !participants || !Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({ message: 'Group name and at least one participant are required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Add the creator to participants if not already included
    // Convert strings to ObjectIds for consistency
    const participantIds = participants.map(id => new mongoose.Types.ObjectId(id));
    const creatorId = new mongoose.Types.ObjectId(userId);

    // Check if creatorId is already in participantIds
    const allParticipantIds = participantIds.some(pid => pid.equals(creatorId))
      ? participantIds
      : [...participantIds, creatorId];

    const conversation = await Conversation.create({
      name,
      participants: allParticipantIds,
      type: 'group'
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username email');

    console.log("Group created successfully:", populatedConversation?._id);
    res.status(201).json(populatedConversation);
  } catch (error: any) {
    console.error("Group creation error:", error);
    res.status(500).json({
      message: error.message || 'Server error',
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};