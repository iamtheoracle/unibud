import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Clock, Bookmark, Filter } from "lucide-react";

const FILE_TYPES = [
  { id: "pdf", label: "PDF" },
  { id: "lecture_slides", label: "Slides" },
  { id: "notes", label: "Notes" },
  { id: "past_questions", label: "Past Questions" },
  { id: "assignment", label: "Assignments" },
  { id: "study_guide", label: "Study Guides" },
  { id: "project", label: "Projects" },
  { id: "research_paper", label: "Research" },
  { id: "link", label: "Links" },
  { id: "video", label: "Videos" },
  { id: "audio_recording", label: "Audio" },
  { id: "code", label: "Code" },
];

const STATUS_OPTIONS = [
  { id: "active", label: "Active" },
  { id: "pinned", label: "Pinned" },
  { id: "bookmarked", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

const SIZE_RANGES = [
  { id: "any", label: "Any size" },
  { id: "small", label: "< 1 MB" },
  { id: "medium", label: "1–10 MB" },
  { id: "large", label: "> 10 MB" },
];

const DATE_RANGES = [
  { id: "any", label: "Any time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export default function ResourceAdvancedFilters({ resources, filters, onFiltersChange, onClear, onSaveSearch }) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [searchName, setSearchName] = useState("");

  const options = useMemo(() => {
    const courses = [...new Set(resources.map((r) => r.course_code).filter(Boolean))].sort();
    const folders = [...new Set(resources.map((r) => r.folder).filter(Boolean))].sort();
    const creators = [...new Set(resources.map((r) => r.uploaded_by_name).filter(Boolean))].sort();
    const subjects = [...new Set(resources.map((r) => r.subject).filter(Boolean))].sort();
    const allTags = [...new Set(resources.flatMap((r) => r.tags || []).filter(Boolean))].sort();
    return { courses, folders, creators, subjects, allTags };
  }, [resources]);

  const toggleFileType = (type) => {
    const current = filters.fileTypes || [];
    onFiltersChange({
      ...filters,
      fileTypes: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    });
  };

  const toggleTag = (tag) => {
    const current = filters.tags || [];
    onFiltersChange({
      ...filters,
      tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    });
  };

  const hasActiveFilters = (filters.fileTypes?.length || 0) + (filters.tags?.length || 0) +
    (filters.course ? 1 : 0) + (filters.folder ? 1 : 0) + (filters.creator ? 1 : 0) +
    (filters.subject ? 1 : 0) + (filters.status !== "active" ? 1 : 0) +
    (filters.dateRange !== "any" ? 1 : 0) + (filters.sizeRange !== "any" ? 1 : 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="glass-card p-3.5 space-y-3">
        {/* File types */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">File Type</p>
          <div className="flex flex-wrap gap-1">
            {FILE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleFileType(t.id)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium spring-tap ${(filters.fileTypes || []).includes(t.id) ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect label="Course" value={filters.course || ""} options={options.courses} onChange={(v) => onFiltersChange({ ...filters, course: v })} />
          <FilterSelect label="Folder" value={filters.folder || ""} options={options.folders} onChange={(v) => onFiltersChange({ ...filters, folder: v })} />
          <FilterSelect label="Creator" value={filters.creator || ""} options={options.creators} onChange={(v) => onFiltersChange({ ...filters, creator: v })} />
          <FilterSelect label="Subject" value={filters.subject || ""} options={options.subjects} onChange={(v) => onFiltersChange({ ...filters, subject: v })} />
          <FilterSelect label="Upload Date" value={filters.dateRange || "any"} options={DATE_RANGES.map((d) => d.id)} optionLabels={DATE_RANGES.map((d) => d.label)} onChange={(v) => onFiltersChange({ ...filters, dateRange: v })} />
          <FilterSelect label="File Size" value={filters.sizeRange || "any"} options={SIZE_RANGES.map((s) => s.id)} optionLabels={SIZE_RANGES.map((s) => s.label)} onChange={(v) => onFiltersChange({ ...filters, sizeRange: v })} />
        </div>

        {/* Status */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Status</p>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => onFiltersChange({ ...filters, status: s.id })}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium spring-tap ${filters.status === s.id ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {options.allTags.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Tags</p>
            <div className="flex flex-wrap gap-1">
              {options.allTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-medium spring-tap ${(filters.tags || []).includes(tag) ? "bg-chocolate text-white" : "bg-muted/40 text-muted-foreground"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {hasActiveFilters && (
            <button onClick={onClear} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] bg-muted/40 text-muted-foreground text-[10px] font-semibold spring-tap">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
          <button onClick={() => setShowSaveInput(!showSaveInput)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[10px] font-semibold spring-tap">
            <Bookmark className="w-3 h-3" /> Save Search
          </button>
        </div>

        <AnimatePresence>
          {showSaveInput && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex gap-1.5">
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search name..."
                  className="flex-1 px-2.5 py-1.5 rounded-[10px] bg-muted/40 text-[11px] outline-none"
                />
                <button
                  onClick={() => { if (searchName.trim()) { onSaveSearch(searchName.trim()); setSearchName(""); setShowSaveInput(false); } }}
                  className="px-3 py-1.5 rounded-[10px] bg-primary text-primary-foreground text-[10px] font-semibold spring-tap"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FilterSelect({ label, value, options, optionLabels, onChange }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 rounded-[10px] bg-muted/40 text-[10px] text-foreground outline-none border border-border/20"
      >
        <option value="">All</option>
        {options.map((opt, i) => (
          <option key={opt} value={opt}>{optionLabels ? optionLabels[i] : opt}</option>
        ))}
      </select>
    </div>
  );
}