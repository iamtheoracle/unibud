import React from "react";
import { useNavigate } from "react-router-dom";
import { useUnibudContext } from "@/lib/UnibudContext";
import ServiceCategory from "@/components/services/ServiceCategory";
import {
  Calendar, Clock, BookOpen, Award, TrendingUp, ClipboardList,
  Wallet, CreditCard, Receipt, ShoppingBag, Heart,
  MapPin, Compass, Bus, Car, Users,
  Home, Building, Wrench, MessageCircle, AlertCircle, Shield,
  Briefcase, GraduationCap, FileText, Network, Ticket,
  User, QrCode, Wifi, Printer, Settings, Sparkles,
} from "lucide-react";

const RECOMMENDATIONS = [
  { id: "r1", title: "Your next lecture starts in 20 minutes", desc: "CSC401 — AI Lab, Room 304", icon: Calendar, to: "/timetable", priority: "high" },
  { id: "r2", title: "Bus arriving in 5 minutes", desc: "Campus Shuttle — Engineering Gate", icon: Bus, to: null, priority: "medium" },
  { id: "r3", title: "Library seat available nearby", desc: "3 seats open on Level 2", icon: BookOpen, to: "/knowledge", priority: "medium" },
  { id: "r4", title: "Wallet balance is low", desc: "₦8,500 remaining this month", icon: Wallet, to: "/wallet", priority: "high" },
  { id: "r5", title: "Scholarship closes tomorrow", desc: "STEM Grant — apply now!", icon: Award, to: "/scholarships", priority: "high" },
];

const QUICK_ACTIONS = [
  { label: "Pay Fees", icon: Wallet, to: "/finance" },
  { label: "Scan QR", icon: QrCode, to: null },
  { label: "Study Room", icon: BookOpen, to: "/study-sessions" },
  { label: "Textbooks", icon: ShoppingBag, to: "/marketplace" },
  { label: "Find Hostel", icon: Home, to: "/marketplace" },
  { label: "Order Food", icon: Heart, to: null },
  { label: "Transcript", icon: FileText, to: "/academics/report" },
  { label: "Report", icon: AlertCircle, to: "/student-support" },
];

const CATEGORIES = [
  {
    id: "campus_life", label: "Campus Life", icon: Users,
    services: [
      { label: "Timetable", icon: Calendar, to: "/timetable" },
      { label: "Attendance", icon: Clock, to: "/attendance" },
      { label: "Library", icon: BookOpen, to: "/knowledge" },
      { label: "Exams", icon: Award, to: "/exams" },
      { label: "Results", icon: TrendingUp, to: "/academics/results" },
      { label: "Registration", icon: ClipboardList, to: "/courses" },
    ],
  },
  {
    id: "finance", label: "Finance", icon: Wallet,
    services: [
      { label: "Wallet", icon: Wallet, to: "/wallet" },
      { label: "Payments", icon: CreditCard, to: "/finance" },
      { label: "Tuition", icon: Receipt, to: "/finance" },
      { label: "Marketplace", icon: ShoppingBag, to: "/marketplace" },
      { label: "Financial Aid", icon: Heart, to: "/scholarships" },
      { label: "Scholarships", icon: Award, to: "/scholarships" },
    ],
  },
  {
    id: "mobility", label: "Mobility", icon: MapPin,
    services: [
      { label: "Campus Map", icon: MapPin, to: "/discover" },
      { label: "Navigation", icon: Compass, to: "/discover" },
      { label: "Shuttle", icon: Bus, to: null },
      { label: "Ride Share", icon: Users, to: "/discover" },
      { label: "Parking", icon: Car, to: null },
    ],
  },
  {
    id: "housing", label: "Housing", icon: Home,
    services: [
      { label: "Hostel Finder", icon: Home, to: "/marketplace" },
      { label: "Rentals", icon: Building, to: "/marketplace" },
      { label: "Roommates", icon: Users, to: "/marketplace" },
      { label: "Maintenance", icon: Wrench, to: null },
    ],
  },
  {
    id: "health", label: "Health", icon: Heart,
    services: [
      { label: "Medical Center", icon: Heart, to: "/student-support" },
      { label: "Counseling", icon: MessageCircle, to: "/student-support" },
      { label: "Emergency", icon: AlertCircle, to: "/student-support" },
      { label: "Insurance", icon: Shield, to: null },
    ],
  },
  {
    id: "career", label: "Career", icon: Briefcase,
    services: [
      { label: "Jobs", icon: Briefcase, to: "/opportunities" },
      { label: "Internships", icon: GraduationCap, to: "/opportunities" },
      { label: "Career Center", icon: Users, to: "/career" },
      { label: "CV Builder", icon: FileText, to: "/cv-builder" },
      { label: "Alumni", icon: Network, to: "/discover" },
    ],
  },
  {
    id: "events", label: "Events", icon: Calendar,
    services: [
      { label: "Campus Events", icon: Calendar, to: "/events" },
      { label: "Tickets", icon: Ticket, to: "/events" },
      { label: "Conferences", icon: Users, to: "/events" },
      { label: "Workshops", icon: BookOpen, to: "/events" },
      { label: "Clubs", icon: Users, to: "/clubs" },
    ],
  },
  {
    id: "utilities", label: "Utilities", icon: Settings,
    services: [
      { label: "ID Card", icon: User, to: "/me" },
      { label: "QR Access", icon: QrCode, to: null },
      { label: "Wi-Fi", icon: Wifi, to: null },
      { label: "Printing", icon: Printer, to: null },
      { label: "Documents", icon: FileText, to: "/knowledge" },
      { label: "Certificates", icon: Award, to: "/academic-timeline" },
    ],
  },
];

const CONNECTED = ["Apple Wallet", "Google Maps", "Uber", "Bolt", "Banking", "Google Calendar", "Outlook"];

const avatarBg = () => ({ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" });

/**
 * Services — intelligent hub surfacing smart recommendations, categorized
 * university services, quick actions, personalized automation, and connected
 * services. All icons monochrome; every service maps to a real route.
 */
export default function Services() {
  const navigate = useNavigate();
  const ctx = useUnibudContext();

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">

      {/* Smart Recommendations */}
      <div className="pt-4">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">Smart Recommendations</span>
        </div>
        <div className="flex flex-col gap-2">
          {RECOMMENDATIONS.map((rec) => {
            const RIcon = rec.icon;
            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-3 flex items-center gap-3 glass border ${rec.priority === "high" ? "border-primary/20" : "border-border/40"}`}
              >
                <div className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0 bg-muted/40">
                  <RIcon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground leading-tight">{rec.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{rec.desc}</div>
                </div>
                <button
                  onClick={() => rec.to && navigate(rec.to)}
                  disabled={!rec.to}
                  className="px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap whitespace-nowrap disabled:opacity-40"
                >
                  {rec.to ? "Open" : "Soon"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Quick Actions</div>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => {
            const AIcon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => a.to && navigate(a.to)}
                disabled={!a.to}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl glass border border-border/40 spring-tap disabled:opacity-40"
              >
                <AIcon className="w-[18px] h-[18px] text-foreground" />
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Service Categories */}
      <div className="pt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Service Categories</div>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <ServiceCategory key={cat.id} category={cat} onNavigate={navigate} />
          ))}
        </div>
      </div>

      {/* Personalized Automation */}
      <div className="pt-5">
        <div className="rounded-2xl p-3.5 glass border border-primary/15">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-6 h-6 rounded-full grid place-items-center text-[12px] text-primary-foreground" style={avatarBg()}>✦</div>
            <span className="text-[11px] font-semibold text-foreground">Personalized Automation</span>
          </div>
          <div className="text-[12px] text-muted-foreground">"Before exams, prioritize study tools."</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">Based on your schedule and preferences</div>
        </div>
      </div>

      {/* Connected Services */}
      <div className="pt-5 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Connected Services</div>
        <div className="flex flex-wrap gap-2">
          {CONNECTED.map((name) => (
            <button
              key={name}
              onClick={() => navigate("/security")}
              className="px-3 py-1.5 rounded-full text-[11px] glass border border-border/40 text-muted-foreground spring-tap"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}