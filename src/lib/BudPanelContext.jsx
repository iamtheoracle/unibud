import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getAgentById, buildBudPrompt, recordAgentActivity } from "@/lib/agentRegistry";
import { getScreenContext } from "@/lib/budScreenContext";
import { useDemoMode } from "@/lib/DemoModeContext";
import BudPanel from "@/components/bud/BudPanel";
import { initOracle } from "@/lib/oracle";

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
    } catch {}
  }, [isDemoMode, activeConversationId, queryClient]);

  const resolveAgents = useCallback(
    (agentIds) => (agentIds || []).map((id) => getAgentById(id)).filter(Boolean),
    []
  );

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim() || isTyping || isSendingRef.current) return;
    const trimmed = text.trim();
    isSendingRef.current = true;

    const fileUrls = attachments.map((a) => a.url).filter(Boolean);
    const userMsg = { role: "user", content: trimmed, time: new Date(), agents: [] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setIsTyping(true);

    try {
      // ── TASK-005: All Bud requests flow through Oracle ───────────────────
      const oracle = initOracle(base44.integrations.Core);

      const oracleResponse = await oracle.process(
        {
          text:      trimmed,
          user,
          screen:    screenContext,
          fileUrls,
          sessionId: activeConversationId || undefined,
        },
        (command, requestUser) => {
          const contextPrefix = `The student is currently on the ${screenContext.name} page — ${screenContext.description}.\n\n`;
          const agents = resolveAgents(command.agentIds);
          return contextPrefix + buildBudPrompt(command.text, agents, requestUser);
        }
      );

      const { content, agentIds } = oracleResponse;

      recordAgentActivity(agentIds);

      // Update user message with resolved agent IDs
      const updatedUserMsg = { ...userMsg, agents: agentIds };
      const budMsg = { role: "bud", content, time: new Date(), agents: agentIds };
      const finalMessages = [...messages, updatedUserMsg, budMsg];
      setMessages(finalMessages);
      setActiveAgents(resolveAgents(agentIds));
      await saveConversation(finalMessages, agentIds);
    } catch {
      const errorMsg = {
        role: "bud",
        content: "I'm having trouble connecting right now. Let's try again in a moment!",
        time: new Date(),
        agents: [],
      };
      setMessages([...newMessages, errorMsg]);
    }
    setIsTyping(false);
    setActiveAgents([]);
    isSendingRef.current = false;
  }, [isTyping, attachments, messages, screenContext, user, saveConversation, activeConversationId, resolveAgents]);

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
    } catch {}
  }, []);

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