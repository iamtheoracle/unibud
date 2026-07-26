import React, { useState } from "react";
import { Sparkles, X, Loader2, ListChecks, MessageSquareText, PenLine, Languages, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useSmartInbox } from "@/lib/communication/useSmartInbox";
import { summarizeConversation, suggestReplies, draftMessage } from "@/lib/communication/sparkComm";
import { base44 } from "@/api/base44Client";

/**
 * BudCommAssistant — Bud helps the user stay on top of communication WITHOUT
 * sending anything automatically. Drafts, summarizes, extracts action items,
 * suggests replies, and links to scheduling.
 */
export default function BudCommAssistant({ open, onClose }) {
  const { conversations } = useSmartInbox();
  const [convId, setConvId] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [intent, setIntent] = useState("");
  const [tab, setTab] = useState("summarize");

  if (!open) return null;
  const conv = conversations.find((c) => c.id === convId) || conversations[0];

  const loadMessages = async () => {
    if (!conv) return [];
    const msgs = await base44.entities.Message.filter({ conversation_id: conv.id, is_deleted: { $ne: true } }, "-created_date", 40);
    return msgs.reverse();
  };

  const run = async (action) => {
    if (!conv) return;
    setBusy(true); setOut(null);
    try {
      if (action === "summarize") {
        const msgs = await loadMessages();
        setOut({ kind: "summary", data: await summarizeConversation(msgs, conv) });
      } else if (action === "replies") {
        const msgs = await loadMessages();
        const last = msgs[msgs.length - 1];
        setOut({ kind: "replies", data: await suggestReplies(conv, last, conv.participants?.[0]?.name) });
      } else if (action === "draft") {
        setOut({ kind: "draft", data: await draftMessage(conv, intent || "a friendly update", conv.participants?.[0]?.name) });
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[520px] glass-strong rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-foreground">Bud · Communication help</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <select value={convId} onChange={(e) => { setConvId(e.target.value); setOut(null); }}
          className="w-full oracle-input mb-3">
          <option value="">Choose a conversation…</option>
          {conversations.slice(0, 50).map((c) => (
            <option key={c.id} value={c.id}>{c.title || "Direct chat"}</option>
          ))}
        </select>

        <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {[
            { k: "summarize", label: "Summarize", icon: ListChecks },
            { k: "replies", label: "Suggest replies", icon: MessageSquareText },
            { k: "draft", label: "Draft", icon: PenLine },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                  tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70"
                }`}>
                <Icon className="w-3 h-3" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "draft" && (
          <input value={intent} onChange={(e) => setIntent(e.target.value)}
            placeholder="What do you want to say? (e.g. reschedule our study session)"
            className="w-full oracle-input mb-3" />
        )}

        <button onClick={() => run(tab)} disabled={busy || !conv}
          className="w-full bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2 mb-3">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {tab === "summarize" ? "Summarize with Spark" : tab === "replies" ? "Suggest replies" : "Draft with Bud"}
        </button>

        {out?.kind === "summary" && (
          <div className="space-y-2">
            <p className="text-sm text-foreground">{out.data.summary}</p>
            {out.data.action_items?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mt-2">Action items</p>
                <ul className="text-xs text-foreground/80 list-disc pl-4">{out.data.action_items.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
            {out.data.key_decisions?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mt-2">Key decisions</p>
                <ul className="text-xs text-foreground/80 list-disc pl-4">{out.data.key_decisions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {out?.kind === "replies" && (
          <div className="space-y-2">
            {(out.data || []).map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/40 text-sm text-foreground">{r}</div>
            ))}
            <p className="text-[10px] text-muted-foreground">Bud won't send these — tap one to use it in the chat.</p>
          </div>
        )}

        {out?.kind === "draft" && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-muted/40 text-sm text-foreground">{out.data.draft}</div>
            {out.data.alternative_tone && (
              <div className="p-3 rounded-xl bg-muted/30 text-sm text-foreground/80 border border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">Softer tone</p>
                {out.data.alternative_tone}
              </div>
            )}
          </div>
        )}

        <Link to="/calendar" onClick={onClose}
          className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-accent spring-tap">
          <CalendarPlus className="w-3.5 h-3.5" /> Schedule a meeting
        </Link>
      </div>
    </div>
  );
}