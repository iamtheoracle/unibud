import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bookmark, Share2, Lock, Unlock } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import CollectionDiscussion from "./CollectionDiscussion";

/**
 * ItemDiscussionSheet — full-screen overlay for per-item discussions.
 * Shows the item preview and its dedicated discussion thread.
 * Supports sharing and per-item discussion locking (moderators).
 */
export default function ItemDiscussionSheet({ item, collectionId, collaborators = [], user, canModerate, onClose }) {
  const { toast } = useToast();
  const [isLocked, setIsLocked] = useState(item?.metadata?.discussion_locked === true);

  useEffect(() => {
    setIsLocked(item?.metadata?.discussion_locked === true);
  }, [item]);

  const handleShare = async () => {
    const url = `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}&item=${item?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item?.title || "Collection discussion", url });
      } catch {}
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  const toggleLock = async () => {
    const newLocked = !isLocked;
    try {
      await base44.entities.Highlight.update(item.id, {
        metadata: { ...(item.metadata || {}), discussion_locked: newLocked },
      });
      setIsLocked(newLocked);
      toast({ title: newLocked ? "Discussion locked" : "Discussion unlocked" });
    } catch {
      toast({ title: "Couldn't change lock status", variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-background flex flex-col"
        >
          <div className="flex items-center gap-2 p-4 safe-area-pt border-b border-border/20 shrink-0">
            <button onClick={onClose} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[15px] font-bold flex-1 truncate">Item Discussion</h2>
            <button onClick={handleShare} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap">
              <Share2 className="w-4 h-4" />
            </button>
            {canModerate && (
              <button
                onClick={toggleLock}
                className={"w-9 h-9 rounded-full grid place-items-center spring-tap " + (isLocked ? "bg-destructive text-destructive-foreground" : "glass")}
                title={isLocked ? "Unlock discussion" : "Lock discussion"}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            )}
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-[11px] font-medium shrink-0">
              <Lock className="w-3.5 h-3.5" /> Discussion is locked. New comments are disabled.
            </div>
          )}

          <div className="flex items-center gap-3 p-3 mx-4 mt-3 rounded-2xl glass-card shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-card grid place-items-center">
              {item.image_url ? (
                <Image src={item.image_url} fittingType="fill" className="w-full h-full" />
              ) : (
                <Bookmark className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{item.title}</p>
              {item.subtitle && <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>}
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-primary mt-0.5"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> {item.source_name || "Open source"}
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <CollectionDiscussion
              collectionId={collectionId}
              itemId={item.id}
              collaborators={collaborators}
              user={user}
              canModerate={canModerate}
              canComment={!isLocked}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}