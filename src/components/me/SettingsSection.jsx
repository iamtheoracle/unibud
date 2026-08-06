import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { COMPANY_IDENTITY, PLATFORM_IDENTITY } from "@/lib/companyIdentity";
import { ChevronRight } from "lucide-react";
import SectionHeader from "@/components/me/SectionHeader";
import EditProfileModal from "@/components/me/EditProfileModal";
import { toast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/notifications/ConfirmDialog";
import { queryClientInstance } from "@/lib/query-client";

const ROUTE_MAP = {
  notifications: "/bud/notifications",
  security: "/security",
  devices: "/security",
  data: "/me",
};

function AccountRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-semibold text-foreground truncate max-w-[60%] text-right">{value || "—"}</span>
    </div>
  );
}

const ROWS = [
  { key: "account", label: "Account" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "language", label: "Language" },
  { key: "accessibility", label: "Accessibility" },
  { key: "privacy", label: "Privacy" },
  { key: "security", label: "Security" },
  { key: "data", label: "Data & Storage" },
  { key: "devices", label: "Connected Devices" },
  { key: "about", label: "About UNIBUD" },
];

/**
 * SettingsSection — account, appearance, and about are functional; the
 * remaining categories are staged for future milestones.
 */
const SettingsSection = forwardRef(({ user }, ref) => {
  const navigate = useNavigate();
  const { theme, changeTheme } = useTheme();
  const [sheet, setSheet] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [privacy, setPrivacy] = useState(() => {
    try { return JSON.parse(localStorage.getItem("unibud_privacy") || "{}"); } catch { return {}; }
  });

  const savePrivacy = (updates) => {
    const next = { ...privacy, ...updates };
    setPrivacy(next);
    try { localStorage.setItem("unibud_privacy", JSON.stringify(next)); } catch {}
    toast({ title: "Privacy updated" });
  };

  const PrivacyToggle = ({ label, description, field, defaultValue = true }) => {
    const value = privacy[field] ?? defaultValue;
    return (
      <div className="flex items-start justify-between gap-3 py-3 border-b border-border/30 last:border-0">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-foreground">{label}</p>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => savePrivacy({ [field]: !value })}
          className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-muted"}`}
          role="switch"
          aria-checked={value}
        >
          <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${value ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    );
  };

  const handle = (key) => {
    if (key === "account") setSheet("account");
    else if (key === "about") setSheet("about");
    else if (key === "privacy") setSheet("privacy");
    else if (key === "appearance") {
      const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
      changeTheme(next);
      toast({ title: `Appearance: ${next}` });
    } else if (key === "language") {
      toast({ title: "Language", description: "English (Nigeria) — additional languages on the roadmap." });
    } else if (key === "accessibility") {
      document.documentElement.classList.toggle("reduce-motion");
      const reduced = document.documentElement.classList.contains("reduce-motion");
      toast({ title: `Reduced motion: ${reduced ? "On" : "Off"}` });
    } else if (ROUTE_MAP[key]) {
      navigate(ROUTE_MAP[key]);
    } else {
      setSheet("account");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke("deleteAccount", {});
      queryClientInstance.clear();
      try { localStorage.clear(); } catch {}
      try { await base44.auth.logout(); } catch {}
      window.location.href = "/login";
    } catch (e) {
      toast({ title: "Could not delete account", description: "Please try again.", variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Settings" />
      <div className="divide-y divide-border border-t border-b border-border">
        {ROWS.map((r) => (
          <button
            key={r.key}
            onClick={() => handle(r.key)}
            className="w-full flex items-center gap-3 py-4 spring-tap group"
          >
            <span className="text-[15px] font-medium text-foreground flex-1 text-left">{r.label}</span>
            <span className="text-[13px] text-muted-foreground capitalize">{r.key === "appearance" ? theme : ""}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        description="This action is permanent. Your account, academic records, preferences, memories, AI history, saved notes, uploads, and all associated data will be permanently deleted and cannot be recovered."
        confirmLabel="Delete Account"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSheet(null)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-[18px] text-foreground">{sheet === "account" ? "Account" : sheet === "privacy" ? "Privacy" : "About UNIBUD"}</h2>
                <button onClick={() => setSheet(null)} className="text-[13px] font-semibold text-muted-foreground">Close</button>
              </div>
              {sheet === "privacy" ? (
                <div className="space-y-0">
                  <PrivacyToggle field="private_profile" label="Private Profile" description="Only approved followers see your posts and profile" defaultValue={false} />
                  <PrivacyToggle field="show_online" label="Show Online Status" description="Let others see when you're active" />
                  <PrivacyToggle field="show_in_search" label="Appear in Search" description="Allow others to find you by name or username" />
                  <PrivacyToggle field="allow_tags" label="Allow Tagging" description="Let others tag you in posts and comments" />
                  <PrivacyToggle field="show_activity" label="Show Activity Feed" description="Display your recent activity on your profile" />
                  <PrivacyToggle field="allow_messages" label="Allow Messages from Anyone" description="Receive DMs from people you don't follow" />
                  <PrivacyToggle field="show_academic" label="Show Academic Info" description="Display your faculty, department and level publicly" />
                  <PrivacyToggle field="data_personalization" label="Personalised Recommendations" description="Allow Bud to use your activity for better suggestions" />
                </div>
              ) : sheet === "account" ? (
                <div className="space-y-3">
                  <div className="glass rounded-2xl p-4 space-y-3">
                    <AccountRow label="Full Name" value={user?.full_name} />
                    <AccountRow label="Username" value={user?.username ? `@${user.username}` : "Not set"} />
                    <AccountRow label="Email" value={user?.email} />
                    <AccountRow label="Phone" value={user?.phone || "Not added"} />
                  </div>
                  <button
                    onClick={() => {
                      setSheet(null);
                      setEditing(true);
                    }}
                    className="w-full h-[52px] rounded-2xl glass text-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => base44.auth.logout()}
                    className="w-full h-[52px] rounded-2xl bg-destructive/15 text-destructive font-heading font-semibold text-[15px] flex items-center justify-center spring-tap"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleting}
                    className="w-full h-[52px] rounded-2xl border-2 border-destructive/60 text-destructive font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete Account"}
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 text-[13px] text-foreground/90">
                  <p className="font-heading font-bold text-[16px]">{PLATFORM_IDENTITY.product}</p>
                  <p>{COMPANY_IDENTITY.companyName}</p>
                  <p>RC {COMPANY_IDENTITY.rcNumber}</p>
                  <p>{COMPANY_IDENTITY.country}</p>
                  <p className="text-muted-foreground mt-2">Version {PLATFORM_IDENTITY.version} · {PLATFORM_IDENTITY.core}</p>
                  <p className="text-muted-foreground text-[11px] mt-3">{COMPANY_IDENTITY.copyright}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SettingsSection;