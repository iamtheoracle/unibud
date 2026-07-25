import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import BudFigure from "@/components/bud/BudFigure";

const SUGGESTIONS = [
  "How do I beat exam anxiety?",
  "Make a 7-day revision plan for JAMB Physics",
  "Explain active recall vs spaced repetition",
  "Tips for IELTS reading time management",
];

export default function ExamCoach() {
  const [msgs, setMsgs] = useState([{ role: "bud", content: "Hi, I'm Bud — your exam coach. Ask me about revision plans, exam technique, time management, or anything stressing you about your tests. 💙" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const next = [...msgs, { role: "user", content }];
    setMsgs(next);
    setBusy(true);
    try {
      const prompt = `You are Bud, a warm, encouraging exam coach for university and pre-university students (JAMB, WAEC, NECO, IELTS, TOEFL, etc.). Be concise, practical, and motivating. Student: ${content}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setMsgs([...next, { role: "bud", content: typeof res === "string" ? res : JSON.stringify(res) }]);
    } catch { setMsgs([...next, { role: "bud", content: "I'm having trouble right now — please try again." }]); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur-xl">
        <Link to="/exam"><ArrowLeft className="w-5 h-5" /></Link>
        <BudFigure emotion="encouraging" size={32} />
        <div><h2 className="font-heading font-semibold text-[15px]">Bud Exam Coach</h2><p className="text-[11px] text-muted-foreground">Your supportive study mentor</p></div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="max-w-[640px] mx-auto space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 radius-lg text-[14px] leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "glass"}`}>{m.content}</div>
            </div>
          ))}
          {busy && <div className="flex items-center gap-2 text-muted-foreground text-[13px]"><Loader2 className="w-4 h-4 animate-spin" />Bud is thinking…</div>}
          <div ref={endRef} />
        </div>
      </div>

      {msgs.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 px-3 py-1.5 rounded-full text-[12px] glass spring-tap">{s}</button>)}
        </div>
      )}

      <div className="px-4 py-3 border-t border-border bg-background/90 backdrop-blur-xl safe-area-pb">
        <div className="max-w-[640px] mx-auto flex gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder="Ask Bud…" className="resize-none min-h-[44px]" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <Button onClick={() => send()} disabled={busy || !input.trim()} className="shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}