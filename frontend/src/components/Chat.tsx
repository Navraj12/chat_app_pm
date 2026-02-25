import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";
import type { Conversation, Message } from "../types";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import Sidebar from "./Sidebar";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Chat: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [activeConversation, _setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Use refs for state used in event listeners to avoid closure traps
  const activeConversationRef = useRef<Conversation | null>(null);
  const isConnectedRef = useRef(false);

  // Wrapper to keep ref in sync with state
  const setActiveConversation = (conv: Conversation | null) => {
    activeConversationRef.current = conv;
    _setActiveConversation(conv);
  };

  useEffect(() => {
    if (!token) return;

    // cleanup previous socket if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"], // Ensure fallback
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
      setIsConnected(true);
      isConnectedRef.current = true;
      socket.emit("join", { username: user?.username });

      // Re-join active room on reconnection
      if (activeConversationRef.current) {
        socket.emit("join_conversation", activeConversationRef.current._id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket Connection Error:", error.message);
      setIsConnected(false);
      isConnectedRef.current = false;
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket:", reason);
      setIsConnected(false);
      isConnectedRef.current = false;
    });

    socket.on("message", (message: Message) => {
      // Use ref to check active conversation
      const currentConv = activeConversationRef.current;
      if (currentConv && (message.conversationId === currentConv._id || message.conversationId === currentConv.id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("reaction_update", (data: { messageId: string, reactions: any[] }) => {
      setMessages(prev => prev.map(msg =>
        (msg._id === data.messageId || msg.id === data.messageId)
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    socket.on("user_count", (data) => setUserCount(data.count));

    socket.on("user_typing", (data) => {
      const currentConv = activeConversationRef.current;
      if (currentConv && data.isTyping && data.username !== user?.username) {
        setTypingUser(data.username);
      } else {
        setTypingUser(null);
      }
    });

    socket.on("error", (error) => console.error("Socket error:", error));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user?.username]); // Removed activeConversation from dependencies

  // Handle room joining/leaving when conversation changes
  useEffect(() => {
    if (activeConversation) {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("join_conversation", activeConversation._id);
      }
      fetchMessages(activeConversation._id);
    }

    return () => {
      if (activeConversation && socketRef.current && isConnected) {
        socketRef.current.emit("leave_conversation", activeConversation._id);
      }
    };
  }, [activeConversation?._id]); // Only depend on the ID change

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await chatAPI.getMessages(conversationId);
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = (text: string) => {
    if (socketRef.current && activeConversation) {
      socketRef.current.emit("message", {
        message: text,
        conversationId: activeConversation._id,
        replyTo: replyingTo
      });
      setReplyingTo(null);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (socketRef.current && activeConversation) {
      socketRef.current.emit("reaction", {
        messageId,
        emoji,
        conversationId: activeConversation._id
      });
    }
  };

  const handleTyping = () => {
    if (socketRef.current && isConnected && activeConversation) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current.emit("typing", { conversationId: activeConversation._id, isTyping: true });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketRef.current?.emit("typing", { conversationId: activeConversation._id, isTyping: false });
      }, 3000);
    }
  };

  // Robust partner identification
  const getPartner = () => {
    if (!activeConversation || !user) return null;
    const currentUserId = user.id || user._id;
    return activeConversation.participants.find(p => (p.id || p._id) !== currentUserId);
  };

  const partner = getPartner();
  const partnerName = partner?.username || "Chat";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        onSelectConversation={setActiveConversation}
        activeConversationId={activeConversation?._id}
        isConnected={isConnected}
        userCount={userCount}
      />

      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-blue-600 text-white p-4 shadow-lg flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {activeConversation && (
              <button
                onClick={() => setActiveConversation(null)}
                className="mr-2 p-1 hover:bg-blue-500 rounded-full transition-colors flex items-center justify-center"
                title="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            {activeConversation && partner && (
              <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm">
                {partner.username[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-xs">
                {activeConversation ? partnerName : "Messenger"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded"
              >
                Reconnect
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition duration-200 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-[#f0f2f5]">
          {activeConversation ? (
            <>
              <MessageList
                messages={messages}
                onReply={setReplyingTo}
                onReact={handleReact}
              />
              {typingUser && (
                <div className="px-6 py-2 text-xs text-gray-500 italic bg-white border-t">
                  {typingUser} is typing...
                </div>
              )}
              {replyingTo && (
                <div className="px-6 py-2 bg-gray-100 border-t flex justify-between items-center animate-slide-up">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-600">Replying to {replyingTo.username}</span>
                    <span className="text-sm text-gray-600 truncate max-w-md">{replyingTo.message}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {!isConnected && (
                <div className="px-6 py-1 bg-yellow-100 text-yellow-800 text-xs text-center border-t border-yellow-200">
                  You are currently offline. Messages may not be sent.
                </div>
              )}
              <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-400">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
