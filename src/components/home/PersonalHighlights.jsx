import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

const PRESET_ICONS = ["📦", "🏆", "🔬", "🏫", "✈️", "👥", "💡", "🎯", "📚", "⭐"];

export default function PersonalHighlights() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📦");

  const { data: collections } = useQuery({
    queryKey: ["home-highlights"],
    queryFn: () => base44.entities.Collection.filter({ type: "personal" }, "-created_date", 20),
    staleTime: 30000,
  });

  const highlights = (collections || []).filter((c) => c.name);

  const handleCreate = async () => {
    if (!name.trim()) return toast({ title: "Enter a name", variant: "destructive" });
    try {
      await base44.entities.Collection.create({ name: name.trim(), type: "personal", icon: selectedIcon });
      toast({ title: "Highlight created ✓" });
      setName("");
      setSelectedIcon("📦");
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["home-highlights"] });
    } catch {
      toast({ title: "Could not create", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
        {/* New Highlight button */}
        <button
          onClick={() => setCreating(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 spring-tap"
        >
          <div
            className="w-16 h-16 rounded-full grid place-items-center"
            style={{
              background: "rgba(44, 33, 26, 0.6)",
              border: "2px dashed rgba(255, 138, 42, 0.35)",
            }}
          >
            <Plus className="w-6 h-6" strokeWidth={2} style={{ color: ORANGE }} />
          </div>
          <span className="text-[11px] font-medium" style={{ color: CREAM_MUTED }}>New</span>
        </button>

        {/* Existing highlights */}
        {highlights.map((h) => (
          <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 spring-tap">
            <div
              className="w-16 h-16 rounded-full grid place-items-center text-[26px]"
              style={{
                background: "linear-gradient(135deg, rgba(58, 42, 34, 0.9), rgba(44, 33, 26, 0.9))",
                border: "1px solid rgba(255, 138, 42, 0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {h.icon || "📦"}
            </div>
            <span className="text-[11px] font-medium max-w-[64px] truncate" style={{ color: CREAM }}>{h.name}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(4px)" }} onClick={() => setCreating(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="relative w-full max-w-[520px] rounded-t-[28px] p-5 pb-8 safe-area-pb"
              style={{ background: "rgba(44, 33, 26, 0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold" style={{ color: CREAM }}>New Highlight</h2>
                <button onClick={() => setCreating(false)} className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <X className="w-4 h-4" strokeWidth={2} style={{ color: CREAM_MUTED }} />
                </button>
              </div>
              <input
                autoFocus
                placeholder="Highlight name (e.g. Projects)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[48px] px-4 rounded-[14px] text-[15px] outline-none mb-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: CREAM }}
              />
              <p className="text-[12px] font-medium mb-2" style={{ color: CREAM_MUTED }}>Choose an icon</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className="w-12 h-12 rounded-[14px] grid place-items-center text-[22px] spring-tap transition-all"
                    style={selectedIcon === icon
                      ? { background: "rgba(255,138,42,0.15)", border: "2px solid rgba(255,138,42,0.4)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreate}
                className="w-full h-[52px] rounded-[16px] text-[15px] font-semibold spring-tap flex items-center justify-center gap-2"
                style={{ background: ORANGE, color: "#1A1006" }}
              >
                <Check className="w-5 h-5" strokeWidth={2.2} />
                Create Highlight
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}