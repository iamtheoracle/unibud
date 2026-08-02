import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bookmark } from "lucide-react";
import { Image } from "@/components/ui/image";
import CollectionDiscussion from "./CollectionDiscussion";

/**
 * ItemDiscussionSheet — full-screen overlay for per-item discussions.
 * Shows the item preview and its dedicated discussion thread.
 */
export default function ItemDiscussionSheet({ item, collectionId, collaborators = [], user, canModerate, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-background flex flex-col"
        >
          <div className="flex items-center gap-3 p-4 safe-area-pt border-b border-border/20 shrink-0">
            <button onClick={onClose} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[15px] font-bold flex-1 truncate">Item Discussion</h2>
          </div>

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
              canComment={true}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}