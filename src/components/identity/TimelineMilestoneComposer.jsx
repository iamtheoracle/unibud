import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { TIMELINE_TYPES } from "@/lib/identity/timelineTypes";

export default function TimelineMilestoneComposer({ open, onClose, onSubmit, saving }) {
  const [type, setType] = useState("admission");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const reset = () => {
    setTitle(""); setSubtitle(""); setDate(""); setOrganization(""); setDescription(""); setType("admission");
  };

  const submit = async () => {
    if (!title.trim() || !date) return;
    await onSubmit({
      entry_type: type,
      title: title.trim(),
      subtitle: subtitle.trim(),
      date,
      organization: organization.trim(),
      description: description.trim(),
      is_verified: false,
      is_hidden: false,
    });
    reset();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 320, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="w-full max-w-[600px] glass-strong rounded-t-[28px] pb-6 pt-3 px-5 max-h-[88vh] overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-[17px] text-foreground">Add a milestone</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          <p className="text-[11px] font-semibold text-muted-foreground mb-2">Type</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4 -mx-1 px-1 pb-1">
            {TIMELINE_TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted/40 text-foreground/70 border border-border/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Admitted to B.Sc Computer Science"
              className="w-full oracle-input" />
          </Field>
          <Field label="Date *">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full oracle-input" />
          </Field>
          <Field label="Subtitle (optional)">
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Faculty of Science, 100 Level"
              className="w-full oracle-input" />
          </Field>
          <Field label="Organization (optional)">
            <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. University of Lagos"
              className="w-full oracle-input" />
          </Field>
          <Field label="Description (optional)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Add context about this milestone"
              className="w-full oracle-input resize-none" />
          </Field>

          <button
            onClick={submit}
            disabled={saving || !title.trim() || !date}
            className="w-full mt-3 bg-primary text-primary-foreground rounded-[16px] py-3 text-[14px] font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Add milestone
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</p>
      {children}
    </div>
  );
}