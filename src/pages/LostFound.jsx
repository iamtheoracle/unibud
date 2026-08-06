import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Package } from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import LostFoundCard from "@/components/campus/LostFoundCard";
import LostFoundReportModal from "@/components/campus/LostFoundReportModal";
import { LOST_FOUND_CATEGORIES, getIcon } from "@/components/campus/campusConstants";

const DEMO_ITEMS = [
  {
    id: "dlf1", title: "Black Samsung Galaxy Phone", type: "lost", category: "phone",
    description: "Lost near the library entrance. Has a clear case with a crack on the top right.",
    location: "Library", date_lost_found: "2026-07-09",
    reporter_name: "Chidi Okafor", reporter_image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80",
    status: "active", accent_color: "0 72% 51%",
  },
  {
    id: "dlf2", title: "Student ID Card", type: "found", category: "id_card",
    description: "Found in Lecture Theatre 2. Name on card: Adaeze Okafor, CSC 300L.",
    location: "LT 2, Faculty of Science", date_lost_found: "2026-07-10",
    reporter_name: "Fatima Bello", reporter_image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
    status: "active", accent_color: "142 71% 45%",
  },
  {
    id: "dlf3", title: "Brown Leather Wallet", type: "lost", category: "wallet",
    description: "Brown leather, contains student ID and some cash. Lost at the cafeteria.",
    location: "Cafeteria", date_lost_found: "2026-07-08",
    reporter_name: "Emeka Nwosu", reporter_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    status: "active", accent_color: "0 72% 51%",
  },
  {
    id: "dlf4", title: "HP Laptop Charger", type: "found", category: "electronics",
    description: "Found in Hall 3 common room. Black HP charger with blue tip.",
    location: "Hall 3", date_lost_found: "2026-07-07",
    reporter_name: "Grace Adebayo", reporter_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    status: "active", accent_color: "142 71% 45%",
  },
  {
    id: "dlf5", title: "Set of Keys with Lanyard", type: "lost", category: "keys",
    description: "Blue lanyard with 3 keys and a small keychain. Lost near the sports complex.",
    location: "Sports Complex", date_lost_found: "2026-07-06",
    reporter_name: "Daniel Okonkwo", reporter_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    status: "active", accent_color: "0 72% 51%",
  },
];

export default function LostFound() {
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("lost");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reportOpen, setReportOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["lostFoundItems", user?.university],
    queryFn: () => base44.entities.LostFoundItem.filter(
      { university: user?.university || "", status: "active" },
      "-created_date",
      50
    ),
    enabled: !isDemoMode && !!user,
  });

  const displayItems = isDemoMode ? DEMO_ITEMS : (items || []);

  const filtered = useMemo(() => {
    return displayItems.filter((item) => {
      const matchesTab = item.type === tab;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch = !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [displayItems, tab, categoryFilter, search]);

  const handleContact = () => {
    if (isDemoMode) return;
  };

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["lostFoundItems"] });
  };

  const CATEGORY_KEYS = ["all", ...Object.keys(LOST_FOUND_CATEGORIES)];

  return (
    <ScreenShell title="Lost & Found" subtitle="Help reunite items with owners" back
      actions={<button onClick={() => isDemoMode ? null : setReportOpen(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ice-glow spring-tap" aria-label="Report item"><Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} /></button>}>

      {/* Search */}
      <div className="py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
      </div>

      {/* Lost / Found Toggle */}
      <div className="mb-3">
        <div className="bg-muted/50 rounded-[14px] p-1 flex">
          <button
            onClick={() => setTab("lost")}
            className={"flex-1 py-2.5 rounded-[11px] text-[12px] font-semibold transition-all spring-tap " + (tab === "lost" ? "bg-error text-error-foreground soft-shadow" : "text-muted-foreground")}
          >
            🔍 Lost Items
          </button>
          <button
            onClick={() => setTab("found")}
            className={"flex-1 py-2.5 rounded-[11px] text-[12px] font-semibold transition-all spring-tap " + (tab === "found" ? "bg-success text-success-foreground soft-shadow" : "text-muted-foreground")}
          >
            ✋ Found Items
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {CATEGORY_KEYS.map((key) => {
            const meta = key === "all" ? { label: "All" } : LOST_FOUND_CATEGORIES[key];
            const Icon = key === "all" ? null : getIcon(meta.icon);
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={
                  "px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all spring-tap flex items-center gap-1 " +
                  (categoryFilter === key
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground border border-border/40")
                }
              >
                {Icon && <Icon className="w-2.5 h-2.5" />}
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex gap-3">
              <div className="w-16 h-16 rounded-[14px] shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 shimmer rounded-full" />
                <div className="h-2 w-2/3 shimmer rounded-full" />
                <div className="h-2 w-1/2 shimmer rounded-full" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={`No ${tab} items`}
            description={search ? "Try a different search." : `No ${tab} items have been reported yet.`}
            action={!isDemoMode && (
              <button
                onClick={() => setReportOpen(true)}
                className="px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap gold-glow"
              >
                Report {tab === "lost" ? "Lost" : "Found"} Item
              </button>
            )}
          />
        ) : (
          filtered.map((item, i) => (
            <LostFoundCard key={item.id} item={item} user={user} index={i} onContact={handleContact} />
          ))
        )}
      </div>

      {!isDemoMode && (
        <LostFoundReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          user={user}
          onCreated={handleCreated}
        />
      )}
    </ScreenShell>
  );
}