import React, { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { MATRIC_PRIVACY_LEVELS } from "@/lib/matriculationPrivacy";

/**
 * Displays the student's own matriculation number with verification badge
 * and privacy controls. Shown on the Me page.
 */
export default function MatriculationCard({ user }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matricNumber, setMatricNumber] = useState(user?.matriculation_number || "");
  const [privacy, setPrivacy] = useState(user?.matric_privacy || "university_only");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // Save to User entity
      await base44.auth.updateMe({
        matriculation_number: matricNumber.trim(),
        matric_privacy: privacy,
      });

      // Sync to StudentRecord via backend function
      await base44.functions.invoke("studentSearch", {
        action: "upsert_record",
        matriculation_number: matricNumber.trim(),
        matric_privacy: privacy,
      });

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setEditing(false);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.conflict) {
        setError("This matriculation number is already registered for another student at your university.");
      } else {
        setError(data?.error || "Could not save. Please try again.");
      }
    }
    setSaving(false);
  };

  const isVerified = user?.matriculation_verified;
  const currentPrivacy = MATRIC_PRIVACY_LEVELS.find((p) => p.value === (user?.matric_privacy || "university_only"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-[22px] soft-shadow border border-border/20 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[13px] text-foreground">Matriculation Number</h3>
            <p className="text-[10px] text-muted-foreground">Your verified student identity</p>
          </div>
        </div>
        {isVerified && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-[9px] font-semibold">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      {!editing ? (
        <>
          <div className="bg-muted/40 rounded-[16px] p-3.5 mb-3">
            <p className="text-[10px] text-muted-foreground mb-1">Your Matriculation Number</p>
            <p className="font-mono text-[15px] font-semibold text-foreground tracking-wide">
              {user?.matriculation_number || "Not set yet"}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/40">
              {user?.matric_privacy === "private" ? (
                <EyeOff className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Eye className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="text-[10px] font-medium text-muted-foreground">{currentPrivacy?.label || "Staff & Connections"}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setMatricNumber(user?.matriculation_number || "");
              setPrivacy(user?.matric_privacy || "university_only");
              setEditing(true);
            }}
            className="w-full py-2.5 rounded-[14px] bg-primary/10 text-primary text-[12px] font-semibold spring-tap"
          >
            {user?.matriculation_number ? "Edit" : "Add Matriculation Number"}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 block">Matriculation Number</label>
              <input
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="e.g. CSC/2026/01452"
                className="w-full px-3.5 h-[44px] rounded-[14px] bg-muted/50 border border-border/50 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Enter exactly as issued by your university.</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1.5 block">Who can see your matric number?</label>
              <div className="space-y-1.5">
                {MATRIC_PRIVACY_LEVELS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy(opt.value)}
                    className={
                      "w-full text-left p-2.5 rounded-[12px] border transition-all " +
                      (privacy === opt.value
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-muted/20")
                    }
                  >
                    <p className="text-[11px] font-semibold text-foreground">{opt.label}</p>
                    <p className="text-[9px] text-muted-foreground">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-destructive mb-2 px-1">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setError(""); }}
              disabled={saving}
              className="flex-1 py-2.5 rounded-[14px] bg-muted/50 text-muted-foreground text-[12px] font-semibold spring-tap"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !matricNumber.trim()}
              className="flex-1 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}