import { MessageSquare, X, Send, User, Minimize2, ChevronDown, Menu, Trash2, Edit2, Check, Plus, Maximize2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Magnetic } from "./Magnetic";
import { FormattedMessage } from "./FormattedMessage";
import { VeloLogo } from "./VeloLogo";
import { useChatLimits } from "../hooks/useChatLimits";
import { AuthModal } from "./AuthModal";
import { getApiUrl } from "../lib/apiUrl";

import { useChatSessions, ModelType, ChatMessage, ChatSession } from "../hooks/useChatSessions";

export function Chatbot() {
  const { canSendMessage, incrementUsage } = useChatLimits();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const { sessions, setSessions, currentSessionId, setCurrentSessionId, isLoading: sessionsLoading } = useChatSessions();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive current session properties
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0] || {
    id: "default",
    title: "New Conversation",
    messages: [],
    selectedModel: "vgpt-1.5" as ModelType
  };
  const messages = currentSession.messages;
  const selectedModel = currentSession.selectedModel;

  const setSelectedModel = (model: ModelType) => {
    setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, selectedModel: model } : s));
  };

  const setMessagesForCurrentSession = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSession.id) {
        const newMessages = typeof updater === 'function' ? updater(s.messages) : updater;
        
        let newTitle = s.title;
        if (s.title === "New Conversation") {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 25) + (firstUserMsg.content.length > 25 ? "..." : "");
          }
        }

        return {
          ...s,
          messages: newMessages,
          title: newTitle,
        };
      }
      return s;
    }));
  };

  const handleCreateSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hello! I am the Velo Service AI assistant. How can I help you today?",
        },
      ],
      selectedModel: "vgpt-1.5",
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // If we want it to open a new chat every time it's opened
      if (sessions.length === 0 || (sessions[0] && sessions[0].messages.length > 1)) {
        handleCreateSession();
      }
    }
  }, [isOpen]);

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.trim() } : s));
    setEditingSessionId(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const newId = Date.now().toString();
      setSessions([
        {
          id: newId,
          title: "New Conversation",
          messages: [
            {
              id: "1",
              role: "assistant",
              content: "Hello! I am the Velo Service AI assistant. How can I help you today?",
            },
          ],
          selectedModel: "vgpt-1.5",
        }
      ]);
      setCurrentSessionId(newId);
    } else {
      setSessions(filtered);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const check = canSendMessage(selectedModel);
    if (!check.allowed) {
      if (check.reason === 'disabled') {
        setMessagesForCurrentSession((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, AI Chat is currently disabled by the administrator.",
          },
        ]);
      } else if (check.reason === 'limit') {
        setMessagesForCurrentSession((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "You've reached your daily limit for this model. Please log in to unlock unlimited messaging and additional features.",
          },
        ]);
        setIsAuthModalOpen(true);
      }
      return;
    }

    incrementUsage(selectedModel);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const isFirstUserMessage = messages.filter((m) => m.role === "user").length === 0;

    setMessagesForCurrentSession((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (isFirstUserMessage && (currentSession.title === "New Conversation" || currentSession.title === "محادثة جديدة")) {
      fetch(getApiUrl("/api/chat/title"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setSessions((prev) => prev.map((s) => s.id === currentSession.id ? { ...s, title: data.title } : s));
          }
        })
        .catch((err) => console.error("Error generating smart title:", err));
    }

    try {
      const response = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          modelId: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}: ${JSON.stringify(data)}`);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
      };
      
      setMessagesForCurrentSession((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Sorry, I am having trouble connecting right now. Please try again later.",
      };
      setMessagesForCurrentSession((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Magnetic intensity={0.3}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="hover-target p-5 rounded-full bg-white text-velo-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-shadow duration-500 flex items-center justify-center relative group"
              >
                <div className="absolute inset-0 rounded-full border border-white scale-100 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 pointer-events-none" />
                <MessageSquare className="w-7 h-7" />
              </motion.button>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.8, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 60, scale: 0.8, filter: "blur(15px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[100dvh] sm:h-[600px] sm:max-h-[calc(100vh-6rem)] rounded-none sm:rounded-[2rem] flex flex-col overflow-hidden bg-velo-black/95 sm:bg-velo-black/80 backdrop-blur-2xl border-none sm:border border-white/10 shadow-2xl"
          >
            {/* Slide-out Sidebar for Chat Sessions */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="absolute inset-y-0 left-0 w-[85%] sm:w-72 bg-velo-black border-r border-white/10 flex flex-col z-40 shadow-2xl"
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <span className="font-display font-bold text-sm tracking-wide text-white">Chat History</span>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* New Chat Button */}
                  <div className="p-3">
                    <button
                      onClick={handleCreateSession}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-velo-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Chat</span>
                    </button>
                  </div>

                  {/* Sessions List */}
                  <div data-lenis-prevent className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {sessions.map((sess) => {
                      const isSelected = sess.id === currentSessionId;
                      const isEditing = sess.id === editingSessionId;

                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            if (!isEditing) {
                              setCurrentSessionId(sess.id);
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`group flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-white/10 border-white/20 text-white font-medium"
                              : "bg-transparent border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white"
                          } cursor-pointer`}
                        >
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingTitleInput}
                                onChange={(e) => setEditingTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRenameSession(sess.id, editingTitleInput);
                                  } else if (e.key === "Escape") {
                                    setEditingSessionId(null);
                                  }
                                }}
                                className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/40"
                                autoFocus
                              />
                              <button
                                onClick={() => handleRenameSession(sess.id, editingTitleInput)}
                                className="p-1 text-green-400 hover:text-green-300 hover:bg-white/10 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingSessionId(null)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-white/10 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-xs truncate pr-2">
                                {sess.title}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(sess.id);
                                    setEditingTitleInput(sess.title);
                                  }}
                                  className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSession(sess.id, e)}
                                  className="p-1 text-red-400/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col border-b border-white/10 bg-white/5 relative overflow-visible z-50">
              <div className="flex items-center justify-between p-5 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="flex items-center gap-3 relative z-10">
                  {/* Hamburger menu button for Side list of chats */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="hover-target p-2 -ml-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                    title="Chat sessions"
                    aria-label="Open sessions drawer"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-white text-velo-black flex items-center justify-center shadow-lg">
                    <VeloLogo className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wide">Velo Assistant</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      AI ONLINE
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                  <button
                    onClick={handleCreateSession}
                    className="hover-target p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                    title="New Chat"
                  >
                    <Plus className="w-4.5 h-4.5" />
                  </button>
                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="hover-target p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                    title="Open Full Screen Chat"
                  >
                    <Maximize2 className="w-4.5 h-4.5" />
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover-target p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                    title="Minimize"
                  >
                    <Minimize2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              
              {/* Model Selector */}
              <div className="px-5 pb-3 relative z-30">
                <button 
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center justify-between w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <span>Model: {selectedModel === "vgpt-1.5" ? "VGPT-1.5 (Velo Trained)" : selectedModel === "vgpt-2.0-lite" ? "VGPT-2.0 LITE" : "Gemini 3.5 Flash"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {showModelDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-5 right-5 top-full mt-1 bg-velo-black border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1 gap-1"
                    >
                      <button 
                        type="button"
                        onClick={() => { setSelectedModel("vgpt-1.5"); setShowModelDropdown(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "vgpt-1.5" ? "bg-white/5 text-white" : "text-white/70"}`}
                      >
                        <span className="text-xs font-medium">VGPT-1.5 (Velo Trained)</span>
                        <span className="text-[10px] text-white/50 leading-relaxed">Our custom fine-tuned model for service and project inquiries.</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => { setSelectedModel("vgpt-2.0-lite"); setShowModelDropdown(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "vgpt-2.0-lite" ? "bg-white/5 text-white" : "text-white/70"}`}
                      >
                        <span className="text-xs font-medium">VGPT-2.0 LITE</span>
                        <span className="text-[10px] text-white/50 leading-relaxed">General, fast model for quick, conversational answers.</span>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => { setSelectedModel("gemini-3.5-flash"); setShowModelDropdown(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "gemini-3.5-flash" ? "bg-white/5 text-white" : "text-white/70"}`}
                      >
                        <span className="text-xs font-medium">Gemini 3.5 Flash</span>
                        <span className="text-[10px] text-white/50 leading-relaxed">Fast and versatile model for general questions and coding.</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  layout
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-white/10 text-white"
                        : "bg-white text-velo-black shadow-md"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <VeloLogo className="w-4 h-4" />}
                  </div>
                  <div
                    className={`px-5 py-3 rounded-3xl max-w-[80%] text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-velo-black rounded-tr-sm"
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-md"
                    }`}
                  >
                    <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 flex-row"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-velo-black flex items-center justify-center flex-shrink-0 shadow-md">
                    <VeloLogo className="w-4 h-4" />
                  </div>
                  <div className="px-5 py-4 rounded-3xl bg-white/5 border border-white/10 rounded-tl-sm backdrop-blur-md flex items-center gap-1.5">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="hover-target flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                />
                <Magnetic intensity={0.2}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="hover-target w-12 h-12 flex items-center justify-center rounded-full bg-white text-velo-black shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </motion.button>
                </Magnetic>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
