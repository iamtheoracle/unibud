import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  X, Bookmark, BookmarkCheck, FileCheck, ExternalLink, Calendar, MapPin, Award, Tag, FileText, Loader2,
} from "lucide-react";
import { TYPE_META } from "./careerConstants";

export default function OpportunityDetailSheet({ opp, user, resumes, onClose, onTracked }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tracking, setTracking] = useState(false);
  const [selectedResume, setSelectedResume] = useState(resumes?.find((r) => r.isDefault)?.url || "");

  const meta = TYPE_META[opp.type] || TYPE_META.job;
  const Icon = meta.icon;
  const isFavorited = (opp.favorited_by || []).includes(user?.id);

  const toggleBookmark = async () => {
    const favoritedBy = opp.favorited_by || [];
    const next = isFavorited ? favoritedBy.filter((id) => id !== user.id) : [...favoritedBy, user.id];
    try {
      await base44.entities.Opportunity.update(opp.id, { favorited_by: next });
      qc.invalidateQueries({ queryKey: ["careerOpportunities"] });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  const handleTrack = async () => {
    setTracking(true);
    try {
      const resume = resumes?.find((r) => r.url === selectedResume);
      await base44.entities.ApplicationTracker.create({
        opportunity_id: opp.id,
        opportunity_title: opp.title,
        organization: opp.organization,
        type: opp.type,
        status: "interested",
        deadline: opp.deadline,
        amount: opp.amount,
        link: opp.link,
        resume_url: selectedResume || undefined,
        resume_name: resume?.name,
        institution_id: user?.data?.institution_id,
      });
      qc.invalidateQueries({ queryKey: ["applicationTrackers"] });
      toast({ title: "Added to tracker", description: "Track your progress in the Applications tab." });
      onTracked?.();
      onClose();
    } catch {
      toast({ title: "Couldn't track", variant: "destructive" });
    }
    setTracking(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] glass-strong no-scrollbar"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="p-5 pb-8">
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0" style={{ background: `hsl(var(--${meta.color}) / 0.10)` }}>
              <Icon className="w-5 h-5" style={{ color: `hsl(var(--${meta.color}))` }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-bold text-foreground leading-tight">{opp.title}</h2>
              <p className="text-[12px] text-muted-foreground">{opp.organization}</p>
            </div>
            <button onClick={toggleBookmark} className="shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center spring-tap">
              {isFavorited ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `hsl(var(--${meta.color}) / 0.10)`, color: `hsl(var(--${meta.color}))` }}>{meta.label}</span>
            {opp.amount && <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold flex items-center gap-1"><Award className="w-2.5 h-2.5" /> {opp.amount}</span>}
          </div>

          {/* Details */}
          <div className="space-y-1.5 mb-3">
            {opp.deadline && (
              <div className="flex items-center gap-2 text-[12px] text-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> Deadline: {opp.deadline}
              </div>
            )}
            {opp.location && (
              <div className="flex items-center gap-2 text-[12px] text-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {opp.location}
              </div>
            )}
            {opp.eligibility && (
              <div className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-foreground">Eligibility: </span>{opp.eligibility}
              </div>
            )}
          </div>

          {/* Description */}
          {opp.description && (
            <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">{opp.description}</p>
          )}

          {/* Tags */}
          {opp.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {opp.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Resume selector */}
          {resumes?.length > 0 && (
            <div className="glass-card p-3 rounded-[14px] mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Attach Resume
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedResume("")}
                  className={`w-full text-left px-3 py-2 rounded-[10px] text-[11px] spring-tap ${!selectedResume ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground"}`}
                >
                  No resume
                </button>
                {resumes.map((r) => (
                  <button
                    key={r.url}
                    onClick={() => setSelectedResume(r.url)}
                    className={`w-full text-left px-3 py-2 rounded-[10px] text-[11px] spring-tap flex items-center gap-2 ${selectedResume === r.url ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground"}`}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate flex-1">{r.name}</span>
                    {r.isDefault && <span className="text-[8px] font-bold text-primary">DEFAULT</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleTrack}
              disabled={tracking}
              className="flex-1 py-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
              Track Application
            </button>
            {opp.link && (
              <a
                href={opp.link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-[14px] bg-foreground text-background font-semibold text-[13px] spring-tap flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Apply
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}