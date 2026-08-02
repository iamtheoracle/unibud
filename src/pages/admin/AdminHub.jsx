import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Sparkles, FileText, Search, Megaphone, ArrowRight } from "lucide-react";
import { getAdminRole, ADMIN_ROLES } from "@/lib/admin/roles";
import AdminInsights from "@/components/admin/AdminInsights";
import AdminLaunchers from "@/components/admin/AdminLaunchers";
import SeedContentPanel from "@/components/social/SeedContentPanel";
import ScreenShell from "@/components/layout/ScreenShell";

const BUD_ASSIST = [
  { key: "summarize", label: "Summarize Reports", icon: FileText, to: "/bud" },
  { key: "find", label: "Find Users & Records", icon: Search, to: "/operator" },
  { key: "announce", label: "Draft Announcement", icon: Megaphone, to: "/management" },
];

export default function AdminHub() {
  const { data: user, isLoading } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const role = getAdminRole(user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-primary animate-pulse" />
      </div>
    );
  }

  if (!role) {
    return (
      <ScreenShell title="Access required" back backTo="/home">
        <div className="pt-10 text-center">
          <div className="w-16 h-16 rounded-[20px] bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-[20px] font-bold text-foreground">Administrator access required</h1>
          <p className="text-[13px] text-muted-foreground mt-2 mb-6 max-w-[280px] mx-auto">
            This platform hub is reserved for university, faculty, department and platform administrators.
          </p>
          <Link to="/home" className="inline-block px-5 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">
            Back to Home
          </Link>
        </div>
      </ScreenShell>
    );
  }

  const meta = ADMIN_ROLES[role];
  const RoleIcon = meta.icon;

  return (
    <ScreenShell
      title={`${meta.label} Hub`}
      subtitle="Your intelligent operating center — role-aware dashboards, insights and Bud assistance."
      back
      backTo="/home"
      actions={
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `hsl(${meta.color} / 0.14)` }} aria-hidden>
          <RoleIcon className="w-5 h-5" style={{ color: `hsl(${meta.color})` }} />
        </div>
      }
    >
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">{meta.tier} tier</p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="mb-5"
      >
        <AdminInsights role={role} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="mb-6"
      >
        <AdminLaunchers role={role} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <h2 className="text-[14px] font-semibold text-foreground mb-3">Campus Feed Launch Content</h2>
        <SeedContentPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <h2 className="text-[14px] font-semibold text-foreground mb-3">Bud Assistance</h2>
        <div className="grid grid-cols-3 gap-3">
          {BUD_ASSIST.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.key}
                to={a.to}
                className="rounded-[18px] p-3.5 glass-card card-hover text-center"
              >
                <div className="w-9 h-9 rounded-[11px] bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{a.label}</p>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <Link to="/home" className="mt-8 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground spring-tap">
        <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to student home
      </Link>
    </ScreenShell>
  );
}