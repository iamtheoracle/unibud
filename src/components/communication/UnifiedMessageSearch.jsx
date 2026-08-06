import React, { useState, useMemo } from "react";
import { Search, Sparkles, Loader2, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSmartInbox } from "@/lib/communication/useSmartInbox";
import { smartSearchConversations } from "@/lib/communication/sparkComm";

/** UnifiedMessageSearch — search every conversation (local + Spark semantic). */
export default function UnifiedMessageSearch({ open, onClose }) {
  const { conversations, localSearch, user } = useSmartInbox();
  const [q, setQ] = useState("");
  const [smart, setSmart] = useState(null);
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => (smart || localSearch(q)), [smart, q, localSearch]);

  if (!open) return null;

  const runSmart = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const ranked = await smartSearchConversations(q, conversations);
      setSmart(ranked);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 px-4" onClick={onClose}>
      <div className="w-full max-w-[520px] glass-strong rounded-3xl p-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-muted/60 rounded-full px-3.5 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              autoFocus value={q}
              onChange={(e) => { setQ(e.target.value); setSmart(null); }}
              onKeyDown={(e) => e.key === "Enter" && runSmart()}
              placeholder="Search all your conversations…"
              className="flex-1 bg-transparent outline-none text-sm text-foreground"
            />
            <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <button onClick={runSmart} disabled={loading || !q.trim()}
            className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-accent/15 text-accent text-xs font-semibold spring-tap disabled:opacity-40">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Smart
          </button>
        </div>

        {smart && (
          <p className="text-[11px] text-accent font-medium mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Spark semantic results
          </p>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No conversations match "{q}".</p>
          ) : results.slice(0, 30).map((c) => (
            <Link key={c.id} to={`/messages/${c.id}`} onClick={onClose}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 spring-tap">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {(c.title || "DM").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.title || "Direct chat"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c.last_message?.content || "No messages yet"}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}