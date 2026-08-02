import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Siren, CalendarDays, ClipboardList, GraduationCap, Building2, Users, BookOpen, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileOverview({ institution, institutionId, onNavigate, emergencyCount }) {
  const { data: announcements } = useQuery({
    queryKey: ["uni-overview-ann", institutionId],
    queryFn: () => base44.entities.StaffAnnouncement.filter({ institution_id: institutionId, status: "published" }, "-created_date", 5),
    staleTime: 60000,
  });

  const { data: emergencies } = useQuery({
    queryKey: ["uni-overview-emg", institutionId],
    queryFn: () => base44.entities.EmergencyNotice.filter({ institution_id: institutionId, status: "active" }, "-created_date", 3),
    staleTime: 30000,
  });

  const { data: faculties } = useQuery({
    queryKey: ["uni-overview-fac", institutionId],
    queryFn: () => base44.entities.Faculty.filter({ institution_id: institutionId, is_active: true }, "sort_order", 100),
    staleTime: 120000,
  });

  const { data: departments } = useQuery({
    queryKey: ["uni-overview-dept", institutionId],
    queryFn: () => base44.entities.Department.filter({ institution_id: institutionId, is_active: true }, "sort_order", 200),
    staleTime: 120000,
  });

  const { data: courses } = useQuery({
    queryKey: ["uni-overview-courses", institutionId],
    queryFn: () => base44.entities.CourseCatalogEntry.filter({ institution_id: institutionId, is_active: true }, "-created_date", 1),
    staleTime: 120000,
  });

  const stats = [
    { label: "Faculties", value: (faculties || []).length, icon: GraduationCap, tab: "structure" },
    { label: "Departments", value: (departments || []).length, icon: Building2, tab: "structure" },
    { label: "Courses", value: courses?.length || 0, icon: BookOpen, tab: "catalog" },
    { label: "Alerts", value: emergencyCount, icon: Siren, tab: "emergencies" },
  ];

  const quickLinks = [
    { label: "Announcements", icon: Megaphone, tab: "announcements", count: (announcements || []).length },
    { label: "Academic Calendar", icon: CalendarDays, tab: "calendar" },
    { label: "Exam Schedules", icon: ClipboardList, tab: "exams" },
    { label: "Faculties & Departments", icon: Building2, tab: "structure" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
              onClick={() => onNavigate(stat.tab)}
              className="crystal-card p-3 flex flex-col items-center gap-1 spring-tap"
            >
              <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
              <span className="font-heading font-bold text-[16px] text-foreground display-number">{stat.value}</span>
              <span className="text-[9px] text-muted-foreground font-medium">{stat.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Emergencies (if any) */}
      {(emergencies || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-2 px-1">Active Alerts</p>
          <div className="space-y-2">
            {(emergencies || []).slice(0, 2).map((e) => (
              <button
                key={e.id}
                onClick={() => onNavigate("emergencies")}
                className="w-full text-left p-3.5 rounded-[16px] border border-destructive/30 bg-destructive/5 spring-tap"
              >
                <div className="flex items-start gap-2">
                  <Siren className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground line-clamp-1">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{e.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Latest Announcements */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latest Announcements</p>
          <button onClick={() => onNavigate("announcements")} className="text-[10px] text-primary spring-tap flex items-center gap-0.5">
            All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {(announcements || []).length === 0 ? (
          <div className="crystal-card">
            <EmptyState icon={Megaphone} title="No announcements" description="Official announcements will appear here." />
          </div>
        ) : (
          <div className="space-y-2">
            {(announcements || []).slice(0, 3).map((a) => (
              <div key={a.id} className="crystal-card p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  {a.pinned && <span className="text-[9px] font-bold text-primary">📌 Pinned</span>}
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                    a.priority === "urgent" ? "bg-destructive/10 text-destructive"
                    : a.priority === "high" ? "bg-warning/10 text-warning"
                    : "bg-muted/30 text-muted-foreground"
                  }`}>{a.priority}</span>
                </div>
                <p className="text-[13px] font-bold text-foreground line-clamp-1">{a.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{a.message}</p>
                {a.author_name && <p className="text-[9px] text-muted-foreground mt-1.5">— {a.author_name}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Quick Access</p>
        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => onNavigate(link.tab)}
                className="crystal-card p-3 flex items-center gap-2.5 spring-tap text-left"
              >
                <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground line-clamp-1">{link.label}</p>
                  {link.count !== undefined && <p className="text-[9px] text-muted-foreground">{link.count} published</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution Description */}
      {institution?.description && (
        <div className="crystal-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">About</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{institution.description}</p>
        </div>
      )}
    </div>
  );
}