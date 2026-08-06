import React, { useState } from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import EditProfileModal from "@/components/me/EditProfileModal";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ProfileHeader — Liquid Glass card with the student's identity and
 * academic standing, plus an Edit Profile action.
 */
export default function ProfileHeader({ user }) {
  const [editing, setEditing] = useState(false);
  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const handle = user?.username ? `@${user.username}` : null;

  const fields = [
    { label: "Matric Number", value: user?.matriculation_number || "—" },
    { label: "Department", value: user?.department || "—" },
    { label: "Faculty", value: user?.faculty || "—" },
    { label: "University", value: user?.university || "—" },
    { label: "Academic Level", value: user?.level || "—" },
    { label: "Semester", value: user?.semester || "—" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full glass-strong overflow-hidden ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" />
            ) : (
              <span className="font-heading font-bold text-[24px] text-foreground">{name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-[18px] text-foreground truncate">{name}</h1>
            {handle && <p className="text-[12px] text-muted-foreground truncate">{handle}</p>}
            <button onClick={() => setEditing(true)} className="mt-2 px-3 py-1.5 rounded-full glass text-[12px] font-semibold text-foreground spring-tap">
              Edit Profile
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{f.label}</p>
              <p className="text-[13px] font-semibold text-foreground truncate">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </motion.div>
  );
}