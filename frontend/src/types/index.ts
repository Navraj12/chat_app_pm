export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  _id?: string;
  conversationId: string;
  username: string;
  userId: string;
  message: string;
  timestamp: Date | string;
  replyTo?: {
    messageId: string;
    text: string;
    username: string;
  };
  reactions?: {
    emoji: string;
    userId: string;
    username: string;
  }[];
}

export interface Conversation {
  _id: string;
  id?: string;
  participants: User[];
  type: 'private' | 'group';
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: Date | string;
  };
  updatedAt: Date | string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ChatStats {
  totalMessages: number;
  totalUsers: number;
  recentMessages24h: number;
}