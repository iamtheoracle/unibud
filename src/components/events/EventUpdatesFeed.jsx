import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Pin, Send, Loader2, Bell } from "lucide-react";

export default function EventUpdatesFeed({ eventId, isOrganizer }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: updates, isLoading } = useQuery({
    queryKey: ["eventUpdates", eventId],
    queryFn: () => base44.entities.EventUpdate.filter({ event_id: eventId }, "-created_date", 50),
  });

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await base44.entities.EventUpdate.create({
        event_id: eventId,
        content: content.trim(),
        author_name: "Organizer",
      });
      setContent("");
      qc.invalidateQueries({ queryKey: ["eventUpdates", eventId] });
      toast({ title: "Update posted" });
    } catch {
      toast({ title: "Couldn't post update", variant: "destructive" });
    }
    setPosting(false);
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
        <Bell className="w-3 h-3" /> Updates
      </p>

      {isOrganizer && (
        <div className="glass-card p-2.5 rounded-[14px] mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post an update for attendees..."
            rows={2}
            className="w-full bg-transparent text-[12px] text-foreground outline-none resize-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end mt-1">
            <button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className="px-3 py-1.5 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 spring-tap disabled:opacity-50"
            >
              {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Post
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 rounded-[12px] bg-muted/40 animate-pulse" />)}
        </div>
      ) : (updates || []).length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-3">No updates yet.</p>
      ) : (
        <div className="space-y-2">
          {(updates || []).map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={`glass-card p-2.5 rounded-[12px] ${update.pinned ? "border-primary/30" : ""}`}
            >
              {update.pinned && <Pin className="w-3 h-3 text-primary mb-1" />}
              <p className="text-[12px] text-foreground leading-relaxed">{update.content}</p>
              <p className="text-[9px] text-muted-foreground mt-1">
                {update.author_name || "Organizer"} · {new Date(update.created_date).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}