import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2, Download, Link2, Check, QrCode } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

/**
 * QRShareSheet — premium, secure deep-link sharing for any UNIBUD surface.
 * Encodes the full app URL + route into a scannable QR, with copy, native
 * share, and download. No data leaves the device except the public deep link
 * itself (which is the point of a QR). Drop into any surface with a `to` path.
 */
export default function QRShareSheet({ open, onClose, to, title, subtitle }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const url = `${window.location.origin}${to}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&color=11-31-77&bgcolor=255-255-255&data=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Couldn't copy link" });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "UNIBUD", text: subtitle || "", url });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `unibud-${(title || "share").toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      window.open(qrUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[380px] rounded-[28px] glass-strong p-6 safe-area-pb"
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-bold text-[17px] text-foreground">Share via QR</h2>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4">Anyone who scans this opens the link straight inside UNIBUD.</p>

            <div className="flex flex-col items-center mb-5">
              <div className="p-3 rounded-[22px] bg-white ice-glow">
                <img src={qrUrl} alt="UNIBUD QR code" width={236} height={236} className="rounded-[14px] block" loading="lazy" />
              </div>
              {title && <p className="text-[14px] font-semibold text-foreground mt-3 text-center truncate max-w-full">{title}</p>}
              {subtitle && <p className="text-[11px] text-muted-foreground text-center truncate max-w-full">{subtitle}</p>}
            </div>

            <div className="rounded-[16px] bg-muted/40 px-3 py-2.5 flex items-center gap-2 mb-3">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate flex-1">{url}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={copyLink} className="flex flex-col items-center gap-1 py-3 rounded-[16px] glass-card spring-tap">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-foreground" />}
                <span className="text-[10px] font-semibold text-foreground">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button onClick={nativeShare} className="flex flex-col items-center gap-1 py-3 rounded-[16px] glass-card spring-tap">
                <Share2 className="w-4 h-4 text-foreground" />
                <span className="text-[10px] font-semibold text-foreground">Share</span>
              </button>
              <button onClick={download} disabled={downloading} className="flex flex-col items-center gap-1 py-3 rounded-[16px] bg-primary text-primary-foreground spring-tap disabled:opacity-50">
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{downloading ? "…" : "Save"}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}