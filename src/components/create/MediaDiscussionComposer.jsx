import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@/components/ui/image";
import {
  X, Search, ArrowLeft, Send, Loader2, ExternalLink,
  Check, Sparkles,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const MEDIA_CONFIG = {
  movie:    { label: "Movie",       accent: "0 77% 52%",   hint: "Search for a movie…" },
  music:    { label: "Music",       accent: "141 70% 48%", hint: "Search for a song or artist…" },
  tv_show:  { label: "TV Series",   accent: "270 75% 60%", hint: "Search for a TV series…" },
  sports:   { label: "Sports",      accent: "142 71% 45%", hint: "Search for a match, team, or competition…" },
  news:     { label: "News",        accent: "210 40% 55%", hint: "Search for a news story…" },
  book:     { label: "Book",        accent: "38 92% 50%",  hint: "Search for a book…" },
  podcast:  { label: "Podcast",     accent: "340 75% 57%", hint: "Search for a podcast…" },
};

/**
 * MediaDiscussionComposer — the smart creation flow for media discussions.
 *
 * Flow:
 * 1. Search for real content via InvokeLLM web search (Zero Fake Content).
 * 2. Select a result to attach as the official reference.
 * 3. Write your thoughts.
 * 4. Optionally choose a destination community (Orbit's role).
 * 5. Publish as a QuadPost with link_preview.
 *
 * Bud does NOT participate unless explicitly tagged — this is a social
 * creation flow, so only Orbit assists with community organization.
 */
export default function MediaDiscussionComposer({ mediaType, user, onClose }) {
  const config = MEDIA_CONFIG[mediaType] || MEDIA_CONFIG.movie;
  const accent = config.accent;
  const qc = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState("search"); // search | compose
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [thoughts, setThoughts] = useState("");
  const [community, setCommunity] = useState("");
  const [publishing, setPublishing] = useState(false);
  const textareaRef = useRef(null);

  // Fetch student's communities for Orbit's destination suggestion
  const { data: communities } = useQuery({
    queryKey: ["my-communities-create"],
    queryFn: () => base44.entities.Community.list("-updated_date", 20),
  });
  const myCommunities = (communities || []).filter((c) =>
    (c.members || []).some((m) => m.user_id === user?.id)
  );

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for real ${config.label.toLowerCase()} matching: "${query.trim()}".
Return 5 real, verifiable results. For each result provide:
- title: The official title
- description: A brief 1-2 sentence description
- image_url: A real, publicly accessible image/poster/cover URL
- source_url: A link to the official source (e.g., IMDb, Spotify, ESPN, Google News, Goodreads, Apple Podcasts)
- source_name: The platform name

Only return content that actually exists. Never fabricate results.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  image_url: { type: "string" },
                  source_url: { type: "string" },
                  source_name: { type: "string" },
                },
              },
            },
          },
        },
      });
      setResults(res?.results || []);
    } catch {
      toast({ title: "Search failed", description: "Please try again.", variant: "destructive" });
    }
    setSearching(false);
  };

  const handleSelect = (result) => {
    setSelected(result);
    setStep("compose");
    setTimeout(() => textareaRef.current?.focus(), 300);
  };

  const handlePublish = async () => {
    if (!thoughts.trim() || !selected || !user) return;
    setPublishing(true);
    try {
      const content = thoughts.trim();
      const hashtags = (content.match(/#[\w]+/g) || []).map((t) => t.replace("#", ""));
      await base44.entities.QuadPost.create({
        content,
        author_name: user.full_name || "Student",
        author_image: user.avatar_url || user.image || "",
        author_role: "student",
        author_handle: user.department || user.university || "",
        is_verified: false,
        type: "discussion",
        link_preview: {
          url: selected.source_url || "",
          title: selected.title || "",
          description: selected.description || "",
          image_url: selected.image_url || "",
        },
        hashtags,
        university: user.university || "",
        visibility: "campus",
        community: community || "",
        reactions: {},
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_pinned: false,
        is_anonymous: false,
        draft_status: "published",
      });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
      toast({ title: "Published!", description: `Your ${config.label.toLowerCase()} discussion is live.` });
      onClose();
    } catch {
      toast({ title: "Couldn't publish", description: "Please try again.", variant: "destructive" });
    }
    setPublishing(false);
  };

  const canPublish = thoughts.trim().length > 0 && selected && !publishing;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[95] backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="fixed bottom-0 inset-x-0 z-[105] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-2">
          {step === "compose" && (
            <button
              onClick={() => { setStep("search"); setSelected(null); }}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1">
            <h3 className="font-heading font-bold text-[16px] text-foreground tracking-tight">
              {config.label} Discussion
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {step === "search" ? "Find what you want to discuss" : "Share your thoughts"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pb-8">
          {/* ── Step 1: Search ── */}
          {step === "search" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={config.hint}
                    className="w-full pl-10 pr-4 py-3 rounded-[16px] glass text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={query.trim().length < 2 || searching}
                  className="px-4 rounded-[16px] font-semibold text-[13px] spring-tap disabled:opacity-40 flex items-center gap-1.5"
                  style={{ background: `hsl(${accent})`, color: "hsl(0 0% 100%)" }}
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </div>

              {/* Results */}
              {searching && (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-[16px] glass-card">
                      <div className="w-14 h-14 rounded-[10px] shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 shimmer rounded-full" />
                        <div className="h-2 w-full shimmer rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-muted-foreground px-1">
                    {results.length} results found
                  </p>
                  {results.map((result, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, ease: EASE }}
                      onClick={() => handleSelect(result)}
                      className="w-full flex gap-3 p-3 rounded-[16px] glass-card hover-lift spring-tap edge-light text-left"
                    >
                      {result.image_url ? (
                        <Image
                          src={result.image_url}
                          alt=""
                          fittingType="fill"
                          className="w-14 h-14 rounded-[10px] shrink-0"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-[10px] shrink-0 grid place-items-center"
                          style={{ background: `hsl(${accent} / 0.08)` }}
                        >
                          <Sparkles className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-[13px] text-foreground truncate">
                          {result.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {result.description}
                        </p>
                        {result.source_name && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: `hsl(${accent} / 0.10)`, color: `hsl(${accent})` }}
                          >
                            {result.source_name}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-7 h-7 rounded-full grid place-items-center shrink-0 self-center"
                        style={{ background: `hsl(${accent} / 0.10)` }}
                      >
                        <Check className="w-3.5 h-3.5" style={{ color: `hsl(${accent})` }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {!searching && results.length === 0 && query.trim().length >= 2 && (
                <div className="text-center py-8">
                  <p className="text-[13px] text-muted-foreground">No results yet — tap Search.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Compose ── */}
          {step === "compose" && selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Attached reference card */}
              <div className="flex gap-3 p-3 rounded-[16px] glass-card edge-light">
                {selected.image_url ? (
                  <Image
                    src={selected.image_url}
                    alt=""
                    fittingType="fill"
                    className="w-16 h-16 rounded-[12px] shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-[12px] shrink-0 grid place-items-center"
                    style={{ background: `hsl(${accent} / 0.08)` }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: `hsl(${accent})` }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[13px] text-foreground">
                    {selected.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {selected.description}
                  </p>
                  {selected.source_url && (
                    <a
                      href={selected.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold spring-tap"
                      style={{ color: `hsl(${accent})` }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open on {selected.source_name || "Source"}
                    </a>
                  )}
                </div>
              </div>

              {/* Author row */}
              <div className="flex items-center gap-2.5">
                {user?.avatar_url || user?.image ? (
                  <img src={user.avatar_url || user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: `hsl(${accent})`, color: "hsl(0 0% 100%)" }}
                  >
                    {(user?.full_name || "U").charAt(0)}
                  </div>
                )}
                <span className="font-heading font-semibold text-[12px] text-foreground">
                  {user?.full_name || "Student"}
                </span>
              </div>

              {/* Thoughts */}
              <textarea
                ref={textareaRef}
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder={`Share your thoughts on ${selected.title}…`}
                rows={4}
                className="w-full bg-transparent text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none min-h-[100px]"
              />

              {/* Community selector — Orbit's role */}
              {myCommunities.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                    Destination community (optional)
                  </p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
                    <button
                      onClick={() => setCommunity("")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                        !community ? "bg-foreground text-background" : "glass text-muted-foreground"
                      }`}
                    >
                      Campus feed
                    </button>
                    {myCommunities.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCommunity(c.name)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                          community === c.name ? "bg-foreground text-background" : "glass text-muted-foreground"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                <button
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-[14px] font-semibold text-[13px] spring-tap disabled:opacity-40"
                  style={{ background: `hsl(${accent})`, color: "hsl(0 0% 100%)" }}
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2} />}
                  Publish
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}