import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { COMPANY_IDENTITY, PLATFORM_IDENTITY } from "@/lib/companyIdentity";
import SectionHeader from "@/components/me/SectionHeader";
import EditProfileModal from "@/components/me/EditProfileModal";
import { toast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/notifications/ConfirmDialog";
import { queryClientInstance } from "@/lib/query-client";

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
export default function SettingsSection({ user }) {
  const { theme, changeTheme } = useTheme();
  const [sheet, setSheet] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handle = (key) => {
    if (key === "account") setSheet("account");
    else if (key === "about") setSheet("about");
    else if (key === "appearance") {
      const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
      changeTheme(next);
      toast({ title: `Appearance: ${next}` });
    } else {
      toast({ title: "Coming soon", description: "This setting arrives in a future milestone." });
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
      <div className="glass-card p-2">
        {ROWS.map((r, i) => (
          <button
            key={r.key}
            onClick={() => handle(r.key)}
            className={`w-full flex items-center justify-between px-4 py-3.5 spring-tap ${i > 0 ? "border-t border-border/30" : ""}`}
          >
            <span className="text-[14px] font-semibold text-foreground">{r.label}</span>
            <span className="text-[12px] text-muted-foreground capitalize">{r.key === "appearance" ? theme : "›"}</span>
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
                <h2 className="font-heading font-bold text-[18px] text-foreground">{sheet === "account" ? "Account" : "About UNIBUD"}</h2>
                <button onClick={() => setSheet(null)} className="text-[13px] font-semibold text-muted-foreground">Close</button>
              </div>
              {sheet === "account" ? (
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
}