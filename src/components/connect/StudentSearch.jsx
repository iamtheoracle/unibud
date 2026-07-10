import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, ChevronDown, Users, Loader2 } from "lucide-react";
import { useEntityInfinite } from "@/hooks/useEntityInfinite";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 15;

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recently Active" },
  { key: "course", label: "Course Mates" },
  { key: "study", label: "Study Partners" },
  { key: "mutual", label: "Mutual Connections" },
  { key: "new", label: "New Students" },
];

/**
 * Scalable student search with infinite scrolling and server-side filtering.
 * Never loads all students at once — uses cursor-based pagination.
 */
export default function StudentSearch({ university, enabled = true }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = React.useMemo(() => {
    const q = {};
    if (university) q.university = university;
    if (debouncedSearch) {
      q.$or = [
        { full_name: { $regex: debouncedSearch, $options: "i" } },
        { email: { $regex: debouncedSearch, $options: "i" } },
      ];
    }
    return q;
  }, [university, debouncedSearch]);

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useEntityInfinite({
    entityName: "SocialConnection",
    queryKey: ["studentSearch", university, debouncedSearch, activeFilter],
    query,
    pageSize: PAGE_SIZE,
    enabled: enabled && !!university,
    cacheKey: null,
  });

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Discover Classmates</h3>
        <span className="text-[11px] text-muted-foreground">Scroll for more</span>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, matric number, or email..."
            className="w-full pl-10 pr-9 py-2.5 rounded-[14px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 mb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={
                "px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all spring-tap " +
                (activeFilter === opt.key
                  ? "bg-foreground text-background soft-shadow"
                  : "bg-card text-muted-foreground border border-border/40")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student list with infinite scroll */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[145px] h-[180px] rounded-[20px] shimmer flex-shrink-0" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState
              icon={Users}
              title={debouncedSearch ? "No students found" : "No connections yet"}
              description={debouncedSearch ? "Try a different name or filter." : "Connect with classmates to build your network."}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {items.map((student, i) => (
                <StudentCard key={student.id || i} student={student} index={i} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-3">
              {isFetchingNextPage && (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student, index }) {
  const name = student.full_name || student.username || student.name || "Student";
  const dept = student.department || student.faculty || "";
  const avatar = student.avatar_url || student.image || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
      className="bg-card rounded-[18px] soft-shadow border border-border/20 p-3 card-hover"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-16 rounded-[12px] object-cover mb-2" />
      ) : (
        <div className="w-full h-16 rounded-[12px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2">
          <span className="text-[16px] font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <p className="font-heading font-semibold text-[11px] text-foreground truncate">{name}</p>
      {dept && <p className="text-[9px] text-muted-foreground truncate">{dept}</p>}
    </motion.div>
  );
}