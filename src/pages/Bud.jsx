import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, Cpu, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { routeAgents, buildBudPrompt, recordAgentActivity } from "@/lib/agentRegistry";
import { useDemoMode } from "@/lib/DemoModeContext";
import BudWelcome from "@/components/bud/BudWelcome";
import ChatMessage from "@/components/bud/ChatMessage";
import AgentActivityIndicator from "@/components/bud/AgentActivityIndicator";
import ChatInput from "@/components/bud/ChatInput";
import BudCategories from "@/components/bud/BudCategories";
import ConversationHistory from "@/components/bud/ConversationHistory";

export default function Bud() {
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: conversations } = useQuery({
    queryKey: ["budConversations"],
    queryFn: () => base44.entities.BudConversation.list("-last_message_at", 20),
    enabled: !isDemoMode,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const saveConversation = async (allMessages, agentsUsed) => {
    if (isDemoMode) return;
    try {
      const title = (allMessages[0]?.content || "Conversation").slice(0, 50);
      const messagesData = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
        time: m.time?.toISOString?.() || new Date().toISOString(),
        agents: m.agents || [],
      }));
      const agentIds = [...new Set(agentsUsed)];
      const lastBudMsg = [...allMessages].reverse().find((m) => m.role === "bud");
      const summary = lastBudMsg?.content?.slice(0, 100) || title;

      if (activeConversationId) {
        await base44.entities.BudConversation.update(activeConversationId, {
          messages: messagesData,
          last_message_at: new Date().toISOString(),
          agents_used: agentIds,
          message_count: allMessages.length,
          summary,
        });
      } else {
        const conv = await base44.entities.BudConversation.create({
          title,
          messages: messagesData,
          type: "general",
          last_message_at: new Date().toISOString(),
          agents_used: agentIds,
          message_count: allMessages.length,
          summary,
        });
        setActiveConversationId(conv.id);
      }
      queryClient.invalidateQueries({ queryKey: ["budConversations"] });
    } catch {}
  };

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;
    const trimmed = text.trim();

    const agents = routeAgents(trimmed);
    const agentIds = agents.map((a) => a.id);
    recordAgentActivity(agentIds);

    const userMsg = { role: "user", content: trimmed, time: new Date(), agents: agentIds };
    const fileUrls = attachments.map((a) => a.url).filter(Boolean);
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setActiveAgents(agents);
    setIsTyping(true);

    try {
      const prompt = buildBudPrompt(trimmed, agents, user);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });

      const budMsg = { role: "bud", content: response, time: new Date(), agents: agentIds };
      const finalMessages = [...newMessages, budMsg];
      setMessages(finalMessages);
      await saveConversation(finalMessages, agentIds);
    } catch {
      const errorMsg = {
        role: "bud",
        content: "I'm having a bit of trouble connecting right now. Let's try again in a moment!",
        time: new Date(),
        agents: agentIds,
      };
      setMessages([...newMessages, errorMsg]);
    }
    setIsTyping(false);
    setActiveAgents([]);
  };

  const handleFileUpload = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments((prev) => [...prev, { url: file_url, name: file.name }]);
    } catch {}
  };

  const handleOpenConversation = (conv) => {
    setActiveConversationId(conv.id);
    const loaded = (conv.messages || []).map((m) => ({
      role: m.role || "user",
      content: m.content || "",
      time: m.time ? new Date(m.time) : new Date(),
      agents: m.agents || [],
    }));
    setMessages(loaded);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
    setActiveAgents([]);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3"
      >
        <Link to="/" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[15px] text-foreground">Bud</h1>
            <p className="text-[10px] text-success font-medium flex items-center gap-1">
              Online · Always here for you
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap"
        >
          <History className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
        <Link to="/agents" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <Cpu className="w-[18px] h-[18px] text-muted-foreground" />
        </Link>
      </motion.div>

      <ConversationHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        onOpen={handleOpenConversation}
        onNew={handleNewConversation}
      />

      {!hasMessages ? (
        <BudWelcome
          user={user}
          onPrompt={handleSend}
          conversations={conversations}
          onOpenConversation={handleOpenConversation}
        />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 no-scrollbar">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} index={i} />
          ))}
          <AnimatePresence>
            {isTyping && <AgentActivityIndicator agents={activeAgents} />}
          </AnimatePresence>
          <BudCategories onPrompt={handleSend} />
        </div>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        attachments={attachments}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={(i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
        disabled={isTyping}
      />
    </div>
  );
}