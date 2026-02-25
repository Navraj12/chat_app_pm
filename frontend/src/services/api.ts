import axios from 'axios';
import type { Message, ChatStats, Conversation, User } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  }
};

export const chatAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/api/chat');
    return response.data;
  },

  startConversation: async (participantId: string): Promise<Conversation> => {
    const response = await api.post('/api/chat', { participantId });
    return response.data;
  },
  createGroup: async (name: string, participants: string[]): Promise<Conversation> => {
    const response = await api.post('/api/chat/group', { name, participants });
    return response.data;
  },


  getMessages: async (conversationId: string, limit: number = 50): Promise<{ messages: Message[] }> => {
    const response = await api.get(`/api/chat/messages/${conversationId}?limit=${limit}`);
    return response.data;
  },

  getStats: async (): Promise<ChatStats> => {
    const response = await api.get('/api/chat/stats');
    return response.data;
  }
};

export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  }
};

export default api;