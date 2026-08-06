import React, { useEffect, useState } from "react";
import { Command, Search, Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagementShell({ user, institutionName, modules, active, onActive, children }) {
  const [palette, setPalette] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") { setPalette(false); setMobileNav(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = [...new Set(modules.map((m) => m.group))];
  const filtered = modules.filter((m) => !q || m.label.toLowerCase().includes(q.toLowerCase()));

  const go = (id) => { onActive(id); setMobileNav(false); setPalette(false); setQ(""); };

  const NavList = () => groups.map((g) => (
    <div key={g} className="mb-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 mb-1">{g}</p>
      {filtered.filter((m) => m.group === g).map((m) => {
        const Icon = m.icon;
        return (
          <button key={m.id} onClick={() => go(m.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors", active === m.id ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-muted/40")}>
            <Icon className="w-4 h-4 shrink-0" /> <span className="truncate">{m.label}</span>
          </button>
        );
      })}
    </div>
  ));

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="hidden lg:flex w-[240px] flex-col border-r border-border bg-sidebar/40 shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary/15 grid place-items-center"><Command className="w-4 h-4 text-primary" /></div>
          <div className="min-w-0"><p className="font-heading font-bold text-[14px] truncate">Management</p><p className="text-[10px] text-muted-foreground truncate">{institutionName || "Console"}</p></div>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar p-2"><NavList /></nav>
      </aside>

      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
          <div className="relative w-[260px] h-full glass-strong border-r border-border p-2 overflow-y-auto no-scrollbar"><NavList /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted/40" onClick={() => setMobileNav(true)}><MenuIcon className="w-5 h-5" /></button>
          <button onClick={() => setPalette(true)} className="flex items-center gap-2 h-9 px-3 rounded-xl glass text-muted-foreground text-[13px] flex-1 max-w-[420px]">
            <Search className="w-4 h-4" /><span className="flex-1 text-left">Search modules…</span><kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 font-mono">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-right hidden sm:block"><p className="text-[12px] font-semibold leading-tight">{user?.full_name || "Manager"}</p><p className="text-[10px] text-muted-foreground capitalize">{user?.role || ""}</p></div>
            <div className="w-8 h-8 rounded-full bg-primary/20 grid place-items-center text-[12px] font-bold text-primary">{(user?.full_name || "M").slice(0, 1)}</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6">{children}</main>
      </div>

      {palette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPalette(false)} />
          <div className="relative w-full max-w-[520px] glass-strong rounded-2xl overflow-hidden fade-in-up">
            <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to module…" className="flex-1 bg-transparent outline-none text-[14px]" />
              <button onClick={() => setPalette(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto no-scrollbar p-2">
              {filtered.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-6">No modules found</p>}
              {filtered.map((m) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => go(m.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 text-left">
                    <Icon className="w-4 h-4 text-primary" />
                    <div className="min-w-0"><p className="text-[13px] font-medium">{m.label}</p><p className="text-[11px] text-muted-foreground truncate">{m.desc}</p></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}