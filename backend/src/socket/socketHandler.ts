import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { Server, Socket } from "socket.io";
import Message from "../models/message";
import Conversation from "../models/Conversation";

interface UserSocket extends Socket {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const activeUsers = new Map<string, { socketId: string; username: string }>();

export const initializeSocket = (io: Server) => {
  io.use((socket: UserSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
        id: string;
        username: string;
        email: string;
      };

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: UserSocket) => {
    console.log("User connected:", socket.user?.username);

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.user?.username} joined room: ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${socket.user?.username} left room: ${conversationId}`);
    });

    socket.on("join", (data) => {
      if (socket.user) {
        activeUsers.set(socket.user.id, {
          socketId: socket.id,
          username: socket.user.username,
        });

        io.emit("user_count", {
          count: activeUsers.size,
        });
      }
    });

    socket.on("message", async (data) => {
      try {
        if (!socket.user) {
          console.error("User not found in socket object");
          return;
        }

        const { message, conversationId, replyTo } = data;
        console.log(`Received message event: ${message.substring(0, 20)}... for conversation ${conversationId}`);

        if (!message || !message.trim() || !conversationId) {
          console.warn("Invalid message data received:", data);
          return;
        }

        // 1. Create message
        const newMessage = await Message.create({
          conversationId,
          username: socket.user.username,
          userId: socket.user.id,
          message: message.trim(),
          replyTo: replyTo ? {
            messageId: replyTo.id || replyTo._id,
            text: replyTo.message,
            username: replyTo.username
          } : undefined
        });

        // 2. Update conversation with last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: message.trim(),
            sender: socket.user.id,
            timestamp: new Date(),
          },
        });

        // 3. Emit to the specific room
        console.log(`Broadcasting message to room ${conversationId}`);
        io.to(conversationId).emit("message", {
          id: newMessage._id,
          _id: newMessage._id,
          conversationId,
          username: newMessage.username,
          userId: newMessage.userId,
          message: newMessage.message,
          timestamp: newMessage.timestamp,
          replyTo: newMessage.replyTo
        });

      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("reaction", async (data) => {
      try {
        if (!socket.user) return;
        const { messageId, emoji, conversationId } = data;
        const currentUserId = socket.user.id;

        const message = await Message.findById(messageId);
        if (!message) return;

        // Initialize reactions if undefined
        if (!message.reactions) message.reactions = [];

        // Check if user already reacted with this emoji
        const existingIndex = message.reactions.findIndex(
          r => r.emoji === emoji && r.userId.toString() === currentUserId.toString()
        );

        if (existingIndex > -1) {
          // Remove reaction
          message.reactions.splice(existingIndex, 1);
        } else {
          // Add reaction
          message.reactions.push({
            emoji,
            userId: new mongoose.Types.ObjectId(currentUserId) as any,
            username: socket.user.username
          });
        }

        await message.save();

        // Broadcast the update to the room
        io.to(conversationId).emit("reaction_update", {
          messageId,
          reactions: message.reactions
        });

      } catch (error) {
        console.error("Error handling reaction:", error);
      }
    });

    socket.on("typing", (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit("user_typing", {
        userId: socket.user?.id,
        username: socket.user?.username,
        isTyping,
      });
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        activeUsers.delete(socket.user.id);
        io.emit("user_count", {
          count: activeUsers.size,
        });
        console.log(`${socket.user.username} disconnected`);
      }
    });
  });
};
