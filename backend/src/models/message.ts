import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  message: string;
  timestamp: Date;
  replyTo?: {
    messageId: mongoose.Types.ObjectId;
    text: string;
    username: string;
  };
  reactions?: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    username: string;
  }[];
}

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  replyTo: {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    text: String,
    username: String
  },
  reactions: [{
    emoji: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model<IMessage>('Message', messageSchema);