import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, Loader2, Check, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REPORT_REASONS = [
  { id: "spam", label: "Spam or repetitive", desc: "Repeated or irrelevant content" },
  { id: "duplicate", label: "Duplicate upload", desc: "Same content already posted" },
  { id: "offensive", label: "Offensive or hateful", desc: "Harmful, abusive, or discriminatory" },
  { id: "illegal", label: "Illegal content", desc: "Unlawful material or activity" },
  { id: "malicious_link", label: "Malicious link", desc: "Phishing, malware, or scam URL" },
  { id: "fake_university_info", label: "Fake university info", desc: "False official university information" },
  { id: "other", label: "Other reason", desc: "Explain in the description below" },
];

export default function ContentReportModal({ open, onClose, contentType, contentId, reporterName, reporterId }) {
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setReason(null);
    setDescription("");
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await base44.entities.ContentReport.create({
        content_type: contentType,
        content_id: contentId,
        reporter_name: reporterName || "Anonymous",
        reporter_id: reporterId,
        reason,
        description: description.trim(),
        status: "pending",
        action_taken: "none",
      });
      setSubmitted(true);
      setTimeout(handleClose, 1800);
    } catch {
      // bubble up
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-[28px] sm:rounded-[28px] p-6 max-h-[85vh] overflow-y-auto"
          >
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-success" strokeWidth={2.5} />
                </div>
                <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">Report Submitted</h3>
                <p className="text-[12px] text-muted-foreground max-w-[240px]">
                  Thank you. Our moderation team will review this content promptly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Flag className="w-4 h-4 text-destructive" strokeWidth={2} />
                    </div>
                    <h2 className="font-heading font-bold text-[16px] text-foreground">Report Content</h2>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap" aria-label="Close">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-[12px] text-muted-foreground mb-4">
                  Help keep UNIBUD safe and educational. Why are you reporting this?
                </p>

                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={"w-full text-left p-3 rounded-2xl border transition-all spring-tap " + (reason === r.id ? "border-primary bg-primary/5" : "border-border/40 bg-muted/30")}
                    >
                      <div className="flex items-center gap-2">
                        <div className={"w-4 h-4 rounded-full border-2 flex items-center justify-center " + (reason === r.id ? "border-primary bg-primary" : "border-muted-foreground/30")}>
                          {reason === r.id && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">{r.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground ml-6">{r.desc}</p>
                    </button>
                  ))}
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details (optional)..."
                  rows={3}
                  className="w-full bg-muted/40 border border-border/40 rounded-2xl p-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none mb-4"
                />

                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-[14px] spring-tap disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><AlertTriangle className="w-4 h-4" /> Submit Report</>
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}