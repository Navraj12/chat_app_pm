import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    type: 'private' | 'group';
    lastMessage?: {
        text: string;
        sender: mongoose.Types.ObjectId;
        timestamp: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        type: {
            type: String,
            enum: ['private', 'group'],
            default: 'private',
        },
        lastMessage: {
            text: String,
            sender: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    },
    { timestamps: true }
);

// Index for performance
ConversationSchema.index({ participants: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
