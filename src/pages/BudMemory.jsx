import React, { useState } from "react";
import { ArrowLeft, Sparkles, Pencil, Trash2, Download, Power, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const categories = [
  { key: "full_name", label: "Full Name", category: "Basic Info" },
  { key: "preferred_name", label: "Preferred Name", category: "Basic Info" },
  { key: "country", label: "Country", category: "Basic Info" },
  { key: "city", label: "City", category: "Basic Info" },
  { key: "date_of_birth", label: "Date of Birth", category: "Basic Info" },
  { key: "time_zone", label: "Time Zone", category: "Basic Info" },
  { key: "university", label: "University", category: "Academic" },
  { key: "campus", label: "Campus", category: "Academic" },
  { key: "faculty", label: "Faculty", category: "Academic" },
  { key: "department", label: "Department", category: "Academic" },
  { key: "course_major", label: "Course / Major", category: "Academic" },
  { key: "level", label: "Level", category: "Academic" },
  { key: "expected_graduation", label: "Expected Graduation", category: "Academic" },
  { key: "student_id", label: "Student ID", category: "Academic" },
  { key: "learning_styles", label: "Learning Styles", category: "Preferences", isArray: true },
  { key: "preferred_study_time", label: "Preferred Study Time", category: "Preferences" },
  { key: "favorite_subjects", label: "Favorite Subjects", category: "Preferences" },
  { key: "difficult_subjects", label: "Difficult Subjects", category: "Preferences" },
  { key: "study_hours", label: "Study Hours", category: "Preferences" },
  { key: "goals", label: "Goals", category: "Goals & Interests", isArray: true },
  { key: "interests", label: "Interests", category: "Goals & Interests", isArray: true },
  { key: "dream_job", label: "Dream Job", category: "Career" },
  { key: "industries", label: "Industries", category: "Career" },
  { key: "skills_to_develop", label: "Skills to Develop", category: "Career" },
  { key: "preferred_countries", label: "Preferred Countries", category: "Career" },
  { key: "accessibility", label: "Accessibility", category: "Accessibility", isArray: true },
];

export default function BudMemory() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [memoryDisabled, setMemoryDisabled] = useState(false);

  const grouped = categories.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  const startEdit = (key, currentVal) => {
    setEditing(key);
    setEditValue(Array.isArray(currentVal) ? currentVal.join(", ") : currentVal || "");
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const val = editValue.trim();
      await base44.auth.updateMe({ [editing]: val.includes(",") ? val.split(",").map(s => s.trim()) : val });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setEditing(null);
    } catch (e) {}
    setSaving(false);
  };

  const deleteField = async (key) => {
    try {
      await base44.auth.updateMe({ [key]: null });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (e) {}
  };

  const exportMemory = () => {
    const data = categories.reduce((acc, c) => {
      if (user?.[c.key]) acc[c.key] = user[c.key];
      return acc;
    }, {});
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unibud-memory.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMemory = async () => {
    const newVal = !memoryDisabled;
    setMemoryDisabled(newVal);
    try {
      await base44.auth.updateMe({ memory_disabled: newVal });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (e) {
      setMemoryDisabled(!newVal);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <Link to="/me" className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[20px] tracking-tight text-foreground">Bud Memory</h1>
            <p className="text-[11px] text-muted-foreground">What Bud remembers about you</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Info banner */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Bud uses this information to personalize your study plans, reminders, recommendations, and more. You're always in control — edit, delete, export, or disable memory anytime.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={exportMemory} className="flex-1 bg-card rounded-2xl shadow-sm border border-border/30 py-3 flex flex-col items-center gap-1">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">Export</span>
          </button>
          <button onClick={toggleMemory} className="flex-1 bg-card rounded-2xl shadow-sm border border-border/30 py-3 flex flex-col items-center gap-1">
            <Power className={`w-4 h-4 ${memoryDisabled ? "text-destructive" : "text-primary"}`} />
            <span className="text-[11px] font-semibold text-foreground">{memoryDisabled ? "Enable" : "Disable"}</span>
          </button>
        </div>

        {/* Categories */}
        {Object.entries(grouped).map(([catName, fields]) => {
          const hasData = fields.some(f => user?.[f.key]);
          if (!hasData) return null;
          return (
            <div key={catName}>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{catName}</p>
              <div className="bg-card rounded-2xl shadow-sm border border-border/30 overflow-hidden">
                {fields.filter(f => user?.[f.key]).map((field, i, arr) => {
                  const val = user[field.key];
                  const displayVal = Array.isArray(val) ? val.join(", ") : val;
                  return (
                    <div key={field.key} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-border/30" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground">{field.label}</p>
                        {editing === field.key ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            autoFocus
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-success/30 text-[13px] focus:outline-none focus:ring-2 focus:ring-success/20"
                          />
                        ) : (
                          <p className="text-[13px] font-medium text-foreground truncate">{displayVal}</p>
                        )}
                      </div>
                      {editing === field.key ? (
                        <button onClick={saveEdit} disabled={saving} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </button>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(field.key, val)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteField(field.key)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Memory disabled notice */}
        {memoryDisabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-warning/10 border border-warning/20 rounded-2xl p-4"
          >
            <p className="text-[12px] text-warning">
              Memory is disabled. Bud won't use your stored preferences for personalization until you re-enable it.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}