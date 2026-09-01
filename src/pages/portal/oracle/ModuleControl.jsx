import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, StatusPill } from "@/components/portal/PortalUI";
import { PLATFORM_MODULES, MODULE_CATEGORIES } from "@/lib/portalConfig";
import {
  Home, Compass, Users, Sparkles, Library, Bell, Search as SearchIcon, User, Settings,
  ClipboardList, FileText, CalendarDays, Video, FlaskConical, UsersRound, Heart, CalendarHeart,
  Award, Briefcase, ShoppingBag, TrendingUp, MapPin, Building2, Bus, UtensilsCrossed,
  HeartHandshake, GraduationCap, Layers, Building, Landmark, BarChart3, LineChart, Bot,
  Image, FileEdit, LifeBuoy, Shield, Boxes, CheckCircle2, XCircle,
} from "lucide-react";

const ICON_MAP = {
  Home, Compass, Users, Sparkles, Library, Bell, Search: SearchIcon, User, Settings,
  ClipboardList, FileText, CalendarDays, Video, FlaskConical, UsersRound, Heart, CalendarHeart,
  Award, Briefcase, ShoppingBag, TrendingUp, MapPin, Building2, Bus, UtensilsCrossed,
  HeartHandshake, GraduationCap, Layers, Building, Landmark, BarChart3, LineChart, Bot,
  Image, FileEdit, LifeBuoy, Shield,
};

export default function ModuleControl() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [confirmAction, setConfirmAction] = useState(null);

  const { data: dbModules } = useQuery({
    queryKey: ["portalModules"],
    queryFn: () => base44.entities.PlatformModule.list(),
    retry: false,
  });

  // Merge DB state with config defaults
  const moduleMap = {};
  if (dbModules) {
    dbModules.forEach((m) => { moduleMap[m.key] = m; });
  }
  const allModules = PLATFORM_MODULES.map((m) => ({
    ...m,
    enabled: moduleMap[m.key]?.enabled ?? m.enabled,
    _id: moduleMap[m.key]?.id,
  }));

  const filtered = allModules.filter((m) => {
    const matchesSearch = !search ||
      m.display_name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = allModules.filter((m) => m.enabled).length;
  const disabledCount = allModules.length - enabledCount;

  const handleToggle = async (mod) => {
    // If disabling, show confirmation
    if (mod.enabled) {
      setConfirmAction(mod);
      return;
    }
    await executeToggle(mod);
  };

  const executeToggle = async (mod) => {
    const newEnabled = !mod.enabled;
    try {
      if (mod._id) {
        await base44.entities.PlatformModule.update(mod._id, { enabled: newEnabled });
      } else {
        await base44.entities.PlatformModule.create({
          key: mod.key,
          display_name: mod.display_name,
          description: mod.description,
          category: mod.category,
          icon: mod.icon,
          enabled: newEnabled,
          sort_order: mod.sort_order,
        });
      }
      // Create audit log
      await base44.entities.AuditLog.create({
        action: newEnabled ? "module_enabled" : "module_disabled",
        actor_name: "Oracle",
        actor_role: "oracle",
        target_type: "module",
        target_name: mod.display_name,
        details: `Module "${mod.display_name}" was ${newEnabled ? "enabled" : "disabled"} globally.`,
        severity: newEnabled ? "info" : "warning",
      });
      queryClient.invalidateQueries({ queryKey: ["portalModules"] });
      queryClient.invalidateQueries({ queryKey: ["portalAuditLogs"] });
    } catch (err) {
      console.error("Failed to toggle module:", err);
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Module Control Center</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Enable or disable any platform module globally. Changes take effect instantly.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Boxes} label="Total Modules" value={allModules.length} accent="primary" />
        <KpiCard icon={CheckCircle2} label="Enabled" value={enabledCount} accent="success" />
        <KpiCard icon={XCircle} label="Disabled" value={disabledCount} accent="error" />
        <KpiCard icon={Layers} label="Categories" value={MODULE_CATEGORIES.length} accent="info" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-colors ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border/30"
            }`}
          >
            All
          </button>
          {MODULE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod, i) => {
          const Icon = ICON_MAP[mod.icon] || Boxes;
          const cat = MODULE_CATEGORIES.find((c) => c.key === mod.category);
          return (
            <motion.div
              key={mod.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-card rounded-2xl p-5 border border-border/40 soft-shadow ${!mod.enabled ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <button
                  onClick={() => handleToggle(mod)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${mod.enabled ? "bg-success" : "bg-border"}`}
                >
                  <motion.div
                    animate={{ x: mod.enabled ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-[14px] text-foreground">{mod.display_name}</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{mod.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{cat?.label}</span>
                <StatusPill status={mod.enabled ? "enabled" : "disabled"} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-muted-foreground">No modules match your search.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/40 elevated-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[16px] text-foreground">Disable {confirmAction.display_name}?</h3>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      This will immediately remove {confirmAction.display_name} from navigation, search, dashboards, and all API requests across the platform. The module will behave as if it never existed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 h-11 rounded-xl bg-muted text-foreground font-semibold text-[14px] hover:bg-muted/70 transition-colors spring-tap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeToggle(confirmAction)}
                    className="flex-1 h-11 rounded-xl bg-error text-error-foreground font-semibold text-[14px] hover:bg-error/90 transition-colors spring-tap"
                  >
                    Disable Module
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}