import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock, MapPin, User, Bell, BellOff, ChevronRight,
  CalendarClock, Navigation, MessageSquare, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "@/components/ui/use-toast";

const LEAD_TIMES = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
];

export default function ClassReminderSystem() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isOnline = useOnlineStatus();

  const { data: timetable } = useQuery({
    queryKey: ["class-reminders", "timetable"],
    queryFn: () => base44.entities.TimetableEntry.list("start_time", 20),
    enabled: isOnline,
    staleTime: 60000,
  });

  const { data: prefs } = useQuery({
    queryKey: ["class-reminders", "prefs"],
    queryFn: () => base44.entities.ReminderPreference.list("-created_date", 1),
    enabled: isOnline,
  });

  const currentPref = prefs?.[0];
  const leadMinutes = currentPref?.reminder_lead_hours
    ? currentPref.reminder_lead_hours <= 1
      ? Math.round(currentPref.reminder_lead_hours * 60)
      : currentPref.reminder_lead_hours * 60
    : 15;

  const handleSetLeadTime = async (minutes) => {
    try {
      const hoursVal = minutes / 60;
      if (currentPref) {
        await base44.entities.ReminderPreference.update(currentPref.id, {
          reminder_lead_hours: hoursVal,
          meeting_reminders: true,
        });
      } else {
        await base44.entities.ReminderPreference.create({
          reminder_lead_hours: hoursVal,
          meeting_reminders: true,
          unibud_push: true,
        });
      }
      await qc.invalidateQueries({ queryKey: ["class-reminders", "prefs"] });
      toast({ title: "Reminder updated", description: `You'll be notified ${minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`} before class.` });
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleToggleReminders = async () => {
    if (!currentPref) return;
    try {
      await base44.entities.ReminderPreference.update(currentPref.id, {
        meeting_reminders: !currentPref.meeting_reminders,
      });
      await qc.invalidateQueries({ queryKey: ["class-reminders", "prefs"] });
    } catch (err) {
      // silent
    }
  };

  // Filter upcoming classes (today + next 7 days)
  const upcomingClasses = useMemo(() => {
    if (!timetable || timetable.length === 0) return [];
    const now = new Date();
    return timetable.filter((t) => {
      if (!t.date || !t.start_time) return false;
      const classDate = new Date(`${t.date}T${t.start_time}`);
      const diff = (classDate - now) / (1000 * 60 * 60 * 24);
      return diff >= -0.1 && diff <= 7;
    }).slice(0, 5);
  }, [timetable]);

  const remindersEnabled = currentPref?.meeting_reminders !== false;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">Class Reminders</h3>
        </div>
        <button
          onClick={handleToggleReminders}
          className={`flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
            remindersEnabled
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {remindersEnabled ? <Bell className="w-3 h-3" strokeWidth={2.2} /> : <BellOff className="w-3 h-3" strokeWidth={2.2} />}
          {remindersEnabled ? "On" : "Off"}
        </button>
      </div>

      {/* Lead time selector */}
      {remindersEnabled && (
        <div className="rounded-[16px] bg-card p-3" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <p className="text-[11px] font-bold text-muted-foreground mb-2">Notify me before class</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {LEAD_TIMES.map((lt) => (
              <button
                key={lt.value}
                onClick={() => handleSetLeadTime(lt.value)}
                className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                  leadMinutes === lt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming classes */}
      {upcomingClasses.length > 0 ? (
        <div className="space-y-2">
          {upcomingClasses.map((cls, i) => {
            const classDate = new Date(`${cls.date}T${cls.start_time}`);
            const isToday = classDate.toDateString() === new Date().toDateString();
            const isStartingSoon = (classDate - new Date()) / (1000 * 60) <= leadMinutes && (classDate - new Date()) / (1000 * 60) > -30;

            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-[16px] p-3 ${
                  isStartingSoon
                    ? "bg-destructive/5 border border-destructive/15"
                    : "bg-card"
                }`}
                style={!isStartingSoon ? { boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" } : {}}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                    isStartingSoon ? "bg-destructive/10" : "bg-primary/10"
                  }`}>
                    {isStartingSoon ? (
                      <Bell className="w-4 h-4 text-destructive" strokeWidth={2.2} />
                    ) : (
                      <CalendarClock className="w-4 h-4 text-primary" strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">
                      {cls.course_code || cls.course_name || cls.title || "Class"}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {cls.lecturer && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <User className="w-2.5 h-2.5" strokeWidth={2.2} />
                          {cls.lecturer}
                        </div>
                      )}
                      {(cls.location || cls.venue || cls.room) && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" strokeWidth={2.2} />
                          {cls.location || cls.venue || cls.room}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
                        {cls.start_time}
                        {isToday && <span className="text-primary font-bold ml-1">Today</span>}
                        {isStartingSoon && <span className="text-destructive font-bold ml-1">Starting soon</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-1.5 mt-2.5">
                  <button
                    onClick={() => navigate("/timetable")}
                    className="flex-1 flex items-center justify-center gap-1 h-7 rounded-[10px] bg-muted text-muted-foreground text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    <CalendarClock className="w-3 h-3" strokeWidth={2.2} />
                    Timetable
                  </button>
                  <button
                    onClick={() => navigate("/campus-map")}
                    className="flex-1 flex items-center justify-center gap-1 h-7 rounded-[10px] bg-muted text-muted-foreground text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    <Navigation className="w-3 h-3" strokeWidth={2.2} />
                    Map
                  </button>
                  <button
                    onClick={() => navigate("/bud")}
                    className="flex-1 flex items-center justify-center gap-1 h-7 rounded-[10px] bg-primary text-primary-foreground text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                    Ask Bud
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        remindersEnabled && (
          <div className="rounded-[16px] bg-card p-4 text-center" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <CalendarClock className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" strokeWidth={1.8} />
            <p className="text-[11px] text-muted-foreground">No upcoming classes in the next 7 days</p>
          </div>
        )
      )}
    </div>
  );
}