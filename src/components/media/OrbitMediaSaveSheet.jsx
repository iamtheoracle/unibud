import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X, Bookmark, FolderOpen, Users, BookOpen, Plus, Check, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const COLLECTION_TYPES = [
  { key: "personal", label: "Personal Highlights", icon: Bookmark, desc: "Save for later" },
  { key: "shared", label: "Shared Collections", icon: Users, desc: "Collaborate with friends" },
  { key: "academic", label: "Academic Collections", icon: BookOpen, desc: "Study resources" },
  { key: "community", label: "Community Collections", icon: FolderOpen, desc: "Shared with your community" },
];

/**
 * OrbitMediaSaveSheet — save media into personal or shared collections.
 * Supports Personal Highlights, Shared/Academic/Community Collections.
 * All real data via the Highlight entity.
 */
export default function OrbitMediaSaveSheet({ post, user, mediaUrl, open, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("personal");
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [savedFolder, setSavedFolder] = useState(null);

  const { data: existingFolders = [] } = useQuery({
    queryKey: ["save-folders", user?.id, selectedType],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Highlight.filter(
        { created_by_id: user.id },
        "-created_date",
        30
      );
      const folders = {};
      all.forEach((h) => {
        const folder = h.folder || "Saved";
        if (!folders[folder]) folders[folder] = { name: folder, count: 0, items: [] };
        folders[folder].count++;
        folders[folder].items.push(h);
      });
      return Object.values(folders);
    },
    enabled: !!open && !!user,
  });

  const handleSave = async (folderName) => {
    if (!user || !post) return;
    hapticTap();
    setSavedFolder(folderName);

    try {
      await base44.entities.Highlight.create({
        content_type: post.type === "video" ? "youtube_video" : "post",
        title: post.content?.slice(0, 60) || "Saved Media",
        subtitle: post.author_name ? `by ${post.author_name}` : "",
        source_url: `${window.location.origin}/quad`,
        source_name: "Orbit",
        image_url: mediaUrl || post.media_urls?.[0] || "",
        folder: folderName,
        visibility: selectedType === "community" ? "community" : "private",
        tags: post.hashtags || [],
        metadata: {
          post_id: post.id,
          author_name: post.author_name,
          university: post.university,
          saved_type: selectedType,
        },
      });

      toast({ title: `Saved to ${folderName}` });
      qc.invalidateQueries({ queryKey: ["save-folders"] });
      setTimeout(() => {
        onClose();
        setSavedFolder(null);
      }, 800);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
      setSavedFolder(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    hapticTap();
    await handleSave(newFolderName.trim());
    setNewFolderName("");
    setCreating(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] flex items-end"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative w-full max-h-[80%] overflow-y-auto glass-strong rounded-t-[28px] pb-8 safe-area-pb"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
              <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap">
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>

            <h3 className="font-heading font-bold text-[17px] text-foreground px-5 mb-4">Save to Highlights</h3>

            {/* Collection type tabs */}
            <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
              {COLLECTION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                      selectedType === type.key
                        ? "bg-foreground text-background"
                        : "glass text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3 h-3" strokeWidth={2.2} />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* New folder input */}
            <div className="px-5 mb-4">
              <div className="flex gap-2">
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  placeholder="Create new collection…"
                  className="flex-1 glass rounded-full h-10 px-4 text-[13px] text-foreground outline-none"
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || creating}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap disabled:opacity-40"
                >
                  {creating ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* Existing folders */}
            <div className="px-5 space-y-2">
              {existingFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bookmark className="w-7 h-7 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold text-foreground mb-1">No collections yet</p>
                  <p className="text-[11px] text-muted-foreground">Create a collection to start saving media.</p>
                </div>
              ) : (
                existingFolders.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => handleSave(folder.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] glass hover:bg-muted/40 spring-tap text-left"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-foreground block truncate">{folder.name}</span>
                      <span className="text-[11px] text-muted-foreground">{folder.count} {folder.count === 1 ? "item" : "items"}</span>
                    </div>
                    {savedFolder === folder.name ? (
                      <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                    )}
                  </button>
                ))
              )}

              {/* Quick save to default */}
              <button
                onClick={() => handleSave("Saved")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] bg-primary/8 hover:bg-primary/12 spring-tap text-left"
              >
                <div className="w-10 h-10 rounded-[12px] bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <span className="text-[13px] font-semibold text-foreground block">Quick Save</span>
                  <span className="text-[11px] text-muted-foreground">Save to default collection</span>
                </div>
                {savedFolder === "Saved" ? (
                  <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                ) : null}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}