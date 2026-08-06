import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, MapPin, GraduationCap, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { hapticTap } from "@/lib/haptics";
import { extractHashtags, extractMentions } from "@/components/quad/quadConstants";
import { AUDIENCE_CARDS } from "./audienceConstants";
import FilterStrip from "./FilterStrip";
import EditingControls from "./EditingControls";
import { buildCombinedCss, bakeFilterToImage } from "@/data/unibudFilters";

const ACADEMIC_FIELDS = [
  { id: "course", label: "Course", placeholder: "e.g., CSC 301" },
  { id: "faculty", label: "Faculty", placeholder: "e.g., Science" },
  { id: "department", label: "Department", placeholder: "e.g., Computer Science" },
  { id: "assignment", label: "Assignment", placeholder: "Assignment title" },
  { id: "project", label: "Project", placeholder: "Project name" },
  { id: "study_group", label: "Study Group", placeholder: "Group name" },
];

/**
 * SmartCreationPanel — bottom sheet that opens after capture.
 * Shows media preview, caption, audience cards, and adapts
 * fields for academic vs social context.
 */
export default function SmartCreationPanel({
  open, media, mode, user, uploadMedia, isUploading, onClose, onPublished, initialAudience,
}) {
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState(initialAudience || "campus");

  useEffect(() => {
    if (open && initialAudience) setAudience(initialAudience);
  }, [open, initialAudience]);
  const [context, setContext] = useState("social");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [music, setMusic] = useState("");
  const [academicData, setAcademicData] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("natural");
  const [filterIntensity, setFilterIntensity] = useState(1);
  const [adjustments, setAdjustments] = useState({ brightness: 1, contrast: 1, saturation: 1, warmth: 0, rotation: 0 });

  const filterCss = buildCombinedCss(selectedFilter, filterIntensity, adjustments);
  const rotation = adjustments.rotation || 0;

  const visibility = AUDIENCE_CARDS.find((a) => a.id === audience)?.visibility || "campus";

  const handlePublish = async () => {
    if (!media || publishing) return;
    setPublishing(true);
    hapticTap();
    try {
      let blobToUpload = media.blob;
      let mediaUrl = media.url;

      // Bake filter into images before upload
      if (media.type === "image" && (filterCss !== "none" || rotation !== 0)) {
        try {
          const bakedBlob = await bakeFilterToImage(media.url, filterCss, rotation);
          blobToUpload = bakedBlob;
        } catch {
          // Fall back to original if baking fails
          blobToUpload = media.blob;
        }
      }

      const result = await uploadMedia(blobToUpload, {
        compress: media.type === "image",
        generateThumb: media.type === "video",
      });

      const content = caption.trim();
      const hashtags = extractHashtags(content + " " + tags);
      const mentions = extractMentions(content);
      const authorName = user?.full_name || "Student";
      const authorImage = user?.avatar_url || "";
      const authorHandle = user?.department ? user.department + " · " + (user.level || "") : "";
      const uni = user?.university || "";

      if (mode === "story") {
        await base44.entities.Story.create({
          content, author_name: authorName, author_image: authorImage,
          author_role: "student", author_handle: authorHandle, is_verified: false,
          type: media.type === "video" ? "video" : "photo",
          media_url: result.mediaUrl, thumbnail_url: result.thumbnailUrl,
          duration_seconds: media.type === "video" ? Math.min(result.duration || 15, 15) : 5,
          background_color: null, stickers: [], poll_data: null, question_data: null,
          countdown_data: null, location: location || "", link_url: "",
          hashtags, mentions, university: uni,
          faculty: academicData.faculty || user?.faculty || "",
          department: academicData.department || user?.department || "",
          course_code: academicData.course || user?.course_code || "",
          views_count: 0, replies_count: 0, reactions: {},
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_highlight: false, status: "active",
        });
      } else if (mode === "short") {
        await base44.entities.ShortVideo.create({
          title: content.slice(0, 80) || "Untitled", description: content,
          video_url: result.mediaUrl, thumbnail_url: result.thumbnailUrl,
          duration_seconds: Math.round(result.duration || 0),
          category: context === "academic" ? "tutorial" : "general",
          author_name: authorName, author_image: authorImage,
          author_role: "student", author_handle: authorHandle, is_verified: false,
          university: uni,
          faculty: academicData.faculty || user?.faculty || "",
          department: academicData.department || user?.department || "",
          course_code: academicData.course || user?.course_code || "",
          hashtags, mentions, tags: [], captions: [], reactions: {},
          likes_count: 0, comments_count: 0, shares_count: 0, bookmarks_count: 0,
          views_count: 0, is_bookmarked: false, is_following_creator: false,
          status: "active", uploaded_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.QuadPost.create({
          content, author_name: authorName, author_image: authorImage,
          author_role: "student", author_handle: authorHandle, is_verified: false,
          type: media.type === "video" ? "video" : "photo",
          media_urls: [result.mediaUrl],
          media_types: [media.type === "video" ? "video" : "image"],
          hashtags, mentions, location: location || "", university: uni,
          department: academicData.department || user?.department || "",
          visibility, reactions: {},
          likes_count: 0, comments_count: 0, shares_count: 0,
          is_pinned: false, is_anonymous: false, draft_status: "published",
        });
      }

      setPublishing(false);
      setCaption("");
      setLocation("");
      setTags("");
      setMusic("");
      setAcademicData({});
      onPublished();
    } catch {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && media && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 bg-black/95 flex flex-col"
        >
          {/* Media preview — top portion with filter applied */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {media.type === "video" ? (
              <video src={media.url} className="w-full h-full object-cover" autoPlay muted loop playsInline
                style={{ filter: filterCss, transform: `rotate(${rotation}deg)` }} />
            ) : (
              <img src={media.url} className="w-full h-full object-cover" alt="Capture" loading="lazy"
                style={{ filter: filterCss, transform: `rotate(${rotation}deg)` }} />
            )}
            <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap z-10">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full glass-strong">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{mode}</span>
            </div>
          </div>

          {/* Bottom sheet — creation panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 max-h-[55vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

            {/* Filter strip — only for images */}
            {media?.type === "image" && (
              <FilterStrip
                mediaUrl={media.url}
                selectedFilter={selectedFilter}
                intensity={filterIntensity}
                onFilterChange={(id) => { hapticTap(); setSelectedFilter(id); }}
                onIntensityChange={(v) => setFilterIntensity(v)}
              />
            )}

            {/* Editing controls — only for images */}
            {media?.type === "image" && (
              <EditingControls
                adjustments={adjustments}
                onAdjustmentsChange={setAdjustments}
                onReset={() => {
                  setAdjustments({ brightness: 1, contrast: 1, saturation: 1, warmth: 0, rotation: 0 });
                  setSelectedFilter("natural");
                  setFilterIntensity(1);
                }}
              />
            )}

            {/* Context toggle */}
            <div className="flex items-center gap-1 p-1 mx-4 mt-3 rounded-full glass-card">
              <button onClick={() => { hapticTap(); setContext("social"); }} className={"flex-1 py-1.5 rounded-full text-[11px] font-semibold spring-tap " + (context === "social" ? "bg-foreground text-background" : "text-muted-foreground")}>
                Social
              </button>
              <button onClick={() => { hapticTap(); setContext("academic"); }} className={"flex-1 py-1.5 rounded-full text-[11px] font-semibold spring-tap " + (context === "academic" ? "bg-foreground text-background" : "text-muted-foreground")}>
                <GraduationCap className="w-3 h-3 inline mr-1" /> Academic
              </button>
            </div>

            <div className="px-4 pb-6 pt-3 space-y-3">
              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={context === "academic" ? "Describe your academic content..." : "Add a caption..."}
                rows={2}
                maxLength={500}
                className="w-full bg-transparent text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[44px]"
              />

              {/* Quick tags row */}
              <div className="flex gap-2 flex-wrap">
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#tags @friends" className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
                <button onClick={() => setLocation("")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-[11px] text-muted-foreground spring-tap">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </button>
              </div>

              {/* Location input */}
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (e.g., Library, Lab 3)"
                className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />

              {/* Academic fields */}
              <AnimatePresence>
                {context === "academic" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <GraduationCap className="w-3 h-3" /> Academic Details
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ACADEMIC_FIELDS.map((f) => (
                        <input
                          key={f.id}
                          value={academicData[f.id] || ""}
                          onChange={(e) => setAcademicData({ ...academicData, [f.id]: e.target.value })}
                          placeholder={f.placeholder}
                          className="px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social fields */}
              <AnimatePresence>
                {context === "social" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      value={music}
                      onChange={(e) => setMusic(e.target.value)}
                      placeholder="Add music..."
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Audience cards */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Audience</p>
                <div className="grid grid-cols-3 gap-2">
                  {AUDIENCE_CARDS.map((card) => {
                    const Icon = card.icon;
                    const active = audience === card.id;
                    return (
                      <button
                        key={card.id}
                        onClick={() => { hapticTap(); setAudience(card.id); }}
                        className={"flex flex-col items-center gap-1.5 py-2.5 rounded-2xl spring-tap transition-all " + (active ? "bg-foreground text-background" : "glass-card text-muted-foreground")}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                        <span className="text-[10px] font-semibold">{card.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ask Bud — only when explicitly tapped */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl glass-card text-[12px] font-medium text-muted-foreground spring-tap">
                <Sparkles className="w-3.5 h-3.5" /> Ask Bud for help
              </button>

              {/* Publish */}
              <button
                onClick={handlePublish}
                disabled={publishing || isUploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-foreground text-background font-semibold text-[14px] spring-tap disabled:opacity-40"
              >
                {publishing || isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isUploading ? "Uploading..." : "Publishing..."}</>
                ) : (
                  <>Publish {mode === "story" ? "Story" : mode === "short" ? "Short" : "Post"} <Send className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}