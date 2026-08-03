import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { routeAgents, recordAgentActivity } from "@/lib/agentRegistry";
import { getScreenContext } from "@/lib/budScreenContext";
import { useDemoMode } from "@/lib/DemoModeContext";
import BudPanel from "@/components/bud/BudPanel";
import { useToast } from "@/components/ui/use-toast";
import { ensureSeeded } from "@/lib/spark/agents/registry";
import { runtime } from "@/lib/runtime";
import { buildSystemPrompt } from "@/lib/bud/prompts/systemPrompt";
import { createPersonality } from "@/lib/bud/personality";
import { buildAcademicContext, formatAcademicContext } from "@/lib/bud/contextBuilder";

const BudPanelContext = createContext(null);

export function useBudPanel() {
  const ctx = useContext(BudPanelContext);
  if (!ctx) return { isOpen: false, openBud: () => {}, closeBud: () => {}, sendMessage: async () => {} };
  return ctx;
}

export function BudPanelProvider({ children }) {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Seed the Spark agent registry once (admin-writable thereafter).
  useEffect(() => { ensureSeeded().catch(() => {}); }, []);

  // Build Bud's personality system prompt once (constitution + voice).
  const personality = createPersonality();
  const systemPrompt = buildSystemPrompt(personality);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const isSendingRef = useRef(false);

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

  const screenContext = getScreenContext(location.pathname);

  const openBud = useCallback((prompt) => {
    setIsOpen(true);
    if (prompt && prompt.trim()) {
      setPendingPrompt(prompt.trim());
    }
  }, []);

  const closeBud = useCallback(() => {
    setIsOpen(false);
    setPendingPrompt(null);
  }, []);

  const saveConversation = useCallback(async (allMessages, agentsUsed) => {
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
    } catch (err) {
      console.error("BudPanel: failed to save conversation", err);
      toast({
        title: "Conversation not saved",
        description: "We couldn't save this chat. Your messages are still visible, but won't persist across sessions.",
        variant: "destructive",
      });
    }
  }, [isDemoMode, activeConversationId, queryClient, toast]);

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim() || isTyping || isSendingRef.current) return;
    const trimmed = text.trim();
    isSendingRef.current = true;

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
      // ─── Single Execution Path ───────────────────────────────────────
      // Bud → Oracle → Guardian → Nexus → Platform Core → Spark → LLM
      // Bud's personality (constitution + voice) is passed as systemPrompt
      // so Spark composes responses in Bud's voice. Academic context is
      // passed so Bud can reference real assignments, exams, timetable, etc.
      let answer;
      if (runtime.ready) {
        // Fetch fresh academic context for this message (lightweight)
        const freshContext = await buildAcademicContext(
          user?.id,
          user?.data?.institution_id
        );
        const academicSummary = formatAcademicContext(freshContext);

        const result = await runtime.process({
          message: trimmed,
          userId: user?.id,
          context: {
            screen: screenContext,
            user,
            systemPrompt,
            academicContext: academicSummary,
          },
          fileUrls,
        });
        answer = result.text;
      } else {
        answer = "I'm still waking up — give me just a moment!";
      }

      const budMsg = { role: "bud", content: answer, time: new Date(), agents: agentIds };
      const finalMessages = [...newMessages, budMsg];
      setMessages(finalMessages);
      await saveConversation(finalMessages, agentIds);
    } catch {
      const errorMsg = {
        role: "bud",
        content: "I'm having trouble connecting right now. Let's try again in a moment!",
        time: new Date(),
        agents: agentIds,
      };
      setMessages([...newMessages, errorMsg]);
    }
    setIsTyping(false);
    setActiveAgents([]);
    isSendingRef.current = false;
  }, [isTyping, attachments, messages, screenContext, user, saveConversation]);

  // Auto-send pending prompt when panel opens
  useEffect(() => {
    if (isOpen && pendingPrompt) {
      const promptToSend = pendingPrompt;
      const timer = setTimeout(() => {
        setPendingPrompt(null);
        sendMessage(promptToSend);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, pendingPrompt, sendMessage]);

  const handleFileUpload = useCallback(async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments((prev) => [...prev, { url: file_url, name: file.name }]);
    } catch (err) {
      console.error("BudPanel: file upload failed", err);
      toast({
        title: "Attachment failed",
        description: `"${file.name}" couldn't be attached. Please try again.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const removeAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openConversation = useCallback((conv) => {
    setActiveConversationId(conv.id);
    const loaded = (conv.messages || []).map((m) => ({
      role: m.role || "user",
      content: m.content || "",
      time: m.time ? new Date(m.time) : new Date(),
      agents: m.agents || [],
    }));
    setMessages(loaded);
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setActiveAgents([]);
    setAttachments([]);
  }, []);

  const value = {
    isOpen,
    openBud,
    closeBud,
    messages,
    input,
    setInput,
    sendMessage,
    isTyping,
    activeAgents,
    attachments,
    handleFileUpload,
    removeAttachment,
    screenContext,
    conversations,
    activeConversationId,
    openConversation,
    newConversation,
    isDemoMode,
  };

  return (
    <BudPanelContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && <BudPanel />}
      </AnimatePresence>
    </BudPanelContext.Provider>
  );
}