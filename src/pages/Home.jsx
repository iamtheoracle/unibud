import React from "react";
import { Bell, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import WeatherCard from "@/components/home/WeatherCard";
import CampusPulse from "@/components/home/CampusPulse";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const scheduleItems = [
  {
    time: "08:00",
    endTime: "10:00",
    title: "CSC 302 Data Structures",
    location: "LT3, Faculty of Science",
    type: "Lecture",
    accent: "#28A745",
    participants: ["AB", "CE", "DO"],
  },
  {
    time: "12:00",
    endTime: "13:00",
    title: "Mentor Session",
    location: "Online · Google Meet",
    type: "Mentoring",
    accent: "#3B82F6",
    participants: ["FA", "EN"],
  },
  {
    time: "15:00",
    endTime: "16:30",
    title: "PHY 203 Lab Practical",
    location: "Physics Lab 2",
    type: "Practical",
    accent: "#A855F7",
    participants: ["AB", "CE"],
  },
];

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 pb-2 px-5">
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-[#1A1A1A]">UNIBUD</h1>
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-[#1A1A1A]" strokeWidth={1.8} />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#28A745] rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">3</span>
          </Link>
          <Link to="/me" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#28A745] to-[#1a7a35] shadow-sm flex items-center justify-center text-white font-bold text-sm">
            {firstName.charAt(0)}
          </Link>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pb-4">
        <h2 className="font-heading font-bold text-[20px] tracking-tight text-[#1A1A1A]">{greeting}, {firstName} 👋</h2>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#86868B]" />
          <span className="text-[12px] text-[#86868B] font-medium">{user?.university || "University of Benin"}</span>
        </div>
      </div>

      <div className="px-4 space-y-5 pb-8">
        <WeatherCard />

        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Today's Schedule</h3>
            <Link to="/academics" className="text-[12px] font-semibold text-[#28A745]">View all</Link>
          </div>
          <div className="space-y-2.5">
            {scheduleItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 flex items-stretch gap-3"
              >
                <div className="w-[3px] rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
                <div className="text-center min-w-[42px] pt-0.5">
                  <p className="font-heading font-bold text-[13px] text-[#1A1A1A]">{item.time}</p>
                  <p className="text-[10px] text-[#86868B]">{item.endTime}</p>
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-[14px] text-[#1A1A1A]">{item.title}</p>
                  <p className="text-[11px] text-[#86868B] mt-0.5">{item.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#28A745]/10 text-[#28A745] text-[10px] font-semibold">{item.type}</span>
                    <div className="flex -space-x-1.5">
                      {item.participants.map((p, pi) => (
                        <div key={pi} className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border border-white flex items-center justify-center text-[8px] font-bold text-white">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <CampusPulse />
      </div>
    </div>
  );
}