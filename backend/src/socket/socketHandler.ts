import { Server, Socket } from 'socket.io';
import Message from '../models/message';
import jwt from 'jsonwebtoken';

interface UserSocket extends Socket {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const activeUsers = new Map<string, { socketId: string; username: string }>();

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use((socket: UserSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        id: string;
        username: string;
        email: string;
      };

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: UserSocket) => {
    console.log('User connected:', socket.user?.username);

    // Handle user join
    socket.on('join', (data) => {
      if (socket.user) {
        activeUsers.set(socket.user.id, {
          socketId: socket.id,
          username: socket.user.username
        });

        // Notify all clients about new user
        io.emit('user_joined', {
          username: socket.user.username,
          userId: socket.user.id,
          timestamp: new Date()
        });

        // Send updated user count
        io.emit('user_count', {
          count: activeUsers.size
        });

        console.log(`${socket.user.username} joined the chat`);
      }
    });

    // Handle messages
    socket.on('message', async (data) => {
      try {
        if (!socket.user) return;

        const { message } = data;

        if (!message || !message.trim()) {
          return;
        }

        // Save message to database
        const newMessage = await Message.create({
          username: socket.user.username,
          userId: socket.user.id,
          message: message.trim()
        });

        // Emit message to all clients
        io.emit('message', {
          id: newMessage._id,
          username: newMessage.username,
          userId: newMessage.userId,
          message: newMessage.message,
          timestamp: newMessage.timestamp
        });

        console.log(`Message from ${socket.user.username}: ${message}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.user) {
        activeUsers.delete(socket.user.id);
        
        io.emit('user_left', {
          username: socket.user.username,
          userId: socket.user.id,
          timestamp: new Date()
        });

        io.emit('user_count', {
          count: activeUsers.size
        });

        console.log(`${socket.user.username} left the chat`);
      }
    });
  });
};