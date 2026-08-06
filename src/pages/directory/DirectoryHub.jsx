import React from "react";
import { motion } from "framer-motion";
import { Search, Users, Building2, GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const CREAM_SUBTLE = "rgba(247, 240, 232, 0.15)";
const ORANGE = "#FF8A2A";

const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: "staff", label: "Staff", icon: GraduationCap },
  { key: "students", label: "Students", icon: Users },
  { key: "buildings", label: "Buildings", icon: Building2 },
];

export default function DirectoryHub() {
  const [tab, setTab] = React.useState("staff");
  const [query, setQuery] = React.useState("");

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["directory-staff", query],
    queryFn: () => base44.entities.Staff.filter(query ? { name: { $regex: query, $options: "i" } } : {}, "name", 50),
    staleTime: 30000,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["directory-students", query],
    queryFn: () => base44.entities.StudentRecord.filter(query ? { full_name: { $regex: query, $options: "i" } } : {}, "full_name", 50),
    staleTime: 30000,
  });

  const { data: institution } = useQuery({
    queryKey: ["directory-institution"],
    queryFn: () => base44.entities.Institution.list("name", 1),
    staleTime: 60000,
  });

  const buildings = (institution?.[0]?.campus_locations || []).filter((b) =>
    !query || (b?.name || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Directory</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Find staff, students & buildings</p>
        </div>
      </div>

      <div className="flex items-center gap-3 h-[48px] px-4 rounded-[16px] mb-4" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[14px]"
          style={{ color: CREAM }}
        />
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[14px] spring-tap transition-colors"
              style={{
                background: active ? "rgba(255,138,42,0.15)" : "rgba(44,33,26,0.4)",
                border: active ? "1px solid rgba(255,138,42,0.3)" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Icon className="w-[16px] h-[16px]" strokeWidth={2} style={{ color: active ? ORANGE : CREAM_MUTED }} />
              <span className="text-[13px] font-semibold" style={{ color: active ? ORANGE : CREAM_MUTED }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
        {tab === "staff" && <StaffList staff={staff || []} loading={staffLoading} />}
        {tab === "students" && <StudentList students={students || []} loading={studentsLoading} />}
        {tab === "buildings" && <BuildingList buildings={buildings} loading={false} />}
      </motion.div>
    </div>
  );
}

function StaffList({ staff, loading }) {
  if (loading) return <SkeletonList />;
  if (!staff.length) return <EmptyState label="No staff found" />;
  return (
    <div className="flex flex-col gap-3">
      {staff.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, ease: EASE }}
          className="glass-card p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}>
            <GraduationCap className="w-5 h-5" style={{ color: ORANGE }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold truncate" style={{ color: CREAM }}>{s.name}</p>
            <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{s.role || "Staff"}{s.department ? ` · ${s.department}` : ""}</p>
          </div>
          {s.email && <a href={`mailto:${s.email}`} className="w-9 h-9 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(255,255,255,0.05)" }}><Mail className="w-4 h-4" style={{ color: CREAM_MUTED }} /></a>}
        </motion.div>
      ))}
    </div>
  );
}

function StudentList({ students, loading }) {
  if (loading) return <SkeletonList />;
  if (!students.length) return <EmptyState label="No students found" />;
  return (
    <div className="flex flex-col gap-3">
      {students.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, ease: EASE }}
          className="glass-card p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full grid place-items-center shrink-0 overflow-hidden" style={{ background: "rgba(255,138,42,0.12)" }}>
            {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" loading="lazy" /> : <Users className="w-5 h-5" style={{ color: ORANGE }} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold truncate" style={{ color: CREAM }}>{s.full_name}</p>
            <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{s.department || "Student"}{s.level ? ` · ${s.level}L` : ""}</p>
          </div>
          {s.is_verified && <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>Verified</span>}
        </motion.div>
      ))}
    </div>
  );
}

function BuildingList({ buildings, loading }) {
  if (loading) return <SkeletonList />;
  if (!buildings.length) return <EmptyState label="No buildings found" />;
  return (
    <div className="flex flex-col gap-3">
      {buildings.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, ease: EASE }}
          className="glass-card p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}>
            <Building2 className="w-5 h-5" style={{ color: ORANGE }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold truncate" style={{ color: CREAM }}>{b.name || b.building || "Building"}</p>
            <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{b.description || b.type || "Campus location"}</p>
          </div>
          {b.code && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: CREAM_SUBTLE, color: CREAM }}>{b.code}</span>}
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded shimmer" />
            <div className="h-3 w-1/2 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full grid place-items-center mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
        <Search className="w-7 h-7" style={{ color: CREAM_MUTED }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: CREAM_MUTED }}>{label}</p>
    </div>
  );
}