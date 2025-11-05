import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";
import type { ChatStats, Message } from "../types";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [messagesData, statsData] = await Promise.all([
          chatAPI.getMessages(),
          chatAPI.getStats(),
        ]);
        setMessages(messagesData.messages);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!token || socketRef.current) return;
    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
      setIsConnected(true);
      socket.emit("join", { username: user?.username });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
      setIsConnected(false);
    });

    socket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setStats((prev) =>
        prev ? { ...prev, totalMessages: prev.totalMessages + 1 } : null
      );
    });

    socket.on("user_joined", (data) => {
      console.log("User joined:", data.username);
    });

    socket.on("user_left", (data) => {
      console.log("User left:", data.username);
    });

    socket.on("user_count", (data) => setUserCount(data.count));

    socket.on("error", (error) => console.error("Socket error:", error));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]); 
  const handleSendMessage = (message: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("message", { message });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chat Application</h1>
            <p className="text-sm text-blue-200">Welcome, {user?.username}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="mt-1">Online: {userCount}</div>
            </div>
            {stats && (
              <div className="text-sm border-l border-blue-500 pl-6">
                <div>Total Messages: {stats.totalMessages}</div>
                <div>Total Users: {stats.totalUsers}</div>
              </div>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition duration-200 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto bg-white shadow-xl">
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
