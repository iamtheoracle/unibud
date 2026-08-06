import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";

export default function CommandPalette({ open, onClose, modules, onActive }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    const list = term ? modules.filter((m) => (m.label + " " + m.desc + " " + m.group).toLowerCase().includes(term)) : modules;
    return list.slice(0, 8);
  }, [q, modules]);

  useEffect(() => { if (open) { setQ(""); setSel(0); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    if (e.key === "Enter") { e.preventDefault(); const m = results[sel]; if (m) { onActive(m.id); onClose(); } }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 32 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] glass-strong rounded-2xl overflow-hidden shadow-elevated">
            <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search modules and actions…" className="flex-1 bg-transparent text-[14px] focus:outline-none" />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-[360px] overflow-y-auto no-scrollbar p-2">
              {results.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">No results</p>}
              {results.map((m, i) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onMouseEnter={() => setSel(i)} onClick={() => { onActive(m.id); onClose(); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${i === sel ? "bg-primary/15" : ""}`}>
                    <Icon className={`w-4 h-4 ${i === sel ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0"><p className="text-[13px] font-medium truncate">{m.label}</p><p className="text-[11px] text-muted-foreground truncate">{m.desc}</p></div>
                    <span className="text-[10px] text-muted-foreground">{m.group}</span>
                    {i === sel && <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}