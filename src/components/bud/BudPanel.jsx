import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, X, History, FileText, Upload, Mic,
} from "lucide-react";
import { useBudPanel } from "@/lib/BudPanelContext";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import ChatMessage from "@/components/bud/ChatMessage";
import SpecialistStatus from "@/components/bud/SpecialistStatus";
import SuperModeSelector from "@/components/bud/SuperModeSelector";
import ExperiencePackSelector from "@/components/bud/ExperiencePackSelector";
import ConversationHistory from "@/components/bud/ConversationHistory";

export default function BudPanel() {
  const {
    closeBud, messages, input, setInput, sendMessage, isTyping,
    attachments, handleFileUpload, removeAttachment,
    screenContext, conversations, openConversation, newConversation,
    mode, setMode,
    activePacks, togglePack,
  } = useBudPanel();

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { isListening, isSupported, toggleListening } = useVoiceInput();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSummarize = () => {
    sendMessage(`Summarize what I'm looking at on the ${screenContext.name} page. What should I focus on?`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleVoice = () => {
    if (!isSupported) return;
    toggleListening((transcript) => setInput(transcript));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleFileUpload(file));
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeBud}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="fixed bottom-0 left-0 right-0 z-[61] lg:left-auto lg:top-0 lg:bottom-0 lg:right-0 lg:w-[420px] h-[80vh] lg:h-full glass-strong rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[32px] flex flex-col overflow-hidden"
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-primary/10 backdrop-blur-sm rounded-t-[32px] lg:rounded-l-[32px] flex items-center justify-center border-2 border-dashed border-primary/40 m-3 rounded-[20px]"
            >
              <div className="text-center">
                <Upload className="w-10 h-10 text-primary mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] font-semibold text-primary">Drop files to attach</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag handle (mobile) */}
        <div className="lg:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0 border-b border-border/20">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-[13px] text-foreground leading-tight">Bud</p>
              <p className="text-[9px] text-muted-foreground truncate">
                {screenContext.name} · Context-aware
              </p>
            </div>
          </div>
          <SuperModeSelector mode={mode} onModeChange={setMode} disabled={isTyping} />
          <ExperiencePackSelector activePacks={activePacks} onTogglePack={togglePack} disabled={isTyping} />
          <button
            onClick={handleSummarize}
            disabled={isTyping}
            title="Summarize this page"
            className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center spring-tap disabled:opacity-50 flex-shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="w-8 h-8 rounded-[10px] hover:bg-muted/60 flex items-center justify-center spring-tap flex-shrink-0"
          >
            <History className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={closeBud}
            className="w-8 h-8 rounded-[10px] hover:bg-muted/60 flex items-center justify-center spring-tap flex-shrink-0"
          >
            <X className="w-[16px] h-[16px] text-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 border-b border-border/20">
          {screenContext.actions.slice(0, 4).map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                disabled={isTyping}
                onClick={() => sendMessage(action.prompt)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-card border border-border/30 text-[10px] font-medium text-foreground whitespace-nowrap spring-tap disabled:opacity-50 flex-shrink-0"
              >
                <Icon className="w-3 h-3 text-primary" strokeWidth={2} />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Messages / Welcome */}
        {!hasMessages ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-4"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-3 gold-glow"
              >
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <h2 className="font-heading font-bold text-[16px] text-foreground mb-1">
                Bud · {screenContext.name}
              </h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                I can see you're on the {screenContext.name} page. Ask me anything — I'll handle it.
              </p>
            </motion.div>

            <div className="space-y-1.5">
              {screenContext.suggestedPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => sendMessage(prompt)}
                  disabled={isTyping}
                  className="w-full text-left p-2.5 rounded-[14px] bg-card border border-border/30 spring-tap disabled:opacity-50 flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-[10px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  </div>
                  <p className="text-[11px] text-foreground leading-snug">{prompt}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            <AnimatePresence>
              {isTyping && <SpecialistStatus />}
            </AnimatePresence>
          </div>
        )}

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-3 py-1.5 flex gap-1.5 flex-wrap flex-shrink-0 border-t border-border/20">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-[10px] bg-card border border-border/30">
                <FileText className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-foreground max-w-[80px] truncate">{att.name}</span>
                <button onClick={() => removeAttachment(i)} className="spring-tap">
                  <X className="w-2.5 h-2.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 flex-shrink-0 border-t border-border/20">
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              className="w-9 h-9 rounded-[14px] bg-card border border-border/30 flex items-center justify-center spring-tap flex-shrink-0"
            >
              <Upload className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={isListening ? "Listening..." : "Ask Bud..."}
                disabled={isTyping}
                className="w-full px-3.5 py-2.5 pr-9 rounded-[16px] bg-card border border-border/30 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow"
              />
              <button
                onClick={handleVoice}
                className={"absolute right-2.5 top-1/2 -translate-y-1/2 spring-tap " + (isListening ? "text-error" : "text-muted-foreground")}
              >
                <Mic className="w-4 h-4" strokeWidth={2} />
                {isListening && <span className="absolute -top-0.5 -right-0.5 w-2 rounded-full bg-error animate-pulse" />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground soft-shadow disabled:opacity-50 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Conversation History */}
      <ConversationHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        conversations={conversations}
        onOpen={openConversation}
        onNew={newConversation}
      />
    </>
  );
}