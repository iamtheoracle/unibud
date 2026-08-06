import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Bookmark, Link2, Share2, Flag, Trash2,
  Edit3, FileText, History, RotateCcw, Sparkles, Loader2, Send, MessageSquare,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { FILE_TYPE_CONFIG, formatSize, formatDate } from "./ResourceRow";

const BUD_ACTIONS = [
  { id: "summarize", label: "Summarize", icon: FileText },
  { id: "flashcards", label: "Flashcards", icon: Sparkles },
  { id: "quiz", label: "Quiz", icon: Sparkles },
  { id: "notes", label: "Rev. Notes", icon: FileText },
];

export default function ResourceDetailSheet({ resource, groupId, user, onClose, onUpdate, onDelete }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(resource.title);
  const [editDesc, setEditDesc] = useState(resource.description || "");
  const [editFolder, setEditFolder] = useState(resource.folder || "");
  const [editTags, setEditTags] = useState((resource.tags || []).join(", "));
  const [budMode, setBudMode] = useState(null);
  const [budResponse, setBudResponse] = useState("");
  const [budLoading, setBudLoading] = useState(false);
  const [budQuestion, setBudQuestion] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const config = FILE_TYPE_CONFIG[resource.file_type] || FILE_TYPE_CONFIG.pdf;
  const Icon = config.icon;
  const url = resource.file_url || resource.external_url;
  const isOwner = resource.uploaded_by_id === user?.id || resource.created_by_id === user?.id;
  const isBookmarked = resource.bookmarked_by?.includes(user?.id);

  const handleSaveEdit = async () => {
    try {
      const updates = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        folder: editFolder.trim() || undefined,
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
        last_modified: new Date().toISOString(),
      };
      await base44.entities.StudyGroupResource.update(resource.id, updates);
      onUpdate({ ...resource, ...updates });
      setEditing(false);
      toast({ title: "Resource updated" });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    try {
      await base44.entities.StudyGroupResource.update(resource.id, {
        download_count: (resource.download_count || 0) + 1,
      });
      window.open(url, "_blank");
      onUpdate({ ...resource, download_count: (resource.download_count || 0) + 1 });
    } catch {
      window.open(url, "_blank");
    }
  };

  const copyLink = () => {
    if (url) {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied" });
    }
  };

  const handleBookmark = async () => {
    const list = resource.bookmarked_by || [];
    const next = list.includes(user?.id) ? list.filter((id) => id !== user?.id) : [...list, user?.id];
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { bookmarked_by: next });
      onUpdate({ ...resource, bookmarked_by: next });
    } catch {}
  };

  const handleReport = async () => {
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { is_reported: true });
      toast({ title: "Reported to group admin" });
      onClose();
    } catch {
      toast({ title: "Couldn't report", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.StudyGroupResource.delete(resource.id);
      toast({ title: "Resource deleted" });
      onDelete(resource.id);
    } catch {
      toast({ title: "Couldn't delete", variant: "destructive" });
    }
  };

  const handleBudAction = async (action) => {
    setBudMode(action);
    setBudLoading(true);
    setBudResponse("");
    try {
      const prompts = {
        summarize: `Summarize this study resource titled "${resource.title}"${resource.description ? ` about: ${resource.description}` : ""}. Provide a clear, concise summary of key points.`,
        flashcards: `Generate 5 flashcards from this study resource: "${resource.title}"${resource.description ? ` — ${resource.description}` : ""}. Format as Q: / A: pairs.`,
        quiz: `Create a 5-question quiz from this study resource: "${resource.title}"${resource.description ? ` — ${resource.description}` : ""}. Include multiple choice with answers.`,
        notes: `Create structured revision notes from this study resource: "${resource.title}"${resource.description ? ` — ${resource.description}` : ""}. Organize by key topics.`,
      };
      const res = await base44.integrations.Core.InvokeLLM({ prompt: prompts[action] });
      setBudResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch {
      setBudResponse("Bud couldn't process this resource right now. Please try again.");
    } finally {
      setBudLoading(false);
    }
  };

  const handleBudQuestion = async () => {
    if (!budQuestion.trim() || budLoading) return;
    const q = budQuestion.trim();
    setBudLoading(true);
    setBudResponse("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A student is asking about a study resource titled "${resource.title}"${resource.description ? ` about: ${resource.description}` : ""}. Question: ${q}\n\nProvide a helpful, accurate answer.`,
      });
      setBudResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch {
      setBudResponse("Bud couldn't answer right now. Please try again.");
    } finally {
      setBudLoading(false);
    }
    setBudQuestion("");
  };

  const loadComments = async () => {
    try {
      const res = await base44.entities.QuadComment.filter({ collection_id: groupId, item_id: resource.id }, "created_date", 50);
      setComments(res || []);
    } catch { setComments([]); }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const created = await base44.entities.QuadComment.create({
        collection_id: groupId, item_id: resource.id, content: newComment.trim(),
        author_name: user?.full_name || "Member", discussion_type: "insight",
      });
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch {
      toast({ title: "Couldn't post", variant: "destructive" });
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="fixed bottom-0 inset-x-0 z-[100] glass-strong rounded-t-[28px] max-h-[85vh] overflow-y-auto no-scrollbar adaptive-safe-bottom"
        role="dialog" aria-modal="true"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-4" />
        <div className="flex items-center justify-between px-5 mb-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Resource Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${resource.is_pinned ? "bg-primary/10" : "bg-muted/40"}`}>
              <Icon className={`w-5 h-5 ${resource.is_pinned ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
            </div>
            {editing ? (
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 px-3 py-2 rounded-[10px] bg-muted/40 text-[14px] text-foreground outline-none" />
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-foreground">{resource.title}</p>
                <p className="text-[11px] text-muted-foreground">{config.label} · {resource.uploaded_by_name} · {formatDate(resource.created_date)}</p>
              </div>
            )}
          </div>

          {/* Metadata grid */}
          {!editing && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <MetaCell label="Size" value={formatSize(resource.file_size_bytes) || "—"} />
              <MetaCell label="Downloads" value={resource.download_count || 0} />
              <MetaCell label="Views" value={resource.view_count || 0} />
              <MetaCell label="Version" value={`v${resource.version || 1}`} />
              <MetaCell label="Modified" value={formatDate(resource.last_modified || resource.updated_date)} />
              <MetaCell label="Access" value={resource.access_level === "editable" ? "Editable" : "Read-only"} />
            </div>
          )}

          {/* Description + tags editing */}
          {editing && (
            <div className="space-y-2">
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description..." rows={2} className="w-full px-3 py-2 rounded-[10px] bg-muted/40 text-[12px] text-foreground outline-none resize-none" />
              <input value={editFolder} onChange={(e) => setEditFolder(e.target.value)} placeholder="Folder name..." className="w-full px-3 py-2 rounded-[10px] bg-muted/40 text-[12px] text-foreground outline-none" />
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma separated)..." className="w-full px-3 py-2 rounded-[10px] bg-muted/40 text-[12px] text-foreground outline-none" />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="flex-1 py-2 rounded-[10px] bg-foreground text-background text-[12px] font-bold">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-[10px] bg-muted/40 text-[12px] font-medium">Cancel</button>
              </div>
            </div>
          )}

          {/* Tags display */}
          {!editing && resource.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/30 text-[10px] font-medium text-muted-foreground">#{tag}</span>)}
            </div>
          )}

          {/* Actions grid */}
          {!editing && (
            <div className="grid grid-cols-4 gap-2">
              <ActionBtn icon={Download} label="Open" onClick={handleDownload} />
              <ActionBtn icon={Bookmark} label="Save" active={isBookmarked} onClick={handleBookmark} />
              <ActionBtn icon={Link2} label="Copy" onClick={copyLink} />
              <ActionBtn icon={Share2} label="Share" onClick={() => { navigator.share?.({ title: resource.title, url: window.location.href }) || copyLink(); }} />
              {isOwner && <ActionBtn icon={Edit3} label="Edit" onClick={() => setEditing(true)} />}
              {isOwner && <ActionBtn icon={History} label="Versions" onClick={() => setShowVersions(!showVersions)} />}
              <ActionBtn icon={MessageSquare} label="Comments" onClick={() => { setShowComments(!showComments); if (!showComments) loadComments(); }} />
              <ActionBtn icon={Flag} label="Report" onClick={handleReport} />
              {isOwner && <ActionBtn icon={Trash2} label="Delete" danger onClick={handleDelete} />}
            </div>
          )}

          {/* Version history */}
          <AnimatePresence>
            {showVersions && resource.previous_versions?.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Version History</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded-[10px] bg-primary/5">
                    <span className="text-[11px] font-bold text-primary">v{resource.version}</span>
                    <span className="text-[10px] text-muted-foreground">Current · {formatDate(resource.last_modified)}</span>
                  </div>
                  {resource.previous_versions.map((v) => (
                    <div key={v.version} className="flex items-center gap-2 p-2 rounded-[10px] bg-muted/20">
                      <span className="text-[11px] font-medium text-muted-foreground">v{v.version}</span>
                      <span className="text-[10px] text-muted-foreground flex-1">{formatDate(v.updated_at)}</span>
                      <button onClick={() => { navigator.open?.(v.file_url) || window.open(v.file_url, "_blank"); }} className="flex items-center gap-1 text-[10px] text-primary font-medium">
                        <RotateCcw className="w-3 h-3" /> View
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Discussion</p>
                <div className="space-y-2 mb-2">
                  {comments.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-2">No comments yet</p>}
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-bold text-muted-foreground">{(c.author_name || "?").charAt(0).toUpperCase()}</span></div>
                      <div><p className="text-[10px] font-semibold text-foreground">{c.author_name}</p><p className="text-[11px] text-muted-foreground leading-snug">{c.content}</p></div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendComment()} placeholder="Add a comment..." className="flex-1 px-3 py-1.5 rounded-full bg-muted/40 text-[11px] text-foreground outline-none" />
                  <button onClick={sendComment} className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center"><Send className="w-3 h-3" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bud assistant */}
          <div className="rounded-[16px] glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-chocolate/20 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-primary" /></div>
              <p className="text-[12px] font-bold text-foreground">Bud Assistant</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {BUD_ACTIONS.map((a) => (
                <button key={a.id} onClick={() => handleBudAction(a.id)} className={`px-2.5 py-1.5 rounded-full text-[10px] font-medium spring-tap ${budMode === a.id ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}>{a.label}</button>
              ))}
            </div>
            <AnimatePresence>
              {budLoading && <div className="flex items-center gap-2 py-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /><span className="text-[11px] text-muted-foreground">Bud is working...</span></div>}
              {budResponse && !budLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-foreground leading-relaxed bg-muted/20 rounded-[10px] p-2.5 max-h-[180px] overflow-y-auto no-scrollbar whitespace-pre-wrap">{budResponse}</motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 mt-2">
              <input value={budQuestion} onChange={(e) => setBudQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBudQuestion()} placeholder="Ask Bud about this resource..." className="flex-1 px-3 py-1.5 rounded-full bg-muted/30 text-[11px] text-foreground outline-none" />
              <button onClick={handleBudQuestion} disabled={budLoading} className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-50"><Send className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function MetaCell({ label, value }) {
  return (
    <div className="rounded-[10px] bg-muted/20 p-2 text-center">
      <p className="text-[14px] font-bold text-foreground leading-none">{value}</p>
      <p className="text-[8px] text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, active, danger }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-[12px] spring-tap ${active ? "bg-primary/10" : "bg-muted/20"} ${danger ? "text-destructive" : ""}`}>
      <Icon className={`w-4 h-4 ${active ? "text-primary" : danger ? "text-destructive" : "text-muted-foreground"}`} strokeWidth={1.6} />
      <span className={`text-[9px] font-medium ${danger ? "text-destructive" : "text-muted-foreground"}`}>{label}</span>
    </button>
  );
}