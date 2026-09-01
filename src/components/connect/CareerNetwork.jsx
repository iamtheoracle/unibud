import React from "react";
import { Briefcase, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_OPPS = [
  { id: "d1", title: "Software Engineering Intern", organization: "Paystack", type: "internship", location: "Lagos, NG", link: "" },
  { id: "d2", title: "Frontend Developer (Graduate)", organization: "Flutterwave", type: "job", location: "Remote", link: "" },
  { id: "d3", title: "Data Analyst Trainee", organization: "Kuda Bank", type: "internship", location: "Lagos, NG", link: "" },
];

export default function CareerNetwork() {
  const { isDemoMode } = useDemoMode();

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["careerNetworkOpps"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 5),
    enabled: !isDemoMode,
  });

  const opps = isDemoMode ? DEMO_OPPS : (opportunities || []).filter((o) => o.type === "job" || o.type === "internship").slice(0, 4);

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Briefcase className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Career Network</h3>
      </div>
      {isLoading && !isDemoMode ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-[20px] shimmer" />)}
        </div>
      ) : opps.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Briefcase} title="No career opportunities" description="Jobs and internships will appear here" action={<Link to="/opportunities" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Browse Opportunities</Link>} />
        </div>
      ) : (
        <div className="space-y-2.5">
          {opps.map((opp, i) => (
            <motion.div
              key={opp.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 card-hover"
            >
              <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[13px] text-foreground truncate">{opp.title}</p>
                <p className="text-[11px] text-muted-foreground">{opp.organization}{opp.type ? " · " + opp.type : ""}</p>
                {opp.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{opp.location}</span>
                  </div>
                )}
              </div>
              {opp.link ? (
                <a href={opp.link} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">Apply</a>
              ) : (
                <Link to="/opportunities" className="px-3.5 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-semibold spring-tap">View</Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}