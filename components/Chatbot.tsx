import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, CloseIcon } from './icons';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatAbortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{
                id: 'initial',
                role: 'model',
                text: "Hello! I'm your presentation assistant. How can I help you brainstorm content for your slides?"
            }])
        }
    }, [isOpen, messages.length])

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        let responseText = '';
        try {
            setChatError(null);
            chatAbortControllerRef.current?.abort();
            const controller = new AbortController();
            chatAbortControllerRef.current = controller;
            responseText = await getChatbotResponse(input, controller.signal);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            console.error(err);
            responseText = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
            setChatError('聊天室暂时不可用，请稍后重试。');
        } finally {
            setIsLoading(false);
            chatAbortControllerRef.current = null;
        }

        const modelMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
        };
        setMessages(prev => [...prev, modelMessage]);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            chatAbortControllerRef.current?.abort();
            chatAbortControllerRef.current = null;
            setIsLoading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200 animate-fade-in-up">
            <header className="flex items-center justify-between p-4 bg-slate-700 text-white rounded-t-2xl">
                <h3 className="font-bold">Presentation Assistant</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-600 rounded-full">
                    <CloseIcon />
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-50" role="log" aria-live="polite">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`py-2 px-4 rounded-2xl max-w-[80%] ${
                            msg.role === 'user' 
                                ? 'bg-sky-600 text-white rounded-br-lg' 
                                : 'bg-gray-200 text-gray-800 rounded-bl-lg'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {chatError && (
                    <p className="text-xs text-red-600 mb-3 px-1">{chatError}</p>
                )}
                {isLoading && (
                    <div className="flex justify-start mb-3">
                        <div className="py-2 px-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-lg">
                            <div className="flex items-center justify-center gap-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex items-center bg-gray-100 rounded-full">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask for ideas..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                        disabled={isLoading}
                        ref={inputRef}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 text-sky-600 disabled:text-gray-400">
                        <SendIcon />
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }

                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
};
