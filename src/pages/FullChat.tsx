import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, ArrowLeft, ChevronDown, Menu, Trash2, Edit2, Check, Plus, X, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Magnetic } from "../components/Magnetic";
import { TextReveal } from "../components/TextReveal";
import { FormattedMessage } from "../components/FormattedMessage";
import { VeloLogo } from "../components/VeloLogo";
import { useChatLimits } from "../hooks/useChatLimits";
import { AuthModal } from "../components/AuthModal";
import { useChatSessions, ModelType, ChatMessage } from "../hooks/useChatSessions";
import { getApiUrl } from "../lib/apiUrl";

export function FullChat() {
  const { canSendMessage, incrementUsage } = useChatLimits();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { sessions, setSessions, currentSessionId, setCurrentSessionId, isLoading: sessionsLoading } = useChatSessions();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState("");
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasInitializedNewSessionRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync with current session on mount without force-creating new sessions
  useEffect(() => {
    if (!sessionsLoading && !hasInitializedNewSessionRef.current) {
      hasInitializedNewSessionRef.current = true;
      if (sessions.length === 0 || (sessions[0] && sessions[0].messages.length > 1)) {
        startNewSession();
      } else {
        setCurrentSessionId(sessions[0].id);
      }
    }
  }, [sessionsLoading, sessions, setCurrentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];
  const selectedModel = currentSession?.selectedModel || "vgpt-1.5";

  const setSelectedModel = (model: ModelType) => {
    setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, selectedModel: model } : s));
  };

  const setMessagesForCurrentSession = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSession.id) {
        const newMessages = typeof updater === 'function' ? updater(s.messages) : updater;
        let newTitle = s.title;
        if (s.title === "New Conversation" && newMessages.length > 1) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 25) + (firstUserMsg.content.length > 25 ? "..." : "");
          }
        }
        return { ...s, messages: newMessages, title: newTitle };
      }
      return s;
    }));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const check = canSendMessage(selectedModel);
    if (!check.allowed) {
      if (check.reason === 'disabled') {
        setMessagesForCurrentSession((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: "Sorry, AI Chat is currently disabled." },
        ]);
      } else if (check.reason === 'limit') {
        setMessagesForCurrentSession((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: "You've reached your daily limit for this model. Please log in." },
        ]);
        setIsAuthModalOpen(true);
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessagesForCurrentSession((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const isFirstUserMessage = messages.filter((m) => m.role === "user").length === 0;

    if (isFirstUserMessage && currentSession.title === "New Conversation") {
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
      incrementUsage(selectedModel);
      
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
        throw new Error(data.error || `Server error`);
      }

      setMessagesForCurrentSession((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessagesForCurrentSession((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hello! I am the Velo Service AI assistant. Let's discuss your next big project. How can we help you?",
        },
      ],
      selectedModel: "vgpt-1.5" as ModelType,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        startNewSession();
      }
    }
  };

  if (sessionsLoading) {
    return <div className="min-h-screen bg-velo-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-velo-black flex overflow-hidden"
    >
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <button
                onClick={startNewSession}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setCurrentSessionId(s.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === s.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate text-sm">
                    {editingSessionId === s.id ? (
                      <input
                        autoFocus
                        value={editingTitleInput}
                        onChange={e => setEditingTitleInput(e.target.value)}
                        onBlur={() => {
                          if (editingTitleInput.trim()) {
                            setSessions(prev => prev.map(session => session.id === s.id ? { ...session, title: editingTitleInput.trim() } : session));
                          }
                          setEditingSessionId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className="bg-transparent text-white border-b border-white/20 focus:outline-none focus:border-white w-full"
                      />
                    ) : (
                      s.title
                    )}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(s.id);
                        setEditingTitleInput(s.title);
                      }}
                      className="p-1 hover:bg-white/20 rounded text-white/50 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => deleteSession(s.id, e)}
                      className="p-1 hover:bg-white/20 rounded text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-velo-black/80 backdrop-blur-md grid grid-cols-3 items-center px-4 sm:px-6 relative z-50 shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 justify-start">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Magnetic intensity={0.1}>
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hover-target flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-xs tracking-wider uppercase hidden sm:inline-block">Home</span>
                </motion.button>
              </Link>
            </Magnetic>
          </div>
          
          <div className="flex justify-center items-center relative z-50">
            <button 
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs font-medium text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>{selectedModel === "vgpt-1.5" ? "VGPT-1.5 (Velo)" : selectedModel === "vgpt-2.0-lite" ? "VGPT-2.0 LITE" : "Gemini 3.5 Flash"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {showModelDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-72 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100] flex flex-col p-1 gap-1"
                >
                  <button 
                    type="button"
                    onClick={() => { setSelectedModel("vgpt-1.5"); setShowModelDropdown(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "vgpt-1.5" ? "bg-white/5 text-white" : "text-white/70"}`}
                  >
                    <span className="text-xs font-medium">VGPT-1.5 (Velo Trained)</span>
                    <span className="text-[10px] text-white/50 leading-relaxed">Our custom fine-tuned model for service and project inquiries.</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedModel("vgpt-2.0-lite"); setShowModelDropdown(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "vgpt-2.0-lite" ? "bg-white/5 text-white" : "text-white/70"}`}
                  >
                    <span className="text-xs font-medium">VGPT-2.0 LITE</span>
                    <span className="text-[10px] text-white/50 leading-relaxed">General, fast model for quick, conversational answers.</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedModel("gemini-3.5-flash"); setShowModelDropdown(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-1 ${selectedModel === "gemini-3.5-flash" ? "bg-white/5 text-white" : "text-white/70"}`}
                  >
                    <span className="text-xs font-medium">Gemini 3.5 Flash</span>
                    <span className="text-[10px] text-white/50 leading-relaxed">Fast and versatile model for general questions and coding.</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={startNewSession}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <span className="font-display font-bold tracking-wider text-sm hidden sm:inline-block text-white/90">Velo Assistant</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-velo-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <VeloLogo className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 mt-4 sm:mt-10">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  layout
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-white/10 text-white"
                        : "bg-white text-velo-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <VeloLogo className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  <div
                    className={`px-5 py-3.5 sm:px-8 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] max-w-[85%] sm:max-w-[80%] text-sm sm:text-base leading-relaxed shadow-xl ${
                      msg.role === "user"
                        ? "bg-white text-velo-black rounded-tr-sm"
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-md"
                    }`}
                  >
                    <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 flex-row"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-velo-black flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <VeloLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="px-6 py-4 sm:px-8 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 rounded-tl-sm backdrop-blur-md flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-6" />
          </div>
        </main>

        {/* Input Area */}
        <footer className="relative z-10 p-4 sm:p-8 border-t border-white/10 bg-velo-black/80 backdrop-blur-2xl">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about our services, process, or start a new project..."
                className="hover-target flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 sm:px-8 sm:py-5 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 shadow-inner"
              />
              <Magnetic intensity={0.2}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="hover-target w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white text-velo-black shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1" />
                </motion.button>
              </Magnetic>
            </form>
          </div>
        </footer>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </motion.div>
  );
}
