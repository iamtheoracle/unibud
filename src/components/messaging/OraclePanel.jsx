import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Sparkles, FileText, ClipboardList, HelpCircle,
  Layers, Languages, NotebookPen, Copy, Check,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const ORACLE_ACTIONS = [
  { key: "summarize", label: "Summarize Chat", icon: FileText, desc: "Get a concise summary of the conversation" },
  { key: "assignments", label: "Extract Assignments", icon: ClipboardList, desc: "Find tasks and deadlines mentioned" },
  { key: "revision", label: "Revision Questions", icon: HelpCircle, desc: "Generate study questions from the chat" },
  { key: "flashcards", label: "Create Flashcards", icon: Layers, desc: "Build Q&A flashcards from key topics" },
  { key: "translate", label: "Translate", icon: Languages, desc: "Translate recent messages to English" },
  { key: "notes", label: "Meeting Notes", icon: NotebookPen, desc: "Create structured notes from the chat" },
];

export default function OraclePanel({ open, onClose, messages, conversationTitle }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const chatContext = messages
    .filter((m) => m.type !== "system")
    .slice(-30)
    .map((m) => `${m.author_name}: ${m.content || `[${m.type}]`}`)
    .join("\n");

  const prompts = {
    summarize: `You are Bud, an academic assistant. Summarize this conversation concisely, highlighting key points, decisions, and action items:\n\n${chatContext}`,
    assignments: `You are Bud, an academic assistant. Extract any assignments, deadlines, or tasks mentioned in this conversation. Format as a list with due dates if mentioned:\n\n${chatContext}`,
    revision: `You are Bud, an academic assistant. Based on this conversation, generate 5 revision questions that would help students prepare. Include answers:\n\n${chatContext}`,
    flashcards: `You are Bud, an academic assistant. Create 5 flashcards (question and answer format) based on the key topics in this conversation:\n\n${chatContext}`,
    translate: `You are Bud, an academic assistant. Translate the most recent messages to clear, simple English. Simplify any complex academic terms:\n\n${chatContext}`,
    notes: `You are Bud, an academic assistant. Create structured meeting notes from this conversation, including topics discussed, decisions made, and action items:\n\n${chatContext}`,
  };

  const runAction = async (actionKey) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[actionKey],
        response_json_schema: { type: "object", properties: { result: { type: "string" } } },
      });
      setResult(res.result || typeof res === "string" ? res : JSON.stringify(res));
    } catch {
      setResult("Sorry, I could not process that request right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="w-full max-w-lg glass-strong rounded-t-[28px] pb-6 pt-3 px-4 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-[16px] text-foreground">Bud Assistance</h2>
                <p className="text-[10px] text-muted-foreground">{conversationTitle || "Conversation"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {!result && !loading && (
            <div className="grid grid-cols-2 gap-2">
              {ORACLE_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.key}
                    onClick={() => runAction(action.key)}
                    className="flex flex-col items-start gap-1.5 p-3 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-colors spring-tap text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground">{action.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{action.desc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <p className="text-[13px] text-muted-foreground">Bud is analyzing the conversation...</p>
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-primary">Result</span>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground spring-tap"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/30 text-[13px] text-foreground whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">
                {result}
              </div>
              <button
                onClick={() => setResult(null)}
                className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold spring-tap"
              >
                Back to actions
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}