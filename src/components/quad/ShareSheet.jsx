import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Share2, Link as LinkIcon } from "lucide-react";
import { SHARE_TARGETS, EXTERNAL_SHARE_TARGETS } from "./quadConstants";

/**
 * Bottom sheet modal for sharing a post — quiet, monochrome, no brand logos.
 * Internal targets (campus, course, etc.) + external platforms (WhatsApp, Telegram, X).
 * External platforms use native URL schemes where available; others fall back
 * to the Web Share API or copy link.
 */
export default function ShareSheet({ open, onClose, postUrl, postText, onShare }) {
  const [copied, setCopied] = useState(false);
  const [sharedTo, setSharedTo] = useState(null);

  const shareUrl = postUrl || window.location.href;
  const shareText = postText || "Check this out on UNIBUD";

  const handleShare = (target) => {
    if (target.id === "copy_link") {
      navigator.clipboard?.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      if (onShare) onShare();
      return;
    }
    setSharedTo(target.id);
    if (onShare) onShare();
    setTimeout(() => {
      setSharedTo(null);
      onClose();
    }, 1200);
  };

  const handleExternalShare = (platform) => {
    if (platform.url) {
      window.open(platform.url(shareText, shareUrl), "_blank", "noopener,noreferrer");
    } else if (navigator.share) {
      navigator.share({ title: shareText, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onShare) onShare();
    setTimeout(onClose, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 inset-x-0 z-[100] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 p-5 pb-8 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Share to</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Internal share targets — quiet monochrome */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {SHARE_TARGETS.map((target) => (
                <motion.button
                  key={target.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(target)}
                  className="flex flex-col items-center gap-2 p-3 rounded-[16px] hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-[16px] bg-muted/60 flex items-center justify-center">
                    {sharedTo === target.id ? (
                      <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : target.id === "copy_link" && copied ? (
                      <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : (
                      <target.icon className="w-5 h-5 text-foreground" strokeWidth={1.6} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground text-center">
                    {target.id === "copy_link" && copied ? "Copied!" : sharedTo === target.id ? "Shared!" : target.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1 mb-3">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Share externally</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* External platforms — text labels, no brand logos */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {EXTERNAL_SHARE_TARGETS.map((platform) => (
                <motion.button
                  key={platform.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExternalShare(platform)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-muted/40 min-w-[72px]"
                >
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                    <Share2 className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{platform.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Copy link row — quiet */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full mt-3 flex items-center gap-2.5 p-3 rounded-[14px] bg-muted/30 active:scale-[0.98] transition-transform"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" strokeWidth={2} />
              ) : (
                <LinkIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
              )}
              <span className="text-[12px] font-medium text-foreground flex-1 text-left truncate">
                {copied ? "Link copied" : shareUrl}
              </span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}