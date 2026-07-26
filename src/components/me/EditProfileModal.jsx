import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { queryClientInstance } from "@/lib/query-client";
import { Image } from "@/components/ui/image";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";
import { updateProfile, checkUsername, getFunctionError } from "@/lib/identity/profileService";
import { resolveDisplayName } from "@/lib/userDisplayName";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/**
 * EditProfileModal — edits the user's editable identity fields.
 *
 * Identity model (per the UNIBUD identity directive):
 *   • Display Name  (preferred_name) — freely editable
 *   • Username      (username)         — unique, validated live + server-side
 *   • Bio           (bio)              — short, 280 char max
 *   • Profile Photo (avatar_url)       — uploaded file
 *   • Phone         (phone)            — optional, never public
 *   • Legal Name    (full_name)        — read-only; changes require verification
 *   • Email         (email)            — read-only login address
 *
 * On save: persists via the updateProfile backend function, refreshes the
 * authenticated user (AuthContext) and the react-query me() cache, so every
 * screen updates immediately without logout.
 */
export default function EditProfileModal({ open, onClose, user }) {
  const { refreshUser } = useAuth();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameState, setUsernameState] = useState({ status: "idle", message: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setValues({
        preferred_name: user.preferred_name || "",
        username: user.username || "",
        bio: user.bio || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
        matriculation_number: user.matriculation_number || "",
        department: user.department || "",
        faculty: user.faculty || "",
        university: user.university || "",
        level: user.level || "",
      });
      setUsernameState({ status: "idle", message: "" });
      setError("");
    }
  }, [open, user]);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("avatar_url", file_url);
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const onUsernameBlur = async () => {
    const u = (values.username || "").trim().toLowerCase();
    if (!u) { setUsernameState({ status: "idle", message: "" }); return; }
    if (!USERNAME_RE.test(u)) {
      setUsernameState({ status: "invalid", message: "3–20 chars: lowercase letters, numbers, underscores." });
      return;
    }
    if (u === (user?.username || "").toLowerCase()) {
      setUsernameState({ status: "ok", message: "Your current username." });
      return;
    }
    setUsernameState({ status: "checking", message: "Checking availability…" });
    const res = await checkUsername(u);
    if (res.available) setUsernameState({ status: "ok", message: "Available." });
    else setUsernameState({ status: "taken", message: res.reason });
  };

  const canSave = () => {
    if (loading) return false;
    if (["checking", "taken", "invalid"].includes(usernameState.status)) return false;
    return true;
  };

  const handleSave = async () => {
    setError("");
    const payload = {};
    if ((values.preferred_name || "") !== (user?.preferred_name || "")) payload.preferred_name = values.preferred_name.trim();
    if ((values.username || "").trim().toLowerCase() !== (user?.username || "").toLowerCase()) payload.username = values.username.trim().toLowerCase();
    if ((values.bio || "") !== (user?.bio || "")) payload.bio = values.bio;
    if ((values.phone || "") !== (user?.phone || "")) payload.phone = values.phone;
    if ((values.avatar_url || "") !== (user?.avatar_url || "")) payload.avatar_url = values.avatar_url;
    if ((values.matriculation_number || "") !== (user?.matriculation_number || "")) payload.matriculation_number = values.matriculation_number.trim();
    if ((values.department || "") !== (user?.department || "")) payload.department = values.department.trim();
    if ((values.faculty || "") !== (user?.faculty || "")) payload.faculty = values.faculty.trim();
    if ((values.university || "") !== (user?.university || "")) payload.university = values.university.trim();
    if ((values.level || "") !== (user?.level || "")) payload.level = values.level.trim();

    if (Object.keys(payload).length === 0) {
      toast({ title: "No changes to save." });
      return;
    }
    if (payload.preferred_name !== undefined && !payload.preferred_name) {
      setError("Display name can't be empty.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(payload);
      await refreshUser();
      await queryClientInstance.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Profile updated" });
      onClose();
    } catch (e) {
      setError(getFunctionError(e));
    } finally {
      setLoading(false);
    }
  };

  const initial = (resolveDisplayName(user) || "U").charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-[18px] text-foreground">Edit Profile</h2>
              <button onClick={onClose} className="text-[13px] font-semibold text-muted-foreground">Close</button>
            </div>

            {/* Profile photo */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full glass overflow-hidden ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
                {values.avatar_url ? (
                  <Image src={values.avatar_url} alt="Profile photo" fittingType="fill" className="w-full h-full" />
                ) : (
                  <span className="font-heading font-bold text-[22px] text-foreground">{initial}</span>
                )}
              </div>
              <label className="flex-1 h-[48px] px-4 rounded-2xl bg-muted/50 border border-border cursor-pointer flex items-center spring-tap">
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <span className="text-[13px] text-muted-foreground">{values.avatar_url ? "Change photo" : "Upload photo"}</span>
              </label>
            </div>

            <div className="space-y-3.5">
              <GlassInput
                label="Display Name"
                value={values.preferred_name}
                onChange={(e) => set("preferred_name", e.target.value)}
                placeholder="The name everyone sees"
              />

              <div>
                <GlassInput
                  label="Username"
                  value={values.username}
                  onChange={(e) => set("username", e.target.value.toLowerCase())}
                  onBlur={onUsernameBlur}
                  placeholder="blessing_andrew"
                />
                {usernameState.status !== "idle" && (
                  <p className={`text-[11px] mt-1.5 ml-1 ${usernameState.status === "ok" ? "text-success" : "text-destructive"}`}>
                    {usernameState.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Bio</label>
                <textarea
                  value={values.bio}
                  onChange={(e) => set("bio", e.target.value.slice(0, 280))}
                  rows={3}
                  placeholder="A short line about you"
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1 ml-1">{(values.bio || "").length}/280</p>
              </div>

              <GlassInput
                label="Phone (optional)"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Not shown publicly"
              />

              <div className="pt-2 border-t border-border/40">
                <p className="text-[11px] font-semibold text-muted-foreground/70 ml-1 mb-2 uppercase tracking-wide">Academic Info</p>
                <div className="space-y-3.5">
                  <GlassInput label="Matric Number" value={values.matriculation_number} onChange={(e) => set("matriculation_number", e.target.value)} placeholder="University-defined" />
                  <GlassInput label="Department" value={values.department} onChange={(e) => set("department", e.target.value)} />
                  <GlassInput label="Faculty" value={values.faculty} onChange={(e) => set("faculty", e.target.value)} />
                  <GlassInput label="University" value={values.university} onChange={(e) => set("university", e.target.value)} />
                  <GlassInput label="Academic Level" value={values.level} onChange={(e) => set("level", e.target.value)} placeholder="e.g. 200" />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Legal Full Name</label>
                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border/50">
                  <p className="text-[14px] font-semibold text-foreground">{user?.full_name || "—"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Used for official academic records. Changes require verification.</p>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Email (login address)</label>
                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border/50">
                  <p className="text-[14px] font-semibold text-foreground">{user?.email || "—"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Your sign-in address. Contact support to change it.</p>
                </div>
              </div>
            </div>

            {error && <p className="text-[12px] text-destructive mt-3 text-center">{error}</p>}

            <button
              onClick={handleSave}
              disabled={!canSave()}
              className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <span className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : "Save Changes"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}