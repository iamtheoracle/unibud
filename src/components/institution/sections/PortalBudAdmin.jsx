import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const TASKS = [
  "Summarize this week's operations",
  "Draft an announcement about rescheduled lectures",
  "Explain the grading policy to new staff",
  "Prepare a brief enrollment report",
];

export default function PortalBudAdmin({ institution }) {
  const [prompt, setPrompt] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (text) => {
    const content = (text ?? prompt).trim();
    if (!content || busy) return;
    setBusy(true); setOut("");
    try {
      const sys = `You are Bud, an administrative assistant for ${institution?.name || "the institution"} (${institution?.type || ""}). Help staff summarize reports, draft announcements, explain academic regulations, and prepare documents. Never perform administrative actions without authorization. Be concise and professional.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `${sys}\n\nRequest: ${content}` });
      setOut(typeof res === "string" ? res : JSON.stringify(res));
    } catch { toast({ title: "Bud is unavailable" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h1 className="text-[20px] font-heading font-bold">Bud Administrative Assistant</h1></div>
      <p className="text-[13px] text-muted-foreground">Bud summarizes, drafts, and explains — but never acts without your authorization.</p>

      <div className="flex flex-wrap gap-2">
        {TASKS.map((t) => <button key={t} onClick={() => run(t)} className="px-3 py-1.5 rounded-full text-[12px] glass spring-tap flex items-center gap-1"><Wand2 className="w-3.5 h-3.5 text-primary" />{t}</button>)}
      </div>

      <div className="glass-card radius-lg p-4 space-y-3">
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Ask Bud to summarize, draft, or explain…" />
        <Button onClick={() => run()} disabled={busy || !prompt.trim()}>{busy ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Thinking…</> : <><Send className="w-4 h-4 mr-1" />Ask Bud</>}</Button>
      </div>

      {out && <div className="glass-card radius-lg p-4"><pre className="whitespace-pre-wrap text-[13px] font-body leading-relaxed">{out}</pre></div>}
    </div>
  );
}