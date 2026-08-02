import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, MapPin, Globe, Users, Building2, Megaphone, Siren, CalendarDays, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ScreenShell from "@/components/layout/ScreenShell";
import { PROFILE_TABS, EMERGENCY_SEVERITY_META } from "@/components/university/universityConstants";
import ProfileOverview from "@/components/university/ProfileOverview";
import ProfileAnnouncements from "@/components/university/ProfileAnnouncements";
import ProfileStructure from "@/components/university/ProfileStructure";
import ProfileCatalog from "@/components/university/ProfileCatalog";
import ProfileCalendar from "@/components/university/ProfileCalendar";
import ProfileExams from "@/components/university/ProfileExams";
import ProfileEmergencies from "@/components/university/ProfileEmergencies";

const EASE = [0.16, 1, 0.3, 1];

export default function UniversityProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  // Fetch current user to resolve institution
  const { data: user } = useQuery({
    queryKey: ["uni-profile-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const institutionId = user?.data?.institution_id || user?.institution_id;

  // Fetch institution record
  const { data: institution, isLoading: instLoading } = useQuery({
    queryKey: ["uni-profile-institution", institutionId],
    queryFn: () => base44.entities.Institution.get(institutionId),
    enabled: !!institutionId,
    staleTime: 120000,
  });

  // Fetch active emergency notices (for badge count)
  const { data: emergencies } = useQuery({
    queryKey: ["uni-profile-emergencies", institutionId],
    queryFn: () => base44.entities.EmergencyNotice.filter({ institution_id: institutionId, status: "active" }, "-created_date", 50),
    enabled: !!institutionId,
    staleTime: 60000,
  });

  const activeEmergencyCount = (emergencies || []).filter((e) => e.status === "active").length;

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    setSearch("");
  }, []);

  return (
    <ScreenShell
      title="University Profile"
      back
      backTo="/me"
    >
      {/* Institution Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-5"
      >
        {instLoading ? (
          <div className="h-[140px] rounded-[20px] shimmer" />
        ) : institution ? (
          <div className="crystal-card overflow-hidden">
            {institution.banner_url && (
              <div className="h-20 overflow-hidden">
                <img src={institution.banner_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {institution.logo_url ? (
                  <img src={institution.logo_url} alt={institution.name} className="w-14 h-14 rounded-2xl object-cover border border-border/40" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl crystal-card flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-heading font-bold text-[16px] text-foreground leading-tight line-clamp-1">{institution.name}</h2>
                    {institution.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
                    )}
                  </div>
                  {institution.motto && (
                    <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1">"{institution.motto}"</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {institution.city && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {institution.city}{institution.country ? `, ${institution.country}` : ""}
                      </span>
                    )}
                    {institution.website && (
                      <a href={institution.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-primary spring-tap">
                        <Globe className="w-3 h-3" /> Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="crystal-card p-6 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" strokeWidth={1} />
            <p className="text-[13px] text-muted-foreground">No institution linked to your profile yet.</p>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {PROFILE_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          const showBadge = tab.key === "emergencies" && activeEmergencyCount > 0;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap flex items-center gap-1.5 transition-all flex-shrink-0 ${
                active ? "bg-foreground text-background" : "glass-card text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              {tab.label}
              {showBadge && (
                <span className="px-1 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold">{activeEmergencyCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search (hidden on overview) */}
      {activeTab !== "overview" && activeTab !== "emergencies" && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 spring-tap transition-colors"
          />
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {!institutionId ? (
            <div className="crystal-card p-8 text-center">
              <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
              <p className="text-[13px] text-muted-foreground">Link your institution to access verified university information.</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && <ProfileOverview institution={institution} institutionId={institutionId} onNavigate={handleTabChange} emergencyCount={activeEmergencyCount} />}
              {activeTab === "announcements" && <ProfileAnnouncements institutionId={institutionId} search={search} />}
              {activeTab === "structure" && <ProfileStructure institutionId={institutionId} search={search} />}
              {activeTab === "catalog" && <ProfileCatalog institutionId={institutionId} search={search} />}
              {activeTab === "calendar" && <ProfileCalendar institutionId={institutionId} search={search} />}
              {activeTab === "exams" && <ProfileExams institutionId={institutionId} search={search} />}
              {activeTab === "emergencies" && <ProfileEmergencies institutionId={institutionId} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </ScreenShell>
  );
}