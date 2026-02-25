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
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");


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
        if (!participantId) return;
        try {
            if (isGroupMode) {

                if (selectedUsers.includes(participantId)) {
                    setSelectedUsers(prev => prev.filter(id => id !== participantId));
                } else {
                    setSelectedUsers(prev => [...prev, participantId]);
                }
                return;
            }

            const conversation = await chatAPI.startConversation(participantId);
            onSelectConversation(conversation);
            setShowUserSearch(false);
            fetchConversations();
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName || selectedUsers.length === 0) return;
        try {
            const conversation = await chatAPI.createGroup(groupName, selectedUsers);

            onSelectConversation(conversation);
            setShowUserSearch(false);

            setIsGroupMode(false);
            setSelectedUsers([]);
            setGroupName("");
            fetchConversations();
        } catch (error: any) {
            console.error("Error creating group:", error);
            alert(`Failed to create group: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };



    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 h-full bg-sidebar border-r border-slate-800 flex flex-col text-slate-300">
            <div className="p-4 border-b border-slate-800 bg-sidebar/50">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>


                    <button
                        onClick={() => setShowUserSearch(!showUserSearch)}
                        className="p-2 hover:bg-sidebar-accent rounded-full transition-all text-brand hover:scale-110 active:scale-95"
                        title="New Message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-2 px-1">
                    <div className="flex items-center text-[10px] text-slate-400 font-medium bg-sidebar-accent/50 px-2 py-0.5 rounded-full border border-slate-700 shadow-sm">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                        {isConnected ? "Connected" : "Offline"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium bg-sidebar-accent/50 px-2 py-0.5 rounded-full border border-slate-700 shadow-sm">
                        Users: {userCount}
                    </div>
                </div>
            </div>


            {showUserSearch && (
                <div className="p-4 border-b border-slate-800 bg-sidebar-accent/30 animate-slide-up">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => {
                                setIsGroupMode(!isGroupMode);
                                setSelectedUsers([]);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${isGroupMode
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                                : "bg-sidebar-accent/50 text-slate-400 border-slate-700 hover:text-slate-200"
                                }`}
                        >
                            {isGroupMode ? "✕ Cancel Group" : "👥 Create Group"}
                        </button>

                    </div>

                    {isGroupMode && (
                        <input
                            type="text"
                            placeholder="Group Name..."
                            className="w-full mb-2 p-2.5 bg-sidebar-accent/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    )}

                    <input
                        type="text"
                        placeholder={isGroupMode ? "Add participants..." : "Search users..."}
                        className="w-full p-2.5 bg-sidebar-accent/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                        {filteredUsers.map(u => {
                            const isSelected = selectedUsers.includes(u._id || u.id);
                            return (
                                <div
                                    key={u._id || u.id}
                                    onClick={() => handleStartConversation(u._id || u.id)}
                                    className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-colors border group ${isSelected
                                        ? "bg-brand/20 border-brand/50"
                                        : "hover:bg-brand/10 border-transparent hover:border-brand/20 shadow-inner"
                                        }`}
                                >
                                    <div className="w-9 h-9 bg-brand/20 text-brand rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform relative">
                                        {u.username[0].toUpperCase()}
                                        {isSelected && (
                                            <div className="absolute -right-1 -bottom-1 bg-brand text-white rounded-full p-0.5 border-2 border-sidebar">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                                        {u.username}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {isGroupMode && (
                        <button
                            type="button"
                            onClick={handleCreateGroup}
                            disabled={!groupName || selectedUsers.length === 0}
                            className="w-full mt-4 py-2.5 bg-brand hover:bg-brand-hover disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
                        >
                            Create Group {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                        </button>
                    )}


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
                                className={`p-4 mx-2 my-1 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-200 group ${isActive
                                    ? "bg-brand text-white shadow-lg shadow-brand/20 scale-[1.02]"
                                    : "hover:bg-sidebar-accent text-slate-400 hover:text-slate-100"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-colors ${isActive ? "bg-white/20" : "bg-sidebar-accent group-hover:bg-sidebar-hover text-brand"
                                    }`}>
                                    {conv.type === 'group' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    ) : (
                                        partner?.username ? partner.username[0].toUpperCase() : "?"
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={`font-semibold truncate ${isActive ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                                            {conv.type === 'group' ? conv.name : (partner?.username || "Private Chat")}
                                        </h3>

                                        <span className={`text-[10px] ${isActive ? "text-white/70" : "text-slate-500 group-hover:text-slate-400"}`}>
                                            {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate mt-0.5 ${isActive ? "text-white/80" : "text-slate-500 group-hover:text-slate-400"}`}>
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
