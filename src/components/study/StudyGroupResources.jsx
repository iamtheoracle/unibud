import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, SlidersHorizontal, ChevronDown, FolderOpen, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ResourceRow, { FILE_TYPE_CONFIG, formatDate } from "./ResourceRow";
import ResourceDetailSheet from "./ResourceDetailSheet";
import AddResourceSheet from "./AddResourceSheet";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "pinned", label: "Pinned" },
  { id: "notes", label: "Notes" },
  { id: "past_questions", label: "Past Questions" },
  { id: "lecture_slides", label: "Lecture Slides" },
  { id: "assignment", label: "Assignments" },
  { id: "project", label: "Projects" },
  { id: "study_guide", label: "Study Guides" },
  { id: "template", label: "Templates" },
  { id: "archived", label: "Archived" },
];

const SORTS = [
  { id: "recent", label: "Most Recent" },
  { id: "alphabetical", label: "A → Z" },
  { id: "downloads", label: "Most Downloaded" },
  { id: "views", label: "Most Viewed" },
  { id: "size", label: "File Size" },
];

export default function StudyGroupResources({ groupId, groupName }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.StudyGroupResource.filter(
        { study_group_id: groupId },
        "-is_pinned,-created_date",
        200
      );
      setResources(res || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.StudyGroupResource.subscribe((event) => {
      if (event.data?.study_group_id === groupId) {
        if (event.type === "delete") {
          setResources((prev) => prev.filter((r) => r.id !== event.data.id));
        } else {
          load();
        }
      }
    });
    return unsub;
  }, [groupId, load]);

  const filtered = useMemo(() => {
    let list = [...resources];
    if (activeCategory === "recent") list = list.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 12);
    else if (activeCategory === "pinned") list = list.filter((r) => r.is_pinned);
    else if (activeCategory === "archived") list = list.filter((r) => r.is_archived);
    else if (activeCategory !== "all") list = list.filter((r) => r.file_type === activeCategory);
    else list = list.filter((r) => !r.is_archived);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title?.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q)) ||
        r.course_code?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.uploaded_by_name?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "alphabetical": list.sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
      case "downloads": list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0)); break;
      case "views": list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)); break;
      case "size": list.sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0)); break;
      default: list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    const pinned = list.filter((r) => r.is_pinned);
    const rest = list.filter((r) => !r.is_pinned);
    return { pinned, rest: [...pinned, ...rest] };
  }, [resources, activeCategory, search, sortBy]);

  const togglePin = async (resource) => {
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { is_pinned: !resource.is_pinned });
      setResources((prev) => prev.map((r) => r.id === resource.id ? { ...r, is_pinned: !r.is_pinned } : r));
    } catch { toast({ title: "Couldn't update", variant: "destructive" }); }
  };

  const toggleBookmark = async (resource) => {
    const list = resource.bookmarked_by || [];
    const next = list.includes(user?.id) ? list.filter((id) => id !== user?.id) : [...list, user?.id];
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { bookmarked_by: next });
      setResources((prev) => prev.map((r) => r.id === resource.id ? { ...r, bookmarked_by: next } : r));
    } catch {}
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch { toast({ title: "Upload failed", variant: "destructive" }); return null; }
    finally { setUploading(false); }
  };

  const addResource = async (data) => {
    try {
      await base44.entities.StudyGroupResource.create({
        ...data,
        study_group_id: groupId,
        uploaded_by_name: user?.full_name || user?.email || "Member",
        uploaded_by_id: user?.id,
      });
      setShowAdd(false);
      toast({ title: "Resource shared" });
    } catch { toast({ title: "Couldn't share resource", variant: "destructive" }); }
  };

  const handleUpdate = (updated) => {
    setResources((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
    setSelected(updated);
  };

  const handleDelete = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[14px] bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  const list = filtered.rest || [];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-[14px] glass-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, course, tag..." className="flex-1 bg-transparent text-[12px] text-foreground outline-none" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`w-9 h-9 rounded-full flex items-center justify-center spring-tap ${showFilters ? "bg-foreground text-background" : "glass-card text-muted-foreground"}`}>
          <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        </button>
        <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center spring-tap" aria-label="Add resource">
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap shrink-0 ${activeCategory === cat.id ? "bg-foreground text-background" : "glass-card text-muted-foreground"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort selector */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-2 px-1 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sort</span>
              <div className="flex gap-1.5 flex-wrap">
                {SORTS.map((s) => (
                  <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium spring-tap ${sortBy === s.id ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}>{s.label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-[18px] glass-card flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-foreground mb-1">{search ? "No results" : "No resources yet"}</p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">{search ? "Try a different search term" : "Share notes, slides, past questions, or links with your study group."}</p>
        </div>
      )}

      {/* Pinned section label */}
      {filtered.pinned?.length > 0 && activeCategory === "all" && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Pinned</p>
      )}

      {/* Resource list */}
      {list.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {list.map((r) => (
              <ResourceRow key={r.id} resource={r} userId={user?.id} onOpen={setSelected} onPin={togglePin} onBookmark={toggleBookmark} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Sheets */}
      <AnimatePresence>
        {showAdd && <AddResourceSheet onClose={() => setShowAdd(false)} onAdd={addResource} onUpload={handleUpload} uploading={uploading} />}
      </AnimatePresence>
      <AnimatePresence>
        {selected && (
          <ResourceDetailSheet resource={selected} groupId={groupId} user={user} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}