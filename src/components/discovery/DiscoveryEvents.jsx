import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Events — real upcoming CampusEvent records. RSVP toggles real attendance.
export default function DiscoveryEvents({ user }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);

  const { data } = useQuery({
    queryKey: ["discoveryEvents"],
    queryFn: () => base44.entities.CampusEvent.filter({ status: "upcoming" }, "date", 10),
    enabled: !!user,
  });

  const today = new Date(new Date().toDateString());
  const events = (data || []).filter((e) => e.date && new Date(e.date) >= today);
  if (events.length === 0) return null;

  const isGoing = (e) => (e.rsvp_list || []).some((r) => r.user_id === user?.id);

  const toggleRsvp = async (e) => {
    if (!user) return;
    setBusy(e.id);
    try {
      const list = e.rsvp_list || [];
      const going = isGoing(e);
      const newList = going
        ? list.filter((r) => r.user_id !== user.id)
        : [...list, { user_id: user.id, name: user.full_name, status: "going", rsvp_at: new Date().toISOString() }];
      await base44.entities.CampusEvent.update(e.id, { rsvp_list: newList, attendees_count: newList.length });
      qc.invalidateQueries({ queryKey: ["discoveryEvents"] });
    } catch {
      // RLS may restrict
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Events</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
        {events.map((e, i) => {
          const going = isGoing(e);
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex-shrink-0 w-[220px] rounded-2xl bg-card border border-border/30 overflow-hidden"
            >
              {e.banner_url && <img src={e.banner_url} alt="" className="w-full h-20 object-cover" />}
              <div className="p-3.5">
                <p className="font-heading font-semibold text-[13px] text-foreground line-clamp-1">{e.title}</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
                {e.location && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" /><span className="truncate">{e.location}</span>
                  </div>
                )}
                <button
                  onClick={() => toggleRsvp(e)}
                  disabled={busy === e.id}
                  className={"w-full mt-2.5 h-8 rounded-full text-[11px] font-semibold spring-tap disabled:opacity-50 " + (going ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}
                >
                  {going ? "Going ✓" : "RSVP"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}