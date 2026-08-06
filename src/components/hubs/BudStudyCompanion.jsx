import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileText, Layers, HelpCircle, Languages, Send } from "lucide-react";
import { useBudInvoke } from "@/hooks/useBudInvoke";
import BudHead from "@/components/bud/BudHead";

const ACTIONS = [
  { id: "ask", label: "Ask", icon: MessageSquare },
  { id: "summarize", label: "Summarize", icon: FileText },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "translate", label: "Translate", icon: Languages },
];

const PROMPTS = {
  summarize: "Summarize the key academic discussions in this community in 3 concise bullet points.",
  flashcards: "Create 5 study flashcards from common academic topics in this community.",
  quiz: "Create a 3-question quiz to test understanding of academic content in this community.",
  translate: "Identify key academic terms in this community and explain them in simple language.",
};

/**
 * BudStudyCompanion — shown only in academic hubs. Bud is a built-in
 * teaching assistant: ask questions, summarize discussions, generate
 * flashcards, create quizzes, translate content.
 */
export default function BudStudyCompanion({ hub }) {
  const { processing, response, invoke } = useBudInvoke();
  const [showInput, setShowInput] = useState(false);
  const [question, setQuestion] = useState("");

  const handleAction = (actionId) => {
    if (actionId === "ask") { setShowInput(!showInput); return; }
    invoke({
      templateId: "bud.response",
      variables: {
        userMessage: PROMPTS[actionId],
        context: `Academic hub: ${hub.label}. Description: ${hub.description}. Answer like Bud the study companion with practical academic guidance.`,
      },
    });
  };

  const handleAsk = () => {
    if (!question.trim()) return;
    invoke({
      templateId: "bud.response",
      variables: {
        userMessage: question,
        context: `Academic hub: ${hub.label}. Description: ${hub.description}. Provide a helpful, educational response as Bud the study companion.`,
      },
    });
    setQuestion("");
    setShowInput(false);
  };

  return (
    <div className="rounded-[16px] glass-card p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <BudHead size={28} mood="happy" />
        <p className="text-[12px] text-muted-foreground">Bud is your study companion here.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => handleAction(a.id)} className="px-2.5 py-1.5 rounded-full bg-secondary/50 text-[11px] font-medium text-foreground whitespace-nowrap spring-tap flex items-center gap-1">
              <Icon className="w-3 h-3" /> {a.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {showInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 flex gap-2 overflow-hidden">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAsk()} placeholder="Ask Bud anything..." className="flex-1 px-3 py-2 rounded-[12px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleAsk} className="w-9 h-9 rounded-[12px] bg-foreground text-background grid place-items-center spring-tap shrink-0"><Send className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(processing || response) && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 p-2.5 rounded-[12px] bg-primary/5 flex gap-2">
            <BudHead size={24} mood={processing ? "thinking" : "happy"} />
            <p className="text-[12px] text-foreground leading-relaxed">{processing ? "Bud is thinking..." : response}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}