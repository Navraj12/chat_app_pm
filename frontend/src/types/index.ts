export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  username: string;
  userId: string;
  message: string;
  timestamp: Date | string;
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