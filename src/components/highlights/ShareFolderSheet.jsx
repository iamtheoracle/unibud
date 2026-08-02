import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Share2, Copy, Check, Globe, Link2, Eye, Lightbulb, Users2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import { base44 } from "@/api/base44Client";
import SharedCollectionCard from "@/components/highlights/SharedCollectionCard";
import RecipientPicker from "@/components/highlights/RecipientPicker";

export default function ShareFolderSheet({ open, onOpenChange, folder, itemCount, isShared, onShare, highlightIds = [] }) {
  const [shared, setShared] = useState(isShared);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [collaboration, setCollaboration] = useState("view");
  const { toast } = useToast();

  useEffect(() => {
    setShared(isShared);
  }, [isShared, open]);

  const shareUrl = `${window.location.origin}/highlights?collection=${encodeURIComponent(folder || "")}`;

  const handleShare = async () => {
    hapticTap();
    try {
      await onShare();
      setShared(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
    } catch {
      toast({ title: "Couldn't share", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleCollaborationChange = async (permission) => {
    hapticTap();
    setCollaboration(permission);
    if (highlightIds.length > 0) {
      try {
        await base44.entities.Highlight.bulkUpdate(
          highlightIds.map((id) => ({ id, metadata: { collaboration: permission } }))
        );
      } catch {}
    }
  };

  const handleCopy = () => {
    hapticTap();
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share "{folder}"
          </SheetTitle>
          <SheetDescription>
            Share {itemCount} saved {itemCount === 1 ? "item" : "items"} from this collection with other students in your community.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-1 pb-8 pt-3 relative">
          {/* Success overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 rounded-t-[28px]"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="w-16 h-16 rounded-full bg-success/15 grid place-items-center mb-3"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" className="check-draw" />
                  </svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-[15px] font-bold text-foreground"
                >
                  Collection Shared
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-[12px] text-muted-foreground mt-0.5"
                >
                  "{folder}" is now visible to your community.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collection preview */}
          <SharedCollectionCard folder={folder} itemCount={itemCount} />

          {/* Collaboration permissions */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Collaboration
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "view", label: "View Only", icon: Eye },
                { id: "suggest", label: "Suggest", icon: Lightbulb },
                { id: "collaborate", label: "Full Access", icon: Users2 },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = collaboration === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleCollaborationChange(opt.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl spring-tap transition-all ${
                      active ? "bg-foreground text-background" : "glass text-foreground/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                    <span className="text-[10px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility / quick actions */}
          {!shared ? (
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-[16px] bg-foreground text-background text-[14px] font-semibold spring-tap flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" /> Make Visible to Community
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 p-3 rounded-[16px] bg-success/10 border border-success/20">
                <Check className="w-4 h-4 text-success shrink-0" />
                <p className="text-[12px] font-medium text-foreground">Collection is visible — other students can discover it in the Community tab.</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-[16px] glass">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-[12px] text-muted-foreground outline-none truncate"
                />
                <button onClick={handleCopy} className="w-8 h-8 rounded-full grid place-items-center glass spring-tap shrink-0" aria-label="Copy link">
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {navigator.share && (
                <button
                  onClick={() => { hapticTap(); navigator.share({ title: folder, url: shareUrl }); }}
                  className="w-full py-2.5 rounded-[16px] glass text-[13px] font-semibold spring-tap flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share Outside UNIBUD
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Share Directly</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Recipient picker */}
          <RecipientPicker
            onShare={onShare}
            folderName={folder}
            shareUrl={shareUrl}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}