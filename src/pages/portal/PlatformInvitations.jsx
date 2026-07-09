import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Mail, Shield, Clock, Check, X, Crown, Users, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PortalPageHeader, SectionCard, StatusPill, SmartList } from "@/components/portal/PortalUI";
import { ROLE_HIERARCHY, isPlatformRole } from "@/lib/portalConfig";

const PLATFORM_INVITE_ROLES = [
  { key: "operator", name: "Operator" },
  { key: "senior_operator", name: "Senior Operator" },
  { key: "moderator", name: "Moderator" },
  { key: "finance_manager", name: "Finance Manager" },
  { key: "support_manager", name: "Support Manager" },
  { key: "compliance_officer", name: "Compliance Officer" },
  { key: "developer", name: "Developer" },
  { key: "platform_admin", name: "Platform Admin" },
  { key: "super_admin", name: "Super Admin" },
];

export default function PlatformInvitations() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const platformUsers = (users || []).filter((u) => isPlatformRole(u.role) || u.role === "oracle");

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    setMessage("");
    try {
      await base44.users.inviteUser(email, role);
      setMessage(`Invitation sent to ${email}`);
      setEmail("");
      setShowInvite(false);
      qc.invalidateQueries(["portalUsers"]);
    } catch (err) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Platform Invitations"
        subtitle="Invite and manage platform operations staff. Invitation only — no self-registration."
        action={
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" /> New Invitation
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: platformUsers.length, icon: Users, accent: "primary" },
          { label: "Super Admins", value: platformUsers.filter((u) => u.role === "super_admin").length, icon: Shield, accent: "error" },
          { label: "Active Roles", value: [...new Set(platformUsers.map((u) => u.role))].length, icon: Crown, accent: "warning" },
          { label: "Pending Invites", value: "—", icon: Clock, accent: "info" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[28px] bg-card border border-border/40 elevated-shadow p-5"
          >
            <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center mb-3 ${
              stat.accent === "primary" ? "bg-primary/10 text-primary" :
              stat.accent === "error" ? "bg-error/10 text-error" :
              stat.accent === "warning" ? "bg-warning/10 text-warning" :
              "bg-info/10 text-info"
            }`}>
              <stat.icon className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <p className="text-[28px] font-heading font-extrabold text-foreground tracking-tight leading-none">{stat.value}</p>
            <p className="text-[13px] font-semibold text-foreground mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <SectionCard title="Platform Staff" description="All platform operations personnel" delay={0.2}>
        <SmartList
          items={platformUsers}
          emptyMessage="No platform staff yet"
          renderRow={(user) => (
            <div className="flex items-center gap-3 w-full">
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 font-bold text-[14px] ${
                user.role === "oracle" ? "bg-primary/15 text-primary" :
                user.role === "super_admin" ? "bg-error/10 text-error" :
                "bg-muted/50 text-foreground"
              }`}>
                {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {user.full_name || user.email}
                  {user.role === "oracle" && <Crown className="w-3.5 h-3.5 text-primary inline ml-1.5" />}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {ROLE_HIERARCHY.find((r) => r.key === user.role)?.name || user.role}
                </p>
              </div>
              {user.role === "oracle" ? (
                <StatusPill status="operational" label="Protected" />
              ) : (
                <StatusPill status="active" label="Active" />
              )}
            </div>
          )}
        />
      </SectionCard>

      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvite(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 glass-strong border-l border-border/30 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading font-bold text-[18px] text-foreground">New Platform Invitation</h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">Send a secure invitation to join the Operations Center</p>
                  </div>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 spring-tap"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-[16px] bg-success/10 border border-success/20 mb-4"
                  >
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-[12px] text-success font-medium">{message}</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-[16px] bg-error/10 border border-error/20 mb-4"
                  >
                    <X className="w-4 h-4 text-error flex-shrink-0" />
                    <p className="text-[12px] text-error font-medium">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="new.staff@myrealm.network"
                        className="w-full h-[48px] pl-10 pr-4 rounded-[16px] bg-muted/50 border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Assign Role</label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                      {PLATFORM_INVITE_ROLES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRole(r.key)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-[16px] border transition-all spring-tap ${
                            role === r.key
                              ? "border-primary bg-primary/5 soft-shadow"
                              : "border-border/30 bg-muted/20 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${
                              role === r.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-[13px] font-semibold text-foreground">{r.name}</span>
                          </div>
                          {role === r.key && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-[16px] bg-warning/5 border border-warning/20">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <Shield className="w-3.5 h-3.5 text-warning inline mr-1" />
                      The recipient will receive an email invitation. They must create a password and complete setup before gaining access. Oracle accounts cannot be created through invitations.
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[52px] rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {sending ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Mail className="w-[18px] h-[18px]" />
                      </motion.div>
                    ) : (
                      <>
                        <Mail className="w-[18px] h-[18px]" />
                        Send Secure Invitation
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}