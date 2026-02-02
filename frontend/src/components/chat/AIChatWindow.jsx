import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, ArrowLeft, Sparkles, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function AIChatWindow({ isOpen, onClose, onBack, embedded }) {
    const { token } = useAuth(); // Need token for protected route
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: "Hello! I'm PetEase AI. Ask me anything about your pet's health, diet, or behavior.",
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Frontend history for context (last 10 messages)
            const history = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));

            const response = await axios.post("http://localhost:5000/api/ai/chat",
                { message: userMessage.text, history },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: response.data.data,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                throw new Error(response.data.message || "Failed to get response");
            }

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                text: "I'm currently offline or experiencing issues. Please try again later.", // Fallback
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "flex flex-col bg-white overflow-hidden z-50",
            embedded ? 'h-full w-full rounded-none border-0 shadow-none' : 'fixed bottom-4 right-4 w-80 md:w-96 rounded-2xl shadow-xl'
        )}>
            {/* Header */}
            <div className={cn("p-4 flex items-center justify-between bg-white border-b border-neutral-100", !embedded && 'rounded-t-2xl')}>
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="mr-1 md:hidden p-1 rounded-full hover:bg-neutral-100 transition-colors">
                            <ArrowLeft size={20} className="text-neutral-600" />
                        </button>
                    )}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-indigo-200 shadow-md">
                            <Bot className="w-6 h-6" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-sm leading-tight flex items-center gap-1">
                            PetEase AI <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </h3>
                        <p className="text-xs text-neutral-500">Veterinary Assistant</p>
                    </div>
                </div>
                {!embedded && (
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 h-80 overflow-y-auto p-4 bg-slate-50 space-y-6">
                {messages.map((msg, idx) => {
                    const isMe = msg.role === 'user';
                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={cn(
                                "max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm markdown-prose",
                                isMe ? 'bg-neutral-900 text-white rounded-br-sm' : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-sm',
                                msg.isError && "bg-red-50 text-red-600 border-red-200"
                            )}>
                                {isMe ? msg.text : (
                                    <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                                        <ReactMarkdown
                                            components={{
                                                // Handle potential non-string children error by safe rendering
                                                p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />
                                            }}
                                        >
                                            {String(msg.text || "")}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-neutral-200 text-neutral-500 rounded-2xl rounded-bl-sm px-4 py-3 text-xs flex items-center gap-1 shadow-sm">
                            <Bot className="w-3 h-3 animate-pulse text-indigo-500" />
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-neutral-100 flex items-end gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about symptoms, diet..."
                    className="flex-1 border-neutral-200 focus-visible:ring-indigo-500 rounded-xl bg-neutral-50 h-11"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    size="icon"
                    className={cn(
                        "rounded-xl h-11 w-11 shrink-0 transition-all",
                        input.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md text-white' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                    )}
                    disabled={!input.trim() || isLoading}
                >
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
}
