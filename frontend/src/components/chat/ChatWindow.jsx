import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '@/services/api';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';

const socket = io('http://localhost:5000');

export default function ChatWindow({ isOpen, onClose, onBack, recipientName, roomId, embedded }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch existing messages
    const { data: chatHistory, isLoading } = useQuery({
        queryKey: ['chat-messages', roomId],
        queryFn: () => chatAPI.getMessages(roomId),
        enabled: !!roomId && isOpen,
        refetchOnWindowFocus: false,
    });

    // Populate messages state when history is loaded
    useEffect(() => {
        if (chatHistory?.data?.messages) {
            // Transform backend messages to match frontend structure if needed
            // Backend sends: { messageText: "...", senderId: ..., createdAt: ... }
            // Frontend expects: { message: "...", senderId: ..., timestamp: ... }
            const formattedMessages = chatHistory.data.messages.map(msg => ({
                roomId,
                senderId: msg.senderId,
                message: msg.messageText, // Helper to map backend field
                timestamp: msg.createdAt,
                sender: msg.sender
            }));
            setMessages(formattedMessages);
        }
    }, [chatHistory, roomId]);

    useEffect(() => {
        if (isOpen && roomId) {
            socket.emit('join_chat', roomId);
        }

        const handleReceiveMessage = (data) => {
            // Prevent duplicate messages if already in list (simple check)
            setMessages((prev) => {
                // If message already exists (by timestamp + content maybe?), skip?
                // For now just append, but we might get self-message twice if we're not careful
                // (Optimistic update vs Socket receive)
                return [...prev, data];
            });
            setIsTyping(false);
        };

        const handleTyping = (data) => {
            if (data.senderId !== user.id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.senderId !== user.id) {
                setIsTyping(false);
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
        };
    }, [isOpen, roomId, user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        if (!typingTimeoutRef.current) {
            socket.emit('typing', { roomId, senderId: user.id });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { roomId, senderId: user.id });
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit('stop_typing', { roomId, senderId: user.id });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        const messageData = {
            roomId,
            senderId: user.id,
            message: newMessage,
            timestamp: new Date().toISOString(),
            senderName: user.fullName
        };

        try {
            await socket.emit('send_message', messageData);
            // Don't modify state here, wait for socket to echo back 
            // OR modify state optimistically? 
            // Ideally socket.emit doesn't wait for DB.
            // Let's rely on socket echo for now to ensure consistency, 
            // but if we want instant UI we can append.
            // For now, let's keep it simple: Socket server emits to sender too.
            // If server emits to everyone in room including sender, then handleReceiveMessage picks it up.
            setNewMessage('');
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`
            flex flex-col bg-white overflow-hidden z-50
            ${embedded ? 'h-full w-full rounded-none border-0 shadow-none' : 'fixed bottom-4 right-4 w-80 md:w-96 rounded-2xl shadow-xl border border-neutral-200 animate-in slide-in-from-bottom-2 fade-in duration-200'}
        `}>
            {/* Minimal Header */}
            <div className={`p-4 flex items-center justify-between bg-white border-b border-neutral-100 ${embedded ? '' : 'rounded-t-2xl'}`}>
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="mr-1 md:hidden p-1 rounded-full hover:bg-neutral-100 transition-colors">
                            <ArrowLeft size={20} className="text-neutral-600" />
                        </button>
                    )}
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-neutral-100">
                            <AvatarFallback className="bg-neutral-100 text-neutral-600 font-medium text-sm">{recipientName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 text-sm leading-tight">{recipientName}</h3>
                        <p className="text-xs text-neutral-500">{isTyping ? <span className="text-primary-600 font-medium animate-pulse">Typing...</span> : "Active now"}</p>
                    </div>
                </div>
                {!embedded && (
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 h-80 overflow-y-auto p-4 bg-white space-y-6">
                {(isLoading && messages.length === 0) ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-sm">
                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                            <MessageSquare className="h-6 w-6 text-neutral-300" />
                        </div>
                        <p className="font-medium text-neutral-900">No messages yet</p>
                        <p className="text-xs mt-1">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${isMe
                                        ? 'bg-neutral-900 text-white rounded-br-sm'
                                        : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                                    }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-neutral-400 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-100 text-neutral-500 rounded-2xl rounded-bl-sm px-4 py-2 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Clean Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-neutral-100 flex items-end gap-2">
                <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 border-neutral-200 focus-visible:ring-neutral-900 focus-visible:ring-offset-0 rounded-xl bg-neutral-50 h-11 text-base"
                />
                <Button
                    type="submit"
                    size="icon"
                    className={`rounded-xl h-11 w-11 shrink-0 transition-all ${newMessage.trim() ? 'bg-neutral-900 hover:bg-neutral-800 shadow-md' : 'bg-neutral-200 text-neutral-400 hover:bg-neutral-200 cursor-not-allowed shadow-none'}`}
                    disabled={!newMessage.trim()}
                >
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
}
