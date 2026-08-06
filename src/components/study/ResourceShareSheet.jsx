import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Share2, Check, Link2, Download } from "lucide-react";

export default function ResourceShareSheet({ resource, groupName, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = resource.external_url || resource.file_url || "";

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: `Check out "${resource.title}"${groupName ? ` from ${groupName}` : ""}`,
          url: shareUrl || undefined,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!resource.file_url) return;
    const a = document.createElement("a");
    a.href = resource.file_url;
    a.download = resource.title || "download";
    a.target = "_blank";
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-t-[28px] glass-strong p-5 pb-8 safe-area-pb"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-foreground">Share resource</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="glass-card p-3 mb-4 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">{resource.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{shareUrl || "No link available"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap"
          >
            <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">Share via…</p>
              <p className="text-[10px] text-muted-foreground">System share sheet</p>
            </div>
          </button>

          <button
            onClick={handleCopy}
            disabled={!shareUrl}
            className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-chocolate" />}
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">{copied ? "Link copied!" : "Copy link"}</p>
              <p className="text-[10px] text-muted-foreground">Paste anywhere</p>
            </div>
          </button>

          {resource.file_url && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap"
            >
              <div className="w-9 h-9 rounded-[12px] bg-success/10 flex items-center justify-center">
                <Download className="w-4 h-4 text-success" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[12px] font-semibold text-foreground">Download file</p>
                <p className="text-[10px] text-muted-foreground">Save to device</p>
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}