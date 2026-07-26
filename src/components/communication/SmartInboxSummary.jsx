import React, { useState } from "react";
import { Sparkles, Loader2, ChevronRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useSmartInbox } from "@/lib/communication/useSmartInbox";
import { summarizeUnreadDigest } from "@/lib/communication/sparkComm";

/** SmartInboxSummary — Spark's calm digest of unread chats, surfaced at the
 * top of the Communication Hub. Generates on demand to respect credits. */
export default function SmartInboxSummary() {
  const { unread, unreadCount } = useSmartInbox();
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);

  if (unreadCount === 0) {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">All caught up</p>
          <p className="text-[11px] text-muted-foreground">No unread conversations right now.</p>
        </div>
      </div>
    );
  }

  const generate = async () => {
    setLoading(true);
    try {
      const res = await summarizeUnreadDigest(unread);
      setDigest(res);
    } finally { setLoading(false); }
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">{unreadCount} unread {unreadCount === 1 ? "chat" : "chats"}</p>
        </div>
        <button onClick={generate} disabled={loading}
          className="text-[11px] font-semibold text-accent flex items-center gap-1 spring-tap">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {digest ? "Refresh" : "Summarize"}
        </button>
      </div>

      {!digest && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {unread.slice(0, 5).map((c) => (
            <Link key={c.id} to={`/messages/${c.id}`}
              className="flex-shrink-0 w-[160px] p-2.5 rounded-xl bg-muted/40 spring-tap">
              <p className="text-xs font-semibold text-foreground truncate">{c.title || "Direct chat"}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{c.last_message?.content || "New activity"}</p>
            </Link>
          ))}
        </div>
      )}

      {digest && (
        <div className="space-y-2">
          <p className="text-xs text-foreground/80">{digest.headline}</p>
          {digest.suggested_first && (
            <p className="text-[11px] text-accent font-medium flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Open first: {digest.suggested_first}
            </p>
          )}
          {digest.priorities?.slice(0, 3).map((p, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">{p.chat}</p>
                <p className="text-[10px] text-muted-foreground">{p.why_important}</p>
              </div>
            </div>
          ))}
          {digest.can_wait?.length > 0 && (
            <p className="text-[10px] text-muted-foreground pt-1">Can wait: {digest.can_wait.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}