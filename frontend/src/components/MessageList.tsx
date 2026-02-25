import React, { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import type { Message } from "../types";

interface MessageListProps {
  messages: Message[];
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageList: React.FC<MessageListProps> = ({ messages, onReply, onReact }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const currentUserId = user?.id || user?._id;
          const isOwnMessage = msg.userId === currentUserId || (msg.userId as any).id === currentUserId || (msg.userId as any)._id === currentUserId;
          const showInitial = index === 0 || messages[index - 1].userId !== msg.userId;

          return (
            <div
              key={msg._id || msg.id}
              className={`flex flex-col group ${isOwnMessage ? "items-end" : "items-start"
                } ${showInitial ? "mt-4" : "mt-1"}`}
            >
              {!isOwnMessage && showInitial && (
                <span className="text-xs text-gray-500 ml-1 mb-1">
                  {msg.username}
                </span>
              )}

              {/* Reply Reference Area */}
              {msg.replyTo && (
                <div className={`mb-[-8px] px-3 py-1 bg-gray-200 text-[11px] text-gray-600 rounded-t-xl opacity-80 italic max-w-[60%] truncate ${isOwnMessage ? "mr-2" : "ml-2"}`}>
                  Replying to <span className="font-bold">{msg.replyTo.username}</span>: {msg.replyTo.text}
                </div>
              )}

              <div className={`relative flex items-center gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                <div
                  className={`max-w-[85%] px-4 py-2 text-sm shadow-sm transition-all ${isOwnMessage
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100"
                    }`}
                >
                  <p className="break-words leading-relaxed">{msg.message}</p>

                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="absolute -bottom-3 flex -space-x-1">
                      {Object.entries(
                        msg.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <div key={emoji} className="bg-white rounded-full shadow-sm px-1 text-[10px] flex items-center border border-gray-100">
                          {emoji} {count > 1 && <span className="ml-0.5 font-bold">{count}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={() => onReply(msg)}
                    className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
                    title="Reply"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <div className="relative group/emojis">
                    <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500" title="React">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="hidden group-hover/emojis:flex absolute bottom-full mb-2 bg-white shadow-xl border rounded-full p-1 gap-1 z-50">
                      {COMMON_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => onReact(msg._id || msg.id, emoji)}
                          className="hover:scale-125 transition-transform p-1 text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {index === messages.length - 1 && (
                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
