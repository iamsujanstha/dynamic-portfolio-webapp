/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minus, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askSujanAI } from '@/src/services/aiAssistantService';

import { useTheme } from '@/src/providers';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const SUJAN_AVATAR = "https://github.com/iamsujanstha.png";

export const AIAssistant = () => {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Sujan Shrestha. Feel free to ask me anything about my experience, technical skills, or if you'd like to schedule an interview!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Are you available for an interview?",
    "Tell me about your projects",
    "What are your core technical skills?",
    "What are your hobbies?",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const userMessage = customMessage || input.trim();
    if (!userMessage || isLoading) return;

    if (!customMessage) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await askSujanAI(userMessage, history);
    
    setMessages(prev => [...prev, { role: 'model', content: response || "I'm not sure how to answer that. Try asking about my projects!" }]);
    setIsLoading(false);
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-black',
    header: isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-b border-black/5 shadow-sm',
    border: isDarkMode ? 'border-white/10' : 'border-black/5',
    bubbleUser: isDarkMode ? 'bg-white text-black font-bold shadow-lg' : 'bg-black text-white font-bold shadow-lg',
    bubbleModel: isDarkMode ? 'bg-white/5 border-white/10 text-white/90 shadow-inner' : 'bg-gray-50/80 border border-black/5 text-gray-800 shadow-sm',
    inputBg: isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white',
    suggestionBg: isDarkMode ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    icon: isDarkMode ? 'text-white/70' : 'text-black/50',
    prose: isDarkMode ? 'prose-invert' : 'prose-neutral'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(15px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              filter: 'blur(0px)',
              height: isMinimized ? '72px' : '600px'
            }}
            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(15px)' }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 350,
              mass: 0.8
            }}
            className={`w-[400px] max-w-[calc(100vw-2.5rem)] ${theme.bg} border ${theme.border} rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden mb-6 backdrop-blur-2xl transition-all duration-500 ring-1 ${isDarkMode ? 'ring-white/10' : 'ring-black/5'}`}
          >
            {/* Header */}
            <div className={`p-5 h-[72px] ${theme.header} flex items-center justify-between transition-colors duration-300 z-10`}>
              <div className="flex items-center gap-4">
                <div className="relative group/avatar">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-12 h-12 rounded-full bg-brand-primary overflow-hidden border-2 ${isDarkMode ? 'border-white/10' : 'border-white shadow-sm'}`}
                  >
                    <img 
                      src={SUJAN_AVATAR} 
                      alt="Sujan" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></span>
                </div>
                <div>
                  <h3 className={`${theme.text} font-bold text-base tracking-tight leading-none mb-1.5`}>Sujan Shrestha</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <p className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-black/40'} font-black uppercase tracking-[0.2em]`}>Software Engineer</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`p-2 hover:${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-xl transition-all active:scale-90`}
                >
                  <Minus size={18} className={theme.icon} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={`p-2 hover:${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-xl transition-all active:scale-90`}
                >
                  <X size={18} className={theme.icon} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isMinimized && (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col min-h-0 bg-transparent"
                >
                  {/* Messages */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-7 scrollbar-thin scrollbar-thumb-brand-primary/20 hover:scrollbar-thumb-brand-primary/40 scrollbar-track-transparent pr-3 mr-0.5"
                  >
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: i === messages.length - 1 ? 0 : 0.05,
                          ease: [0.23, 1, 0.32, 1] 
                        }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {msg.role === 'model' && (
                            <div className={`flex-shrink-0 w-9 h-9 rounded-full border ${theme.border} overflow-hidden mt-1 bg-brand-primary/10 shadow-md`}>
                              <img src={SUJAN_AVATAR} alt="S" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className={`p-4.5 rounded-[1.8rem] text-[14px] leading-relaxed shadow-sm prose ${theme.prose} max-w-none transition-all duration-300 ${
                            msg.role === 'user' 
                              ? `${theme.bubbleUser} rounded-tr-none hover:shadow-2xl hover:-translate-y-0.5` 
                              : `${theme.bubbleModel} rounded-tl-none hover:border-brand-primary/20 hover:shadow-md`
                          }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className={`flex gap-2.5 items-center ${theme.bubbleModel} px-6 py-5 rounded-[1.8rem] rounded-tl-none ml-13`}>
                          <div className="flex gap-1.5">
                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className={`w-2 h-2 bg-brand-primary rounded-full`} />
                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={`w-2 h-2 bg-brand-primary rounded-full`} />
                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={`w-2 h-2 bg-brand-primary rounded-full`} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Suggestions - Wrapped in a scroll area if many */}
                  <div className="flex-shrink-0">
                    {messages.length === 1 && !isLoading && (
                      <div className="px-5 pb-4 flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSend(q)}
                            className={`text-[10px] font-bold uppercase tracking-wider ${theme.suggestionBg} border px-4 py-2.5 rounded-full transition-all shadow-sm`}
                          >
                            {q}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className={`p-6 pb-8 ${theme.header} border-t backdrop-blur-xl transition-all duration-300`}>
                    <div className="relative group/input">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message Sujan..."
                        className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl py-5 pl-7 pr-16 text-[15px] ${theme.text} focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/40 transition-all placeholder:${isDarkMode ? 'text-white/20' : 'text-black/30'} shadow-sm font-medium`}
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl transition-all disabled:scale-90 disabled:opacity-0 ${
                          isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                        } hover:bg-brand-primary hover:text-white shadow-xl active:scale-90`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={isOpen ? { scale: 1, rotate: 0 } : { 
          y: [0, -10, 0],
        }}
        transition={isOpen ? { duration: 0.2 } : { 
          repeat: Infinity, 
          duration: 3, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-500 overflow-hidden border-2 border-white/20 ${
          isOpen ? 'bg-white text-black' : 'bg-brand-primary text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 2 }}
            >
              <MessageSquare size={28} fill="currentColor" className="opacity-90" />
            </motion.div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </motion.button>
    </div>
  );
};
