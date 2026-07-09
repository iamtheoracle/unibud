import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Clock, MapPin, Calendar } from "lucide-react";

const mockClasses = [
  { code: "CSC 301", title: "Data Structures", time: "8:00 AM", endTime: "10:00 AM", location: "LT 5", color: "from-blue-500 to-blue-600", isNow: true },
  { code: "MTH 201", title: "Linear Algebra", time: "11:00 AM", endTime: "1:00 PM", location: "Room 204", color: "from-purple-500 to-purple-600", isNow: false },
  { code: "PHY 203", title: "Quantum Mechanics", time: "2:00 PM", endTime: "4:00 PM", location: "Lab 3", color: "from-emerald-500 to-emerald-600", isNow: false },
];

export default function TodayScheduleCard() {
  return (
    <div>
      <SectionHeader title="Today's Classes" subtitle="3 classes remaining" icon={Calendar} action="Timetable" actionLink="/academics" />
      <div className="space-y-2">
        {mockClasses.map((cls, i) => (
          <GlassCard key={i} variant="solid" className={`p-3 ${cls.isNow ? "ring-2 ring-primary/20" : ""}`} delay={0.1 + i * 0.05}>
            <div className="flex items-start gap-3">
              <div className={`w-1 h-full min-h-[48px] rounded-full bg-gradient-to-b ${cls.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-heading font-bold text-[13px]">{cls.code}</span>
                  {cls.isNow && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-[9px] font-bold text-white animate-pulse-soft">
                      NOW
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground mb-1.5">{cls.title}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{cls.time} – {cls.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{cls.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}