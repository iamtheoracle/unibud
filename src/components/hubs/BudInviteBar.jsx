import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useBudInvoke } from "@/hooks/useBudInvoke";
import BudHead from "@/components/bud/BudHead";

/**
 * BudInviteBar — shown only in non-academic hubs. Bud does NOT appear
 * by default. Students invite Bud with @Bud, Bud responds, then quietly
 * leaves the conversation.
 */
export default function BudInviteBar({ hub }) {
  const { processing, response, invoke, clear } = useBudInvoke();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    invoke({
      templateId: "bud.response",
      variables: {
        userMessage: message,
        context: `Hub: ${hub.label}. Description: ${hub.description}. Focus on ${hub.label} topics and keep the reply concise before quietly leaving the conversation.`,
      },
      autoDismiss: 12000,
    });
    setMessage("");
  };

  const handleDismiss = () => { clear(); };

  return (
    <div>
      <AnimatePresence mode="wait">
        {(processing || response) ? (
          <motion.div key="response" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-[16px] glass-strong p-3 flex gap-2.5">
            <BudHead size={32} mood={processing ? "thinking" : "happy"} glow />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Bud · invited</p>
              <p className="text-[12px] text-foreground leading-relaxed">{processing ? "Thinking..." : response}</p>
            </div>
            {!processing && (
              <button onClick={handleDismiss} className="w-7 h-7 rounded-full grid place-items-center text-muted-foreground spring-tap shrink-0" aria-label="Dismiss Bud">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-primary">@Bud</span>
              <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Invite Bud to help..." className="w-full pl-12 pr-4 py-2.5 rounded-full glass-strong text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {message.trim() && (
              <button onClick={handleSend} className="w-10 h-10 rounded-full bg-foreground text-background grid place-items-center spring-tap shrink-0"><Send className="w-4 h-4" /></button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}