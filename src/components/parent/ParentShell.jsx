import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, UserRound } from "lucide-react";
import UDSButton from "@/components/uds/UDSButton";

export default function ParentShell({ user, studentName, active, onActive, sections, onBack, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <button key={s.id} onClick={() => { onActive(s.id); setMobileOpen(false); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium spring-tap ${active === s.id ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
            <Icon className="w-[18px] h-[18px] shrink-0" /><span className="truncate">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-4 py-5 border-b border-sidebar-border">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Parent Portal</p>
      <h1 className="text-[16px] font-heading font-semibold leading-tight mt-1 truncate flex items-center gap-2"><UserRound className="w-4 h-4 text-primary" />{user?.full_name || "Guardian"}</h1>
      <p className="text-[12px] text-muted-foreground mt-0.5 truncate">Monitoring: {studentName || "—"}</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        {brand}
        <div className="flex-1 overflow-y-auto no-scrollbar">{nav}</div>
        <div className="p-3 border-t border-sidebar-border">
          <UDSButton variant="secondary" size="sm" className="w-full" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back to Campus</UDSButton>
        </div>
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 380, damping: 36 }} className="fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-sidebar flex flex-col md:hidden">
              <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border"><span className="font-heading font-semibold text-[15px]">Parent Portal</span><button onClick={() => setMobileOpen(false)} className="p-1"><X className="w-5 h-5" /></button></div>
              <div className="flex-1 overflow-y-auto no-scrollbar">{nav}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
          <button className="md:hidden p-2 rounded-lg hover:bg-muted/60" onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu className="w-5 h-5" /></button>
          <div className="flex-1 min-w-0"><h2 className="text-[15px] font-heading font-semibold truncate">{sections.find((s) => s.id === active)?.label}</h2></div>
          <span className="text-[12px] text-muted-foreground hidden sm:block truncate max-w-[220px]">{studentName}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}