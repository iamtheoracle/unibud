import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Send, Pin, Heart, MessageSquare, Lock, Plus } from "lucide-react";
import { DISCUSSION_CATEGORIES, timeAgo, isOfficer } from "./orgConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OrgFeed({ club, user }) {
  const [composing, setComposing] = useState(false);
  const officer = isOfficer(club.members, user?.id);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setComposing(!composing)}
        className="w-full flex items-center gap-2 p-3 rounded-[16px] bg-card soft-shadow spring-tap"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary" strokeWidth={2.5} />
        </div>
        <span className="text-[13px] text-muted-foreground">Start a discussion...</span>
      </button>

      {composing && <Composer club={club} user={user} onClose={() => setComposing(false)} officer={officer} />}

      <FeedList club={club} user={user} />
    </div>
  );
}

function FeedList({ club, user }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: discussions, isLoading } = useQuery({
    queryKey: ["org-discussions", club.id],
    queryFn: () => base44.entities.ClubDiscussion.filter({ club_id: club.id }, "-created_date", 50),
  });

  const sorted = [...(discussions || [])].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleLike = async (d) => {
    const liked = (d.liked_by || []).includes(user.id);
    const liked_by = liked
      ? (d.liked_by || []).filter((id) => id !== user.id)
      : [...(d.liked_by || []), user.id];
    await base44.entities.ClubDiscussion.update(d.id, { liked_by });
    qc.invalidateQueries({ queryKey: ["org-discussions", club.id] });
  };

  const handleReply = async (d, body) => {
    const reply = { user_id: user.id, name: user.full_name, image: user.avatar_url || "", body, created_at: new Date().toISOString() };
    await base44.entities.ClubDiscussion.update(d.id, { replies: [...(d.replies || []), reply] });
    qc.invalidateQueries({ queryKey: ["org-discussions", club.id] });
    toast({ title: "Reply posted" });
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-[16px] shimmer" />)}</div>;
  if (sorted.length === 0) return <EmptyState icon={MessageSquare} title="No discussions yet" description="Start the conversation — share an idea, ask a question, or post an update." />;

  return sorted.map((d) => <DiscussionCard key={d.id} discussion={d} user={user} onLike={() => handleLike(d)} onReply={(body) => handleReply(d, body)} />);
}

function DiscussionCard({ discussion, user, onLike, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const cat = DISCUSSION_CATEGORIES[discussion.category] || DISCUSSION_CATEGORIES.general;
  const liked = (discussion.liked_by || []).includes(user?.id);
  const replies = discussion.replies || [];

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
          {(discussion.author_name || "?")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground">{discussion.author_name}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo(discussion.created_date)}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cat.color} bg-muted`}>{cat.label}</span>
        {discussion.pinned && <Pin className="w-3 h-3 text-primary" />}
      </div>

      <p className="text-[14px] font-bold text-foreground mb-1">{discussion.title}</p>
      <p className="text-[13px] text-foreground/80 leading-relaxed">{discussion.body}</p>

      {replies.length > 0 && (
        <div className="mt-3 space-y-2 pl-3 border-l-2 border-border">
          {replies.map((r, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                {(r.name || "?")[0]}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">{r.name} <span className="text-[10px] text-muted-foreground font-normal">{timeAgo(r.created_at)}</span></p>
                <p className="text-[12px] text-foreground/80">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <button onClick={onLike} className="flex items-center gap-1 spring-tap">
          <Heart className={`w-4 h-4 ${liked ? "text-error fill-error" : "text-muted-foreground"}`} />
          <span className="text-[11px] text-muted-foreground">{(discussion.liked_by || []).length}</span>
        </button>
        <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1 spring-tap" disabled={discussion.locked}>
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">{replies.length}</span>
        </button>
        {discussion.locked && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
      </div>

      {showReply && !discussion.locked && (
        <div className="flex gap-2 mt-3">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 px-3 py-2 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={() => { if (replyText.trim()) { onReply(replyText.trim()); setReplyText(""); setShowReply(false); } }}
            className="w-9 h-9 rounded-[12px] bg-primary text-primary-foreground flex items-center justify-center spring-tap"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Composer({ club, user, onClose, officer }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    await base44.entities.ClubDiscussion.create({
      club_id: club.id,
      club_name: club.name,
      title: title.trim(),
      body: body.trim(),
      author_name: user.full_name,
      author_id: user.id,
      author_image: user.avatar_url || "",
      category,
      replies: [],
      liked_by: [],
      institution_id: club.institution_id,
    });
    if (category === "announcement") {
      await base44.entities.Notification.create({
        title: `${club.name}: ${title.trim()}`,
        message: body.trim().slice(0, 200),
        type: "social",
        category: "social",
        source: `club:${club.id}`,
        link: `/organization/${club.id}`,
        priority: "normal",
      });
    }
    qc.invalidateQueries({ queryKey: ["org-discussions", club.id] });
    toast({ title: "Posted!" });
    onClose();
  };

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discussion title..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[14px] font-semibold focus:outline-none focus:border-primary/40" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts..." rows={3} className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[13px] focus:outline-none focus:border-primary/40 resize-none" />
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(DISCUSSION_CATEGORIES).filter(([k]) => officer || k !== "announcement").map(([k, v]) => (
          <button key={k} onClick={() => setCategory(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${category === k ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{v.label}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Post</button>
      </div>
    </div>
  );
}