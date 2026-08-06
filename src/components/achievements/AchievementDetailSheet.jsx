import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  X, Award, Download, Share2, FileText, Briefcase, Linkedin,
  CheckCircle2, Loader2, ExternalLink, Calendar, Shield,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

export default function AchievementDetailSheet({ achievement, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(null);

  const handleShare = async () => {
    const shareText = `I earned "${achievement.title}" on UNIBUD! ${achievement.description || ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: achievement.title, text: shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard" });
    }
  };

  const exportToResume = async () => {
    setExporting("resume");
    try {
      const resumeText = `${achievement.title}\n${achievement.description || ""}\nCategory: ${achievement.category}\nDate Earned: ${achievement.date_earned ? new Date(achievement.date_earned).toLocaleDateString() : "N/A"}\nVerified: ${achievement.verification_source || "UNIBUD verified"}\n${achievement.related_course ? `Related Course: ${achievement.related_course}` : ""}`;

      const blob = new Blob([resumeText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${achievement.title.replace(/\s+/g, "_")}_achievement.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Resume entry exported" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setExporting(null);
  };

  const exportToPortfolio = async () => {
    setExporting("portfolio");
    try {
      await base44.entities.PortfolioItem.create({
        title: achievement.title,
        type: "achievement",
        author_name: user?.full_name || user?.email || "Student",
        description: achievement.description || achievement.milestone_description || "",
        tags: [achievement.category, "achievement"],
        is_public: false,
        completed_date: achievement.date_earned ? achievement.date_earned.split("T")[0] : undefined,
      });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast({ title: "Added to portfolio", description: "Find it in your Portfolio page." });
    } catch {
      toast({ title: "Could not add to portfolio", variant: "destructive" });
    }
    setExporting(null);
  };

  const openLinkedIn = () => {
    window.open("https://www.linkedin.com/profile/add", "_blank", "noopener,noreferrer");
  };

  const downloadCertificate = () => {
    if (achievement.certificate_url) {
      const a = document.createElement("a");
      a.href = achievement.certificate_url;
      a.download = `${achievement.title.replace(/\s+/g, "_")}_certificate`;
      a.target = "_blank";
      a.click();
    }
  };

  const dateStr = achievement.date_earned
    ? new Date(achievement.date_earned).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="relative w-full max-w-[640px] max-h-[88vh] bg-background rounded-t-[28px] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero header */}
          <div className="relative px-5 pt-8 pb-5 gradient-accent overflow-hidden shrink-0">
            <div className="absolute inset-0 gradient-bud-glow opacity-30" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center z-10">
              <X className="w-4 h-4 text-white" strokeWidth={2.2} />
            </button>
            <div className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 bud-ambient-glow"
              >
                <Award className="w-10 h-10 text-white" strokeWidth={1.8} />
              </motion.div>
              <h2 className="text-[18px] font-heading font-bold text-white tracking-tight">{achievement.title}</h2>
              {achievement.description && (
                <p className="text-[12px] text-white/80 mt-1 max-w-[320px] leading-relaxed">{achievement.description}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetaCard icon={Shield} label="Verified By" value={achievement.verification_source || "UNIBUD System"} />
              <MetaCard icon={Calendar} label="Date Earned" value={dateStr || "Recent"} />
              <MetaCard icon={Award} label="Category" value={achievement.category?.replace(/_/g, " ")} />
              <MetaCard icon={CheckCircle2} label="Progress" value={`${achievement.progress || 100}%`} />
            </div>

            {/* Milestone description */}
            {achievement.milestone_description && (
              <div className="p-3 rounded-[14px] bg-card/50 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Milestone</p>
                <p className="text-[12px] text-foreground/80 leading-relaxed">{achievement.milestone_description}</p>
              </div>
            )}

            {/* Bud message */}
            {achievement.bud_message && (
              <div className="p-3 rounded-[14px] bg-primary/5 border border-primary/10 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Bud says</p>
                <p className="text-[12px] text-foreground/80 leading-relaxed italic">"{achievement.bud_message}"</p>
              </div>
            )}

            {/* Certificate */}
            {achievement.certificate_url && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Certificate</p>
                <button
                  onClick={downloadCertificate}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-card border border-border/40 spring-tap text-left"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-chocolate" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">Certificate of Achievement</p>
                    <p className="text-[10px] text-muted-foreground">Tap to view and download</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2.2} />
                </button>
              </div>
            )}

            {/* Progress bar */}
            {(achievement.progress != null && achievement.progress < 100) && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Progress</p>
                  <p className="text-[11px] font-bold text-primary">{achievement.progress}%</p>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-chocolate"
                  />
                </div>
              </div>
            )}

            {/* Related course */}
            {achievement.related_course && (
              <div className="p-2.5 rounded-[12px] bg-muted/20 mb-4">
                <p className="text-[10px] text-muted-foreground">Related course</p>
                <p className="text-[12px] font-semibold text-foreground">{achievement.related_course}</p>
              </div>
            )}

            {/* Export actions */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Export & Share</p>
            <div className="space-y-2">
              <ExportButton
                icon={FileText}
                label="Export to Resume"
                desc="Download as a formatted text entry"
                onClick={exportToResume}
                loading={exporting === "resume"}
              />
              <ExportButton
                icon={Briefcase}
                label="Add to Portfolio"
                desc="Create a portfolio item from this achievement"
                onClick={exportToPortfolio}
                loading={exporting === "portfolio"}
              />
              <ExportButton
                icon={Linkedin}
                label="Add to LinkedIn"
                desc="Open LinkedIn's profile editor"
                onClick={openLinkedIn}
              />
              <ExportButton
                icon={Share2}
                label="Share Achievement"
                desc="Share via your device"
                onClick={handleShare}
              />
            </div>
          </div>

          <div className="h-3 safe-area-pb shrink-0" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="p-2.5 rounded-[12px] bg-card/50">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-[11px] font-semibold text-foreground capitalize truncate">{value}</p>
    </div>
  );
}

function ExportButton({ icon: Icon, label, desc, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-card border border-border/40 spring-tap disabled:opacity-50 text-left"
    >
      <div className="w-9 h-9 rounded-[11px] bg-primary/8 flex items-center justify-center shrink-0">
        {loading ? <Loader2 className="w-4 h-4 text-primary animate-spin" strokeWidth={2.2} /> : <Icon className="w-4 h-4 text-primary" strokeWidth={2.2} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" strokeWidth={2.2} />
    </button>
  );
}