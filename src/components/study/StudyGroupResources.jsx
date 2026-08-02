import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Pin, PinOff, FileText, Link2, FolderOpen, Plus, X,
  Lock, Unlock, Download, ExternalLink, MessageSquare, Send,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";

const FILE_TYPE_ICONS = {
  lecture_slides: FileText,
  pdf: FileText,
  past_questions: FileText,
  notes: FileText,
  study_guide: FileText,
  link: Link2,
  document: FileText,
  presentation: FileText,
  image: FileText,
  video: FileText,
  spreadsheet: FileText,
};

/**
 * StudyGroupResources — shared resource library for a study group.
 * Members can share notes, slides, PDFs, links, organize into folders,
 * pin important materials, comment, mention classmates, and search.
 *
 * Uses StudyGroupResource entity. Comments use QuadComment with
 * collection_id = study_group_id, item_id = resource_id.
 */
export default function StudyGroupResources({ groupId, groupName }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [commentingOn, setCommentingOn] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.StudyGroupResource.filter(
        { study_group_id: groupId },
        "-is_pinned,-created_date",
        100
      );
      setResources(res || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.StudyGroupResource.subscribe((event) => {
      if (event.data?.study_group_id === groupId) load();
    });
    return unsub;
  }, [groupId, load]);

  const folders = ["all", ...new Set(resources.map((r) => r.folder).filter(Boolean))];

  const filtered = resources.filter((r) => {
    const matchesSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFolder = activeFolder === "all" || r.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const pinned = filtered.filter((r) => r.is_pinned);
  const unpinned = filtered.filter((r) => !r.is_pinned);

  const togglePin = async (resource) => {
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { is_pinned: !resource.is_pinned });
      setResources((prev) => prev.map((r) => r.id === resource.id ? { ...r, is_pinned: !r.is_pinned } : r));
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addResource = async (data) => {
    try {
      await base44.entities.StudyGroupResource.create({
        ...data,
        study_group_id: groupId,
        uploaded_by_name: user?.full_name || user?.email || "Member",
      });
      setShowAdd(false);
      toast({ title: "Resource shared" });
    } catch {
      toast({ title: "Couldn't share resource", variant: "destructive" });
    }
  };

  const loadComments = async (resourceId) => {
    try {
      const res = await base44.entities.QuadComment.filter(
        { collection_id: groupId, item_id: resourceId },
        "created_date",
        50
      );
      setComments((prev) => ({ ...prev, [resourceId]: res || [] }));
    } catch {
      setComments((prev) => ({ ...prev, [resourceId]: [] }));
    }
  };

  const toggleComments = (resourceId) => {
    if (commentingOn === resourceId) {
      setCommentingOn(null);
    } else {
      setCommentingOn(resourceId);
      if (!comments[resourceId]) loadComments(resourceId);
    }
  };

  const sendComment = async (resourceId) => {
    if (!newComment.trim()) return;
    try {
      const created = await base44.entities.QuadComment.create({
        collection_id: groupId,
        item_id: resourceId,
        content: newComment.trim(),
        author_name: user?.full_name || user?.email || "Member",
        discussion_type: "insight",
      });
      setComments((prev) => ({ ...prev, [resourceId]: [...(prev[resourceId] || []), created] }));
      setNewComment("");
    } catch {
      toast({ title: "Couldn't post comment", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-[14px] bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Add */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-[14px] bg-muted/40">
          <Search className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 bg-transparent text-[12px] text-foreground outline-none"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Folder filter */}
      {folders.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap shrink-0 ${activeFolder === f ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground"}`}
            >
              {f !== "all" && <FolderOpen className="w-3 h-3" strokeWidth={1.6} />}
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-[18px] bg-muted/40 flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-foreground mb-1">No resources yet</p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">
            Share notes, slides, past questions, or links with your study group.
          </p>
        </div>
      )}

      {/* Pinned resources */}
      {pinned.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1 flex items-center gap-1">
            <Pin className="w-3 h-3" strokeWidth={1.6} /> Pinned
          </p>
          <div className="space-y-2">
            {pinned.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                onPin={togglePin}
                onToggleComments={toggleComments}
                commentingOn={commentingOn}
                comments={comments[r.id] || []}
                newComment={commentingOn === r.id ? newComment : ""}
                onCommentChange={setNewComment}
                onSendComment={() => sendComment(r.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All resources */}
      {unpinned.length > 0 && (
        <div className="space-y-2">
          {pinned.length > 0 && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">All Resources</p>
          )}
          {unpinned.map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              onPin={togglePin}
              onToggleComments={toggleComments}
              commentingOn={commentingOn}
              comments={comments[r.id] || []}
              newComment={commentingOn === r.id ? newComment : ""}
              onCommentChange={setNewComment}
              onSendComment={() => sendComment(r.id)}
            />
          ))}
        </div>
      )}

      {/* Add resource sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddResourceSheet
            onClose={() => setShowAdd(false)}
            onAdd={addResource}
            onUpload={handleUpload}
            uploading={uploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceRow({ resource, onPin, onToggleComments, commentingOn, comments, newComment, onCommentChange, onSendComment }) {
  const Icon = FILE_TYPE_ICONS[resource.file_type] || FileText;
  const url = resource.file_url || resource.external_url;

  return (
    <div className="rounded-[14px] bg-card p-3" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${resource.is_pinned ? "bg-primary/8" : "bg-muted/50"}`}>
          <Icon className="w-4 h-4 text-foreground" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground truncate">{resource.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{resource.uploaded_by_name}</span>
            {resource.folder && <span>· {resource.folder}</span>}
            {resource.access_level === "editable" ? (
              <Unlock className="w-2.5 h-2.5" strokeWidth={1.5} />
            ) : (
              <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onToggleComments(resource.id)} className="w-7 h-7 rounded-full hover:bg-muted/30 flex items-center justify-center active:scale-90 transition-transform" aria-label="Comments">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
          </button>
          <button onClick={() => onPin(resource)} className="w-7 h-7 rounded-full hover:bg-muted/30 flex items-center justify-center active:scale-90 transition-transform" aria-label="Pin">
            {resource.is_pinned ? <PinOff className="w-3.5 h-3.5 text-primary" strokeWidth={1.6} /> : <Pin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />}
          </button>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full hover:bg-muted/30 flex items-center justify-center active:scale-90 transition-transform" aria-label="Open">
              {resource.external_url ? <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} /> : <Download className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />}
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {resource.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/40 text-[9px] font-medium text-muted-foreground">#{tag}</span>
          ))}
        </div>
      )}

      {/* Comments */}
      <AnimatePresence>
        {commentingOn === resource.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2.5 mt-2 border-t border-border/30 space-y-2">
              {comments.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-1">No comments yet</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-muted-foreground">{(c.author_name || "?").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground">{c.author_name}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{c.content}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSendComment(); }}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-1.5 rounded-full bg-muted/40 text-[11px] text-foreground outline-none"
                />
                <button onClick={onSendComment} className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center active:scale-90 transition-transform">
                  <Send className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddResourceSheet({ onClose, onAdd, onUpload, uploading }) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [folder, setFolder] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let file_url = null;
    if (file) {
      file_url = await onUpload(file);
      if (!file_url) return;
    }
    onAdd({
      title: title.trim(),
      file_type: fileType,
      folder: folder.trim() || undefined,
      file_url: file_url || undefined,
      external_url: fileType === "link" ? externalUrl.trim() || undefined : undefined,
      access_level: "read_only",
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="fixed bottom-0 inset-x-0 z-[100] bg-card rounded-t-[28px] border-t border-border/30 p-5 pb-8"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Share Resource</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title (e.g. Week 5 Lecture Slides)"
            className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none"
          />

          <div className="flex flex-wrap gap-1.5">
            {["lecture_slides", "pdf", "past_questions", "notes", "study_guide", "link"].map((t) => (
              <button
                key={t}
                onClick={() => setFileType(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap ${fileType === t ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground"}`}
              >
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder (optional, e.g. Midterm Prep)"
            className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none"
          />

          {fileType === "link" ? (
            <input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none"
            />
          ) : (
            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-[14px] border border-dashed border-border cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <span className="text-[12px] font-medium text-foreground">{file.name}</span>
              ) : (
                <span className="text-[12px] text-muted-foreground">Tap to upload a file</span>
              )}
            </label>
          )}

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || uploading}
            className="w-full py-3 rounded-[14px] bg-foreground text-background text-[13px] font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Share with group"}
          </button>
        </div>
      </motion.div>
    </>
  );
}