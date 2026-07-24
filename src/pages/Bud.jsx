import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, History, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { buildBudPrompt, routeAgents, recordAgentActivity } from "@/lib/agentRegistry";
import { detectMatricNumber } from "@/lib/matriculationPrivacy";
import { useDemoMode } from "@/lib/DemoModeContext";
import ChatMessage from "@/components/bud/ChatMessage";
import BudThinking from "@/components/bud/BudThinking";
import BudComposer from "@/components/bud/BudComposer";
import ConversationHistory from "@/components/bud/ConversationHistory";

const STREAM_STEP = 3; // chars per tick
const STREAM_INTERVAL = 14; // ms per tick

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Bud() {
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const streamTimer = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => () => clearInterval(streamTimer.current), []);

  const saveConversation = async (allMessages, agentIds) => {
    if (isDemoMode) return;
    try {
      const title = (allMessages[0]?.content || "Conversation").slice(0, 50);
      const messagesData = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
        time: m.time?.toISOString?.() || new Date().toISOString(),
        agents: m.agents || [],
      }));
      const lastBudMsg = [...allMessages].reverse().find((m) => m.role === "bud");
      const summary = lastBudMsg?.content?.slice(0, 100) || title;

      if (activeConversationId) {
        await base44.entities.BudConversation.update(activeConversationId, {
          messages: messagesData,
          last_message_at: new Date().toISOString(),
          agents_used: [...new Set(agentIds)],
          message_count: allMessages.length,
          summary,
        });
      } else {
        const conv = await base44.entities.BudConversation.create({
          title, messages: messagesData, type: "general",
          last_message_at: new Date().toISOString(),
          agents_used: [...new Set(agentIds)],
          message_count: allMessages.length, summary,
        });
        setActiveConversationId(conv.id);
      }
      queryClient.invalidateQueries({ queryKey: ["budConversations"] });
    } catch {}
  };

  const streamResponse = (fullText, agentIds, baseMessages) =>
    new Promise((resolve) => {
      let i = 0;
      const budMsg = { role: "bud", content: "", time: new Date(), agents: agentIds };
      setMessages([...baseMessages, budMsg]);
      streamTimer.current = setInterval(() => {
        i += STREAM_STEP;
        const partial = fullText.slice(0, i);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...budMsg, content: partial };
          return next;
        });
        if (i >= fullText.length) {
          clearInterval(streamTimer.current);
          resolve([...baseMessages, { ...budMsg, content: fullText }]);
        }
      }, STREAM_INTERVAL);
    });

  const handleSend = async (text) => {
    if (!text?.trim() || isTyping) return;
    const trimmed = text.trim();

    const agents = routeAgents(trimmed);
    const agentIds = agents.map((a) => a.id);
    recordAgentActivity(agentIds);

    const fileUrls = attachments.map((a) => a.url).filter(Boolean);
    const userMsg = { role: "user", content: trimmed, time: new Date(), agents: agentIds };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setIsTyping(true);

    try {
      let matricSearchContext = "";
      const { isMatric, extracted } = detectMatricNumber(trimmed);
      if (isMatric && extracted) {
        try {
          const res = await base44.functions.invoke("studentSearch", {
            action: "find_by_matric",
            matriculation_number: extracted,
            university: user?.university,
          });
          const data = res.data || res;
          if (data.results?.length) {
            const students = data.results.map((r) =>
              `${r.full_name} — ${r.matriculation_number || "(masked)"} — ${r.department || "N/A"} · ${r.faculty || "N/A"} · ${r.level || "N/A"}L — ${r.university}${r.is_verified ? " [Verified]" : ""}`
            ).join("\n");
            matricSearchContext = `\n\n[Search Results for "${extracted}"]:\n${students}`;
          } else if (data.permissionDenied) {
            matricSearchContext = `\n\n[Search]: You do not have permission to search by exact matriculation number.`;
          } else {
            matricSearchContext = `\n\n[Search]: No student found with matriculation number "${extracted}".`;
          }
        } catch {}
      }

      const prompt = buildBudPrompt(trimmed, agents, user) + matricSearchContext;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });
      const full = typeof response === "string" ? response : response?.response || "";

      setIsTyping(false);
      const finalMessages = await streamResponse(full, agentIds, newMessages);
      await saveConversation(finalMessages, agentIds);
    } catch {
      setIsTyping(false);
      const errorMsg = {
        role: "bud",
        content: "I'm having a little trouble thinking that through. Could you try again?",
        time: new Date(), agents: agentIds,
      };
      setMessages([...newMessages, errorMsg]);
    }
    setIsTyping(false);
  };

  const handleFileUpload = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments((prev) => [...prev, { url: file_url, name: file.name }]);
    } catch {}
  };

  const handleOpenConversation = (conv) => {
    setActiveConversationId(conv.id);
    setMessages((conv.messages || []).map((m) => ({
      role: m.role || "user",
      content: m.content || "",
      time: m.time ? new Date(m.time) : new Date(),
      agents: m.agents || [],
    })));
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
    setShowHistory(false);
  };

  const hasMessages = messages.length > 0;
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="dark min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
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
            <div className="w-10 h-10 rounded-[14px] bg-foreground flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[15px] text-foreground leading-tight">Bud</h1>
            <p className="text-[10px] text-muted-foreground">Always here for you</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap"
        >
          <History className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </motion.div>

      <ConversationHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        onOpen={handleOpenConversation}
        onNew={handleNewConversation}
      />

      {/* Messages or empty state */}
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 no-scrollbar">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {isTyping && <BudThinking />}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-20 h-20 rounded-[24px] bg-foreground flex items-center justify-center mb-6"
          >
            <Sparkles className="w-10 h-10 text-background" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-heading font-bold text-[22px] text-foreground"
          >
            {timeGreeting()}, {firstName}.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[14px] text-muted-foreground mt-2 max-w-[280px] leading-relaxed"
          >
            What would you like to work on today?
          </motion.p>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 pb-1 flex gap-2 flex-wrap">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-card border border-border/40 soft-shadow">
              <span className="text-[11px] text-foreground max-w-[100px] truncate">{att.name || "File"}</span>
              <button onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))} className="spring-tap">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <BudComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        disabled={isTyping}
        showSuggestions={!hasMessages}
        onSuggestion={(p) => handleSend(p)}
      />
    </div>
  );
}