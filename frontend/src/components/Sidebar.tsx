import React, { useEffect, useState } from "react";
import { chatAPI, userAPI } from "../services/api";
import type { Conversation, User } from "../types";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
    onSelectConversation: (conversation: Conversation) => void;
    activeConversationId?: string;
    isConnected: boolean;
    userCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectConversation, activeConversationId, isConnected, userCount }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchConversations();
        fetchUsers();
    }, []);

    const fetchConversations = async () => {
        try {
            const data = await chatAPI.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userAPI.getAllUsers();
            // Backend returns { count, users }
            const allUsers = Array.isArray(data) ? data : (data.users || []);
            setUsers(allUsers.filter((u: User) => (u._id || u.id) !== (user?.id || user?._id)));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleStartConversation = async (participantId: string) => {
        try {
            const conversation = await chatAPI.startConversation(participantId);
            onSelectConversation(conversation);
            setShowUserSearch(false);
            fetchConversations();
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 h-full bg-white border-r flex flex-col">
            <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                    <button
                        onClick={() => setShowUserSearch(!showUserSearch)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="New Message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-[10px] text-gray-500 font-medium bg-white px-2 py-0.5 rounded-full border shadow-sm">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                        {isConnected ? "Connected" : "Disconnected"}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium bg-white px-2 py-0.5 rounded-full border shadow-sm">
                        Users: {userCount}
                    </div>
                </div>
            </div>

            {showUserSearch && (
                <div className="p-4 border-b bg-blue-50">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="mt-2 max-h-40 overflow-y-auto">
                        {filteredUsers.map(u => (
                            <div
                                key={u._id || u.id}
                                onClick={() => handleStartConversation(u._id || u.id)}
                                className="p-2 hover:bg-white rounded cursor-pointer flex items-center gap-3 transition-colors"
                            >
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium">{u.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No conversations yet. Start one by clicking the "+" button!
                    </div>
                ) : (
                    conversations.map(conv => {
                        const partner = conv.participants.find(p => (p._id || p.id) !== (user?.id || user?._id));
                        const isActive = activeConversationId === conv._id;

                        return (
                            <div
                                key={conv._id}
                                onClick={() => onSelectConversation(conv)}
                                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 border-r-4 border-blue-500" : ""
                                    }`}
                            >
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                                    {partner?.username ? partner.username[0].toUpperCase() : "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={`font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                                            {partner?.username || "Group Chat"}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.sender === user?.id ? "You: " : ""}
                                                {conv.lastMessage.text}
                                            </>
                                        ) : "Start a conversation"}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Sidebar;
