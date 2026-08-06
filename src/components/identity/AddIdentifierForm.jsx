import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { IDENTIFIER_TYPES } from "@/lib/identity/useIdentity";

/**
 * AddIdentifierForm — lets a student register a student ID / matric number
 * against their institution so it can be verified.
 */
export default function AddIdentifierForm({ onSubmit, defaultInstitution, loading }) {
  const [identifier_type, setType] = useState(IDENTIFIER_TYPES[0].key);
  const [identifier_value, setValue] = useState("");
  const [institution_name, setInstitution] = useState(defaultInstitution || "");
  const [open, setOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!identifier_value.trim() || !institution_name.trim()) return;
    onSubmit({ identifier_type, identifier_value: identifier_value.trim(), institution_name: institution_name.trim() });
    setValue("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[18px] glass-card text-[13px] font-semibold text-primary spring-tap"
      >
        <Plus className="w-4 h-4" /> Add Student ID
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[20px] p-4 glass-card space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">ID Type</span>
          <select
            value={identifier_type}
            onChange={(e) => setType(e.target.value)}
            className="oracle-input"
          >
            {IDENTIFIER_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Institution</span>
          <input
            value={institution_name}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. University of Lagos"
            className="oracle-input"
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground">ID Number</span>
        <input
          value={identifier_value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your student / matriculation number"
          className="oracle-input"
        />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-[14px] bg-muted/50 text-[12px] font-semibold text-muted-foreground spring-tap">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Save ID
        </button>
      </div>
    </form>
  );
}