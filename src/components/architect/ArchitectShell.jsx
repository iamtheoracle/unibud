import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Command, ChevronRight, ArrowLeft, Keyboard } from "lucide-react";
import CommandPalette from "@/components/oracle/CommandPalette";
import { moduleById } from "@/lib/architect/modules";

export default function ArchitectShell({ user, modules, active, onActive, children }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => {
    const g = {};
    modules.forEach((m) => (g[m.group] = g[m.group] || []).push(m));
    return g;
  }, [modules]);

  const activeModule = moduleById(active);

  const NavList = (
    <nav className="flex flex-col gap-4 px-3 py-4 overflow-y-auto no-scrollbar">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 px-2 mb-1.5">{group}</p>
          <div className="space-y-0.5">
            {items.map((m) => {
              const Icon = m.icon;
              const on = active === m.id;
              return (
                <button key={m.id} onClick={() => { onActive(m.id); setMobileNav(false); }} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium spring-tap ${on ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                  <Icon className="w-[16px] h-[16px] shrink-0" /><span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = (
    <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/20 grid place-items-center"><Command className="w-4 h-4 text-primary" /></div>
      <div><p className="text-[14px] font-heading font-bold leading-none">Architect</p><p className="text-[10px] text-muted-foreground mt-0.5">Platform Builder · via Oracle</p></div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <aside className="hidden lg:flex w-[244px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        {Brand}
        <div className="flex-1 min-h-0">{NavList}</div>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link to="/oracle" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-muted-foreground bg-muted/40 hover:bg-muted/70 spring-tap">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Oracle
          </Link>
          <button onClick={() => setPaletteOpen(true)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-muted-foreground bg-muted/40 hover:bg-muted/70">
            <Search className="w-3.5 h-3.5" /><span>Search…</span><span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/70">⌘K</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", stiffness: 380, damping: 36 }} className="fixed top-0 left-0 bottom-0 z-50 w-[244px] bg-sidebar flex flex-col lg:hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border"><span className="font-heading font-bold text-[14px]">Architect</span><button onClick={() => setMobileNav(false)}><X className="w-5 h-5" /></button></div>
              <div className="flex-1 min-h-0">{NavList}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-border bg-background/80 backdrop-blur-xl">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted/60" onClick={() => setMobileNav(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground hidden md:flex">
            <Link to="/oracle" className="hover:text-foreground">Oracle</Link><ChevronRight className="w-3.5 h-3.5" /><span>Architect</span><ChevronRight className="w-3.5 h-3.5" /><span className="text-foreground font-medium">{activeModule?.label}</span>
          </div>
          <div className="flex-1 max-w-[420px] ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setPaletteOpen(true)} placeholder="Search builders…" className="w-full h-9 pl-9 pr-16 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:border-primary/50" />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/70 text-muted-foreground">⌘K</kbd>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg" title="Keyboard shortcuts">
            <Keyboard className="w-3.5 h-3.5" /><span>⌘Z · ⌘S · ⌘P</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 grid place-items-center text-[12px] font-heading font-bold text-primary">{(user?.full_name || "A").charAt(0)}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} modules={modules} onActive={onActive} />
    </div>
  );
}