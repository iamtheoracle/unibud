import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useAddComment, useTaskComments, TASK_QK } from "@/lib/tasks/useTasks";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export default function TaskComments({ task, actor }) {
  const qc = useQueryClient();
  const { data: comments, isLoading } = useTaskComments(task.id);
  const addComment = useAddComment();
  const [text, setText] = useState("");

  // Live updates via realtime subscription
  useEffect(() => {
    const unsub = base44.entities.TaskComment.subscribe((event) => {
      if (event.data?.task_id === task.id) qc.invalidateQueries({ queryKey: [...TASK_QK, "comments", task.id] });
    });
    return unsub;
  }, [task.id, qc]);

  const parseMentions = (str) => {
    const matches = str.match(/@(\w+)/g) || [];
    return matches.map((m) => m.slice(1));
  };

  const send = async () => {
    if (!text.trim()) return;
    const mentions = parseMentions(text);
    await addComment.mutateAsync({ task, content: text.trim(), actor, mentions });
    setText("");
  };

  return (
    <div className="crystal-card p-4">
      <h3 className="text-[13px] font-heading font-semibold mb-3">Discussion</h3>
      <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar mb-3">
        {isLoading && <p className="text-[12px] text-muted-foreground">Loading…</p>}
        {(comments || []).map((c) => (
          <div key={c.id} className="flex gap-2.5 msg-in">
            {c.author_image ? (
              <img src={c.author_image} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-[11px] font-bold text-primary shrink-0">
                {(c.author_name || "U").charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-semibold">{c.author_name}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.created_date).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              <p className="text-[13px] text-foreground/90 whitespace-pre-wrap break-words">{c.content}</p>
            </div>
          </div>
        ))}
        {!isLoading && (comments || []).length === 0 && <p className="text-[12px] text-muted-foreground">Start the conversation — mention teammates with @.</p>}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Comment… @mention to notify"
          className="flex-1 min-h-[40px] max-h-[100px] p-2.5 rounded-xl bg-muted/40 border border-border text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={send} disabled={addComment.isPending || !text.trim()} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center spring-tap disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}