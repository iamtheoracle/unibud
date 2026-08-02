import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, GraduationCap, Building2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFriends } from "@/lib/social/useFriends";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import DiscoverStudentCard from "@/components/discover/DiscoverStudentCard";
import ProfilePreviewSheet from "@/components/discover/ProfilePreviewSheet";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ForYou — Campus Connections discovery page.
 * Real student networking based on shared university, faculty,
 * department, interests, and real social signals. Zero demo data.
 */
export default function ForYou() {
  const { toast } = useToast();
  const { meId, isFriend, hasPending, send } = useFriends();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 120000,
  });

  // Determine effective search query — user input or active filter
  const effectiveQuery = useMemo(() => {
    if (search.trim().length >= 2) return search.trim();
    if (activeFilter === "university" && currentUser?.data?.university) return currentUser.data.university;
    if (activeFilter === "faculty" && currentUser?.data?.faculty) return currentUser.data.faculty;
    if (activeFilter === "department" && currentUser?.data?.department) return currentUser.data.department;
    return "";
  }, [search, activeFilter, currentUser]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["discover-students", effectiveQuery],
    queryFn: async () => {
      const res = await base44.functions.invoke("smartUserSearch", { query: effectiveQuery, limit: 50 });
      return res.data?.results || res.results || [];
    },
    enabled: effectiveQuery.length >= 2,
    staleTime: 30000,
  });

  // Filter out self and sort by relevance (same faculty/department/interests)
  const sortedResults = useMemo(() => {
    const filtered = results.filter((u) => u.id !== meId);
    if (!currentUser) return filtered;
    return filtered.sort((a, b) => computeRelevance(b, currentUser) - computeRelevance(a, currentUser));
  }, [results, meId, currentUser]);

  const handleAddFriend = async (user) => {
    try {
      send({ recipientId: user.id, recipientName: user.full_name });
      toast({ title: "Connection request sent!", description: `${user.full_name} will be notified.` });
    } catch {
      toast({ title: "Couldn't send request", variant: "destructive" });
    }
  };

  const handleMessage = (user) => {
    window.location.href = `/messages`;
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl safe-area-pt">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grid place-items-center bg-muted/40">
              <Users className="w-4 h-4 text-foreground" strokeWidth={1.8} />
            </div>
            <h1 className="text-[20px] font-bold tracking-tight text-foreground">Discover</h1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveFilter(null); }}
            placeholder="Search by name, faculty, or department…"
            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full glass grid place-items-center spring-tap">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Quick filters */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            <FilterPill icon={Building2} label="My University" active={activeFilter === "university"} onClick={() => setActiveFilter(activeFilter === "university" ? null : "university")} />
            <FilterPill icon={GraduationCap} label="My Faculty" active={activeFilter === "faculty"} onClick={() => setActiveFilter(activeFilter === "faculty" ? null : "faculty")} />
            <FilterPill icon={Users} label="My Department" active={activeFilter === "department"} onClick={() => setActiveFilter(activeFilter === "department" ? null : "department")} />
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[18px] shimmer" />)}
            </motion.div>
          ) : sortedResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col items-center text-center py-16 px-6"
            >
              <div className="w-14 h-14 rounded-full grid place-items-center mb-3 crystal-card edge-light">
                <Users className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-bold text-foreground">{effectiveQuery ? "No students found" : "Find your campus community"}</p>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-[260px] leading-relaxed">
                {effectiveQuery
                  ? "Try a different search term, or filter by your university, faculty, or department."
                  : "Search by name, faculty, or department — or use the quick filters above to discover classmates."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="space-y-2.5"
            >
              {sortedResults.map((user, i) => (
                <DiscoverStudentCard
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  index={i}
                  isFriend={isFriend(user.id)}
                  hasPending={hasPending(user.id)}
                  onAddFriend={handleAddFriend}
                  onMessage={handleMessage}
                  onViewProfile={(u) => { hapticTap(); setSelectedUser(u); }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfilePreviewSheet
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(v) => !v && setSelectedUser(null)}
        isFriend={selectedUser ? isFriend(selectedUser.id) : false}
        hasPending={selectedUser ? hasPending(selectedUser.id) : false}
        onAddFriend={handleAddFriend}
        onMessage={handleMessage}
      />
    </div>
  );
}

function computeRelevance(user, currentUser) {
  let score = 0;
  const ud = user.data || {};
  const cd = currentUser.data || {};
  if (ud.university && cd.university && ud.university === cd.university) score += 2;
  if (ud.faculty && cd.faculty && ud.faculty === cd.faculty) score += 3;
  if (ud.department && cd.department && ud.department === cd.department) score += 5;
  const myInterests = cd.interests || [];
  const theirInterests = ud.interests || [];
  score += theirInterests.filter((i) => myInterests.includes(i)).length * 2;
  return score;
}

function FilterPill({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={() => { hapticTap(); onClick(); }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap transition-all ${
        active ? "bg-foreground text-background" : "glass text-muted-foreground"
      }`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}