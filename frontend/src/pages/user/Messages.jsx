import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '@/services/api';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ChatWindow from '@/components/chat/ChatWindow';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import AIChatWindow from '@/components/chat/AIChatWindow';
import { Sparkles } from 'lucide-react';

const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/100x100?text=No+Image';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
};

const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const isYesterday = new Date(now - 86400000).getDate() === date.getDate();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

export default function Messages() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");

    const basePath = location.pathname.includes('/doctor') ? '/doctor/messages' : '/user/messages';

    const { data: response, isLoading } = useQuery({
        queryKey: ['user-chats'],
        queryFn: chatAPI.getAll
    });

    const chats = response?.data || [];

    const filteredChats = chats.filter(chat =>
        chat.otherParticipant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.petName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // AI Bot Chat Item
    const aiBot = {
        id: 'ai',
        otherParticipant: { fullName: "Pet AI Assistant" },
        petName: "Virtual Guide",
        lastMessage: { text: "How can I help you?" },
        updatedAt: new Date().toISOString(),
        isAi: true
    };

    const isAiChat = id === 'ai';
    const activeChat = isAiChat ? aiBot : (id ? chats.find(c => c.id === parseInt(id)) : null);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] bg-white overflow-hidden flex">
            {/* Sidebar List */}
            <div className={cn(
                "w-full md:w-80 border-r border-neutral-100 flex flex-col bg-white",
                id ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-neutral-100 bg-white">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-9 bg-neutral-50 border-neutral-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Pinned AI Bot */}
                    <div
                        onClick={() => navigate(`${basePath}/ai`)}
                        className={cn(
                            "p-4 cursor-pointer hover:bg-neutral-50 transition-colors flex items-center gap-3 border-b border-neutral-50",
                            id === 'ai' ? "bg-indigo-50/60 hover:bg-indigo-50" : "bg-white"
                        )}
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <h4 className="font-semibold text-neutral-900 truncate pr-2">Pet AI Assistant</h4>
                                <span className="text-[10px] text-neutral-400">Now</span>
                            </div>
                            <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
                                <span className="font-medium text-indigo-600">Bot</span> •
                                <span className="truncate">Ask me anything about pets!</span>
                            </p>
                        </div>
                    </div>

                    {filteredChats.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No other conversations</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {filteredChats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`${basePath}/${chat.id}`)}
                                    className={cn(
                                        "p-4 cursor-pointer hover:bg-neutral-100 transition-colors flex items-center gap-3",
                                        parseInt(id) === chat.id ? "bg-primary-50 hover:bg-primary-50" : "bg-white"
                                    )}
                                >
                                    <Avatar className="w-12 h-12 border border-neutral-100">
                                        <AvatarImage src={getImageUrl(chat.petImage)} />
                                        <AvatarFallback>{chat.petName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-semibold text-neutral-900 truncate pr-2">
                                                {chat.otherParticipant.fullName}
                                            </h4>
                                            {chat.updatedAt && (
                                                <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                                                    {formatMessageDate(chat.updatedAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
                                            <span className="font-medium text-neutral-700">{chat.petName}</span> •
                                            <span className="truncate">{chat.lastMessage?.text || "Started a conversation"}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-white",
                !id ? "hidden md:flex" : "flex"
            )}>
                {isAiChat ? (
                    <AIChatWindow
                        isOpen={true}
                        embedded={true}
                        onBack={() => navigate(basePath)}
                    />
                ) : id ? (
                    <ChatWindow
                        key={id}
                        roomId={parseInt(id)}
                        recipientName={activeChat?.otherParticipant.fullName}
                        isOpen={true}
                        embedded={true}
                        onBack={() => navigate(basePath)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900">Select a conversation</h3>
                        <p>Choose a chat or ask the AI Assistant.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
