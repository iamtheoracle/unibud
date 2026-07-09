import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Sparkles, BookOpen, FileQuestion, NotebookPen, Clock, ChevronRight, Bookmark, FolderOpen, Plus, History, Quote } from "lucide-react";
import ResourceCard from "@/components/library/ResourceCard";

const CATEGORIES = [
  { key: "book", label: "Books", icon: BookOpen },
  { key: "past_question", label: "Past Questions", icon: FileQuestion },
  { key: "lecture_note", label: "Lecture Notes", icon: NotebookPen },
  { key: "paper", label: "Research Papers", icon: NotebookPen },
];

export default function Library() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: resources } = useQuery({ queryKey: ["libraryResources"], queryFn: () => base44.entities.LibraryResource.list("-created_date", 50) });
  const { data: collections } = useQuery({ queryKey: ["collections"], queryFn: () => base44.entities.Collection.list() });

  const filtered = resources?.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.author?.toLowerCase().includes(search.toLowerCase()) || r.course_code?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const continueReading = filtered.filter(r => r.reading_progress > 0);
  const downloaded = filtered.filter(r => r.is_downloaded);
  const recent = filtered.slice(0, 6);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiSearch(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A university student is searching for: "${aiQuery}". From the following library resources, return the titles that best match semantically. Resources: ${JSON.stringify(resources?.map(r => r.title) || [])}. Return a JSON array of matching titles.`,
        response_json_schema: { type: "object", properties: { matches: { type: "array", items: { type: "string" } } } },
      });
      const matches = res?.matches || [];
      setAiResults(matches.length > 0 ? filtered.filter(r => matches.includes(r.title)) : []);
    } catch {
      setAiResults([]);
    }
    setAiLoading(false);
  };

  const openResource = (r) => navigate(`/library/read/${r.id}`, { state: { resource: r } });

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between pt-12 pb-2 px-5"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Library</h1>
          <p className="text-[12px] text-muted-foreground">Books, papers & resources</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow"><BookOpen className="w-5 h-5 text-primary-foreground" /></div>
      </motion.div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, journals, papers..." className="w-full pl-10 pr-4 h-[44px] rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <button onClick={() => setAiSearch(false)} className={`flex-1 h-[44px] rounded-[16px] font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors spring-tap ${!aiSearch ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            <Search className="w-4 h-4" /> Search
          </button>
          <button onClick={() => setAiSearch(true)} className={`flex-1 h-[44px] rounded-[16px] font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors spring-tap ${aiSearch ? "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(212,175,55,0.3)]" : "bg-card border border-border/40 text-muted-foreground"}`}>
            <Sparkles className="w-4 h-4" /> AI Search
          </button>
        </div>
      </div>

      {aiSearch && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-3 overflow-hidden">
          <div className="bg-card rounded-[20px] p-3.5 soft-shadow border border-primary/20">
            <div className="flex gap-2">
              <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiSearch()} placeholder="Describe what you're looking for..." className="flex-1 px-3.5 h-[40px] rounded-[14px] bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={handleAiSearch} disabled={aiLoading} className="px-3.5 h-[40px] rounded-[14px] bg-primary text-primary-foreground font-semibold text-[12px] disabled:opacity-50 spring-tap">{aiLoading ? "..." : "Find"}</button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /> Bud searches semantically — describe a concept, not just keywords.</p>
          </div>
        </motion.div>
      )}

      {aiResults && (
        <div className="px-4 pb-3">
          <p className="text-[12px] font-semibold text-muted-foreground mb-2">{aiLoading ? "Bud is searching..." : `${aiResults.length} semantic matches`}</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">{aiResults.map(r => <ResourceCard key={r.id} resource={r} onClick={() => openResource(r)} />)}</div>
        </div>
      )}

      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => { const Icon = cat.icon; return (
          <button key={cat.key} className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border/40 text-[11px] font-semibold text-muted-foreground hover:text-foreground spring-tap">
            <Icon className="w-3.5 h-3.5" /> {cat.label}
          </button>
        ); })}
      </div>

      <div className="px-4 space-y-6 pb-8 pt-1">
        {continueReading.length > 0 && (
          <Section title="Continue Reading">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{continueReading.map(r => <ResourceCard key={r.id} resource={r} onClick={() => openResource(r)} />)}</div>
          </Section>
        )}

        {collections && collections.length > 0 && (
          <Section title="Collections & Course Folders">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {collections.map(c => (
                <motion.div key={c.id} whileTap={{ scale: 0.97 }} className="flex-shrink-0 w-[140px] bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 cursor-pointer card-hover">
                  <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center mb-2"><FolderOpen className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-heading font-semibold text-[12px] text-foreground leading-snug mb-0.5">{c.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{c.resource_ids?.length || 0} items</p>
                </motion.div>
              ))}
              <button className="flex-shrink-0 w-[140px] border-2 border-dashed border-border/40 rounded-[20px] flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors spring-tap">
                <Plus className="w-5 h-5" /><span className="text-[11px] font-semibold">New Collection</span>
              </button>
            </div>
          </Section>
        )}

        <Section title="Recommended for You">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">{recent.map(r => <ResourceCard key={r.id} resource={r} onClick={() => openResource(r)} />)}</div>
        </Section>

        {downloaded.length > 0 && (
          <Section title="Downloaded for Offline">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{downloaded.map(r => <ResourceCard key={r.id} resource={r} onClick={() => openResource(r)} />)}</div>
          </Section>
        )}

        <Section title="Reading History">
          <div className="space-y-2">
            {recent.slice(0, 4).map(r => (
              <div key={r.id} onClick={() => openResource(r)} className="flex items-center gap-3.5 bg-card rounded-[20px] p-3 soft-shadow border border-border/40 cursor-pointer card-hover">
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center"><History className="w-[18px] h-[18px] text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-[12px] text-foreground truncate">{r.title}</p><p className="text-[10px] text-muted-foreground">{r.author}</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Citation Generator">
          <motion.div whileTap={{ scale: 0.98 }} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 flex items-center gap-3.5 cursor-pointer card-hover">
            <div className="w-11 h-11 rounded-[16px] bg-primary/10 flex items-center justify-center"><Quote className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><p className="font-heading font-semibold text-[13px] text-foreground">Generate Citations</p><p className="text-[11px] text-muted-foreground">APA, MLA, Chicago, Harvard</p></div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">{title}</h2>
      {children}
    </div>
  );
}