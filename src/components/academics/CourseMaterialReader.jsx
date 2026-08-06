import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, Clock, FileText, Link as LinkIcon, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const TYPE_ICON = { lesson: FileText, reading: FileText, video: FileText, document: FileText, slides: FileText, external: LinkIcon, assignment: FileText };

/**
 * CourseMaterialReader — student reads a lesson/reading (markdown) or opens
 * a file / external link, and marks it complete. Completion writes a
 * CourseMaterialProgress record for the student.
 */
export default function CourseMaterialReader({ open, onClose, material, progress, user }) {
  const { toast } = useToast();
  const [toggling, setToggling] = useState(false);
  const done = !!progress?.completed;
  const Icon = TYPE_ICON[material?.type] || FileText;

  async function toggleComplete() {
    if (!material) return;
    setToggling(true);
    try {
      if (progress?.id) {
        await base44.entities.CourseMaterialProgress.update(progress.id, {
          completed: !done,
          completed_at: !done ? new Date().toISOString() : "",
        });
      } else {
        await base44.entities.CourseMaterialProgress.create({
          material_id: material.id,
          course_id: material.course_id,
          user_id: user.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
      await queryClientInstance.invalidateQueries({ queryKey: ["materialProgress", user.id, material.course_id] });
      toast({ title: done ? "Marked as not done" : "Completed ✓" });
    } catch (err) {
      toast({ title: "Could not update", description: err.message, variant: "destructive" });
    } finally {
      setToggling(false);
    }
  }

  return (
    <AnimatePresence>
      {open && material && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{material.type}{material.module ? ` · ${material.module}` : ""}</p>
                  <h3 className="font-heading font-bold text-[16px] text-foreground leading-tight truncate">{material.title}</h3>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {Number(material.duration_minutes) > 0 && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3"><Clock className="w-3 h-3" /> {material.duration_minutes} min</p>
            )}

            {material.content && (
              <div className="prose prose-sm max-w-none text-[13px] text-foreground leading-relaxed">
                <ReactMarkdown>{material.content}</ReactMarkdown>
              </div>
            )}

            {material.file_url && (
              <a href={material.file_url} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center gap-2 p-3 rounded-[14px] bg-primary/8 border border-primary/15 spring-tap">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-primary">Open attached file</span>
              </a>
            )}

            {material.external_url && (
              <a href={material.external_url} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center gap-2 p-3 rounded-[14px] bg-accent/8 border border-accent/15 spring-tap">
                <LinkIcon className="w-4 h-4 text-accent" />
                <span className="text-[13px] font-semibold text-accent truncate">{material.external_url}</span>
              </a>
            )}

            <button onClick={toggleComplete} disabled={toggling}
              className={`w-full mt-5 py-3.5 rounded-[18px] font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2 ${
                done ? "bg-success/12 text-success border border-success/20" : "bg-primary text-primary-foreground"
              }`}>
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {toggling ? "Updating…" : done ? "Completed — mark as not done" : "Mark as complete"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}