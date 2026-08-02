import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, SlidersHorizontal, ChevronDown, FolderOpen, Sparkles, X, Clock, Bookmark } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ResourceRow, { FILE_TYPE_CONFIG, formatDate } from "./ResourceRow";
import ResourceDetailSheet from "./ResourceDetailSheet";
import AddResourceSheet from "./AddResourceSheet";
import ResourceTemplateSheet from "./ResourceTemplateSheet";
import ResourceShareSheet from "./ResourceShareSheet";
import ResourceAdvancedFilters from "./ResourceAdvancedFilters";

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
  { id: "custom", label: "Custom Order" },
  { id: "recent", label: "Most Recent" },
  { id: "oldest", label: "Oldest" },
  { id: "alphabetical", label: "A → Z" },
  { id: "downloads", label: "Most Downloaded" },
  { id: "views", label: "Most Viewed" },
  { id: "size", label: "File Size" },
  { id: "relevance", label: "Relevance" },
];

export default function StudyGroupResources({ groupId, groupName }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("custom");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareResource, setShareResource] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({ fileTypes: [], tags: [], status: "active", dateRange: "any", sizeRange: "any" });
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`resourceSearches_${groupId}`) || "[]"); } catch { return []; }
  });
  const [savedSearches, setSavedSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`resourceSavedSearches_${groupId}`) || "[]"); } catch { return []; }
  });

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
        r.uploaded_by_name?.toLowerCase().includes(q) ||
        r.folder?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }

    // Advanced filters
    if (advancedFilters.fileTypes?.length > 0) {
      list = list.filter((r) => advancedFilters.fileTypes.includes(r.file_type));
    }
    if (advancedFilters.course) list = list.filter((r) => r.course_code === advancedFilters.course);
    if (advancedFilters.folder) list = list.filter((r) => r.folder === advancedFilters.folder);
    if (advancedFilters.creator) list = list.filter((r) => r.uploaded_by_name === advancedFilters.creator);
    if (advancedFilters.subject) list = list.filter((r) => r.subject === advancedFilters.subject);
    if (advancedFilters.tags?.length > 0) {
      list = list.filter((r) => advancedFilters.tags.some((t) => r.tags?.includes(t)));
    }
    if (advancedFilters.status === "pinned") list = list.filter((r) => r.is_pinned);
    else if (advancedFilters.status === "bookmarked") list = list.filter((r) => r.bookmarked_by?.includes(user?.id));
    else if (advancedFilters.status === "archived") list = list.filter((r) => r.is_archived);
    if (advancedFilters.dateRange !== "any") {
      const now = new Date();
      let cutoff;
      if (advancedFilters.dateRange === "today") cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (advancedFilters.dateRange === "week") cutoff = new Date(now.getTime() - 7 * 86400000);
      else if (advancedFilters.dateRange === "month") cutoff = new Date(now.getTime() - 30 * 86400000);
      if (cutoff) list = list.filter((r) => new Date(r.created_date) >= cutoff);
    }
    if (advancedFilters.sizeRange !== "any") {
      list = list.filter((r) => {
        const s = r.file_size_bytes || 0;
        if (advancedFilters.sizeRange === "small") return s > 0 && s < 1048576;
        if (advancedFilters.sizeRange === "medium") return s >= 1048576 && s < 10485760;
        if (advancedFilters.sizeRange === "large") return s >= 10485760;
        return true;
      });
    }

    switch (sortBy) {
      case "custom": list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)); break;
      case "oldest": list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case "alphabetical": list.sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
      case "downloads": list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0)); break;
      case "views": list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)); break;
      case "size": list.sort((a, b) => (b.file_size_bytes || 0) - (a.file_size_bytes || 0)); break;
      case "relevance": {
        if (!search) { list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break; }
        const q = search.toLowerCase();
        list.sort((a, b) => {
          let aScore = 0, bScore = 0;
          if (a.title?.toLowerCase().includes(q)) aScore += 3;
          if (a.tags?.some((t) => t.toLowerCase().includes(q))) aScore += 2;
          if (a.course_code?.toLowerCase().includes(q)) aScore += 1;
          if (a.uploaded_by_name?.toLowerCase().includes(q)) aScore += 1;
          if (b.title?.toLowerCase().includes(q)) bScore += 3;
          if (b.tags?.some((t) => t.toLowerCase().includes(q))) bScore += 2;
          if (b.course_code?.toLowerCase().includes(q)) bScore += 1;
          if (b.uploaded_by_name?.toLowerCase().includes(q)) bScore += 1;
          return bScore - aScore;
        });
        break;
      }
      default: list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    const pinned = list.filter((r) => r.is_pinned);
    const rest = list.filter((r) => !r.is_pinned);
    return { pinned, rest: [...pinned, ...rest] };
  }, [resources, activeCategory, search, sortBy, advancedFilters, user?.id]);

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

  const applyTemplate = async (template) => {
    try {
      const records = template.folders.map((f) => ({
        study_group_id: groupId,
        title: f.title,
        file_type: f.file_type,
        folder: f.folder,
        tags: f.tags || [],
        uploaded_by_name: user?.full_name || user?.email || "Member",
        uploaded_by_id: user?.id,
      }));
      await base44.entities.StudyGroupResource.bulkCreate(records);
      setShowTemplates(false);
      toast({ title: "Template applied", description: `${template.folders.length} folders created for ${template.name}` });
      load();
    } catch {
      toast({ title: "Could not apply template", variant: "destructive" });
    }
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

  const handleDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    if (sortBy !== "custom" || search) return;

    const items = Array.from(list);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updates = items.map((item, index) => ({ id: item.id, sort_order: index }));
    const orderMap = {};
    updates.forEach((u) => { orderMap[u.id] = u.sort_order; });
    setResources((prev) => prev.map((r) => orderMap[r.id] !== undefined ? { ...r, sort_order: orderMap[r.id] } : r));

    try {
      await base44.entities.StudyGroupResource.bulkUpdate(updates);
    } catch {
      toast({ title: "Could not save order", variant: "destructive" });
      load();
    }
  };

  const toggleOffline = async (resource) => {
    try {
      await base44.entities.StudyGroupResource.update(resource.id, { is_offline_available: !resource.is_offline_available });
      setResources((prev) => prev.map((r) => r.id === resource.id ? { ...r, is_offline_available: !r.is_offline_available } : r));
      toast({ title: resource.is_offline_available ? "Removed from offline" : "Available offline" });
    } catch {
      toast({ title: "Could not update", variant: "destructive" });
    }
  };

  const handleDownload = (resource) => {
    if (!resource.file_url) return;
    const a = document.createElement("a");
    a.href = resource.file_url;
    a.download = resource.title || "download";
    a.target = "_blank";
    a.click();
    base44.entities.StudyGroupResource.update(resource.id, { download_count: (resource.download_count || 0) + 1 }).catch(() => {});
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && search.trim()) { const next = [search.trim(), ...recentSearches.filter((s) => s !== search.trim())].slice(0, 5); setRecentSearches(next); localStorage.setItem(`resourceSearches_${groupId}`, JSON.stringify(next)); } }} placeholder="Search by name, course, tag, folder..." className="flex-1 bg-transparent text-[12px] text-foreground outline-none" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`w-9 h-9 rounded-full flex items-center justify-center spring-tap ${showFilters ? "bg-foreground text-background" : "glass-card text-muted-foreground"}`}>
          <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        </button>
        <button onClick={() => setShowTemplates(true)} className="w-9 h-9 rounded-full glass-card text-muted-foreground flex items-center justify-center spring-tap" aria-label="Library templates">
          <FolderOpen className="w-4 h-4" strokeWidth={2} />
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

      {/* Recent searches */}
      {!search && recentSearches.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {recentSearches.map((s) => (
            <button key={s} onClick={() => setSearch(s)} className="px-2.5 py-1 rounded-full bg-muted/30 text-[10px] font-medium text-muted-foreground shrink-0 spring-tap flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {s}
            </button>
          ))}
          <button onClick={() => { setRecentSearches([]); localStorage.removeItem(`resourceSearches_${groupId}`); }} className="px-2 py-1 rounded-full text-[10px] text-muted-foreground/50 shrink-0">Clear</button>
        </div>
      )}

      {/* Saved searches */}
      {!search && savedSearches.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {savedSearches.map((s) => (
            <button key={s.name} onClick={() => { setSearch(s.search); setAdvancedFilters(s.filters || {}); }} className="px-2.5 py-1 rounded-full bg-primary/10 text-[10px] font-medium text-primary shrink-0 spring-tap flex items-center gap-1">
              <Bookmark className="w-2.5 h-2.5" /> {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort + Advanced filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sort</span>
              <div className="flex gap-1.5 flex-wrap">
                {SORTS.map((s) => (
                  <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium spring-tap ${sortBy === s.id ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"}`}>{s.label}</button>
                ))}
              </div>
            </div>
            <ResourceAdvancedFilters
              resources={resources}
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              onClear={() => setAdvancedFilters({ fileTypes: [], tags: [], status: "active", dateRange: "any", sizeRange: "any" })}
              onSaveSearch={(name) => {
                const next = [{ name, search, filters: advancedFilters }, ...savedSearches].slice(0, 10);
                setSavedSearches(next);
                localStorage.setItem(`resourceSavedSearches_${groupId}`, JSON.stringify(next));
                toast({ title: "Search saved" });
              }}
            />
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="resources">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {list.map((r, index) => (
                  <Draggable key={r.id} draggableId={r.id} index={index} isDragDisabled={sortBy !== "custom" || !!search}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={prov.draggableProps.style}>
                        <ResourceRow resource={r} userId={user?.id} onOpen={setSelected} onPin={togglePin} onBookmark={toggleBookmark} onShare={setShareResource} onDownload={handleDownload} onToggleOffline={toggleOffline} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Sheets */}
      <AnimatePresence>
        {showAdd && <AddResourceSheet onClose={() => setShowAdd(false)} onAdd={addResource} onUpload={handleUpload} uploading={uploading} />}
      </AnimatePresence>
      <AnimatePresence>
        {showTemplates && <ResourceTemplateSheet onClose={() => setShowTemplates(false)} onApply={applyTemplate} groupName={groupName} />}
      </AnimatePresence>
      <AnimatePresence>
        {selected && (
          <ResourceDetailSheet resource={selected} groupId={groupId} user={user} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shareResource && (
          <ResourceShareSheet resource={shareResource} groupName={groupName} onClose={() => setShareResource(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}