import React from "react";
import { motion } from "framer-motion";
import { Siren, MapPin, Phone, ExternalLink, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { EMERGENCY_SEVERITY_META, formatDateTime } from "@/components/university/universityConstants";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileEmergencies({ institutionId }) {
  const { data: emergencies, isLoading } = useQuery({
    queryKey: ["uni-emergencies", institutionId],
    queryFn: () => base44.entities.EmergencyNotice.filter({ institution_id: institutionId, status: "active" }, "-created_date", 50),
    staleTime: 30000,
  });

  if (isLoading) {
    return <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-[100px] rounded-[18px] shimmer" />)}</div>;
  }

  if ((emergencies || []).length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={Siren}
          title="No active alerts"
          description="Your campus is all clear. Active emergency notices will appear here."
          budGuidance="No active alerts right now. Stay safe and focused on your studies."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {(emergencies || []).map((notice, i) => {
        const sevMeta = EMERGENCY_SEVERITY_META[notice.severity] || EMERGENCY_SEVERITY_META.warning;
        return (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
            className={`rounded-[18px] border p-3.5 ${sevMeta.border} ${sevMeta.bg}`}
          >
            <div className="flex items-start gap-2.5">
              <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 ${sevMeta.bg}`}>
                <Siren className={`w-5 h-5 ${sevMeta.color}`} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${sevMeta.bg} ${sevMeta.color}`}>{sevMeta.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-medium text-muted-foreground">{notice.category}</span>
                </div>
                <h3 className="font-heading font-bold text-[14px] text-foreground leading-snug">{notice.title}</h3>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{notice.message}</p>

                {notice.instructions && (
                  <div className="mt-2.5 p-2.5 rounded-[12px] bg-card/60 border border-border/30">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className={`w-3 h-3 ${sevMeta.color}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">What to do</span>
                    </div>
                    <p className="text-[11px] text-foreground leading-relaxed">{notice.instructions}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {notice.location && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {notice.location}
                    </span>
                  )}
                  {notice.contact_info && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Phone className="w-3 h-3" /> {notice.contact_info}
                    </span>
                  )}
                  <span className="text-[9px] text-muted-foreground">{formatDateTime(notice.created_date)}</span>
                </div>

                {notice.link_url && (
                  <a href={notice.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[10px] text-primary spring-tap font-medium mt-2">
                    More info <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}