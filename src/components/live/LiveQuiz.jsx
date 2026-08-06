import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileQuestion, CheckCircle2, X, Sparkles } from "lucide-react";

export default function LiveQuiz({ quiz, onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const q = quiz.questions[current];
  const isLast = current === quiz.questions.length - 1;

  const handleNext = () => {
    setAnswers([...answers, selected]);
    if (isLast) { setSubmitted(true); }
    else { setCurrent(current + 1); setSelected(null); }
  };

  const score = answers.filter((a, i) => a === quiz.questions[i].correct).length;

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <FileQuestion className="w-5 h-5 text-primary" />
        <p className="font-heading font-bold text-[14px] text-foreground flex-1">Live Quiz</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!submitted ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold text-primary">Q{current + 1}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} /></div>
              <span className="text-[10px] text-muted-foreground">{current + 1}/{quiz.questions.length}</span>
            </div>
            <p className="font-heading font-bold text-[15px] text-foreground mb-4">{q.question}</p>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setSelected(i)} className={`w-full p-3.5 rounded-2xl border text-left transition-all ${selected === i ? "border-primary bg-primary/5" : "border-border/50 bg-muted/30"}`}>
                  <span className="text-[13px] font-medium text-foreground">{opt}</span>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={selected === null} className="mt-4 w-full h-[44px] rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] disabled:opacity-40">
              {isLast ? "Submit Quiz" : "Next Question"}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </motion.div>
            <p className="font-heading font-extrabold text-[28px] text-foreground">{score}/{quiz.questions.length}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{score === quiz.questions.length ? "Perfect score! 🎉" : "Good effort!"}</p>
            <div className="mt-6 p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground">Bud can explain any questions you missed. Just ask!</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}