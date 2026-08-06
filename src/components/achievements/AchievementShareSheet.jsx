import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Share2, Check, FileText, Briefcase, Linkedin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function AchievementShareSheet({ achievement, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(null);

  const shareUrl = `${window.location.origin}/achievements/gallery?id=${achievement.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: achievement.title,
          text: `I earned "${achievement.title}" on UNIBUD!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const exportToPortfolio = async () => {
    setExporting("portfolio");
    try {
      await base44.entities.PortfolioItem.create({
        title: achievement.title,
        type: "achievement",
        author_name: user?.full_name || user?.email || "Student",
        description: achievement.description || achievement.milestone_description || "",
        tags: [achievement.category, "achievement", "verified"],
        is_public: false,
        completed_date: achievement.date_earned ? achievement.date_earned.split("T")[0] : undefined,
      });
      toast({ title: "Added to portfolio", description: "Find it in your Portfolio section." });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const exportToResume = () => {
    setExporting("resume");
    try {
      const lines = [
        `${achievement.title}`,
        achievement.verification_source ? `Verified by: ${achievement.verification_source}` : "",
        achievement.date_earned ? `Date: ${new Date(achievement.date_earned).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}` : "",
        achievement.description || achievement.milestone_description || "",
      ].filter(Boolean);
      const text = lines.join("\n");
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard", description: "Paste into your resume or CV." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const addToLinkedIn = () => {
    setExporting("linkedin");
    try {
      const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION&name=${encodeURIComponent(achievement.title)}&organizationName=${encodeURIComponent(achievement.verification_source || "UNIBUD")}&issueDate=${achievement.date_earned ? new Date(achievement.date_earned).toISOString().split("T")[0] : ""}&certUrl=${encodeURIComponent(shareUrl)}`;
      window.open(linkedinUrl, "_blank");
      toast({ title: "Opening LinkedIn", description: "Add this achievement to your LinkedIn profile." });
    } catch {
      toast({ title: "Could not open LinkedIn", variant: "destructive" });
    } finally {
      setExporting(null);
    }
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
          <h3 className="text-[16px] font-bold text-foreground">Share achievement</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="glass-card p-3 mb-4 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-primary to-chocolate flex items-center justify-center flex-shrink-0">
            <span className="text-[14px]">🏆</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">{achievement.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{achievement.verification_source || "Verified achievement"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={handleNativeShare} className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">Share via…</p>
              <p className="text-[10px] text-muted-foreground">System share sheet</p>
            </div>
          </button>

          <button onClick={handleCopy} className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-chocolate" />}
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">{copied ? "Link copied!" : "Copy link"}</p>
              <p className="text-[10px] text-muted-foreground">Share your achievement page</p>
            </div>
          </button>

          <button onClick={exportToResume} disabled={exporting === "resume"} className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap disabled:opacity-50">
            <div className="w-9 h-9 rounded-[12px] bg-foreground/8 flex items-center justify-center">
              <FileText className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">Export to Resume</p>
              <p className="text-[10px] text-muted-foreground">Copy formatted text for your CV</p>
            </div>
          </button>

          <button onClick={exportToPortfolio} disabled={exporting === "portfolio"} className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap disabled:opacity-50">
            <div className="w-9 h-9 rounded-[12px] bg-success/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-success" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">{exporting === "portfolio" ? "Adding…" : "Export to Portfolio"}</p>
              <p className="text-[10px] text-muted-foreground">Add to your UNIBUD portfolio</p>
            </div>
          </button>

          <button onClick={addToLinkedIn} disabled={exporting === "linkedin"} className="w-full flex items-center gap-3 p-3 rounded-[14px] glass-card spring-tap disabled:opacity-50">
            <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[12px] font-semibold text-foreground">Add to LinkedIn</p>
              <p className="text-[10px] text-muted-foreground">Add as a certification</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}