import {
  Crown, Building2, GraduationCap, Layers, BookOpen, UserCog, Trophy,
  Store, Wallet, LifeBuoy, Gavel, ShieldCheck, LayoutDashboard,
  Cog, Bot, CalendarClock, Banknote, FileStack, Network,
} from "lucide-react";

/**
 * Admin role registry for the UNIBUD Intelligent Admin Platform.
 * Each role maps to the admin surfaces it may access. The hub uses this
 * to render only authorized launchers per administrator.
 */

export const ADMIN_ROLES = {
  super_admin: { label: "Super Admin", tier: "platform", icon: Crown, color: "262 83% 58%" },
  university_admin: { label: "University Admin", tier: "institution", icon: Building2, color: "217 91% 60%" },
  faculty_admin: { label: "Faculty Admin", tier: "institution", icon: GraduationCap, color: "142 71% 45%" },
  department_admin: { label: "Department Admin", tier: "institution", icon: Layers, color: "173 75% 38%" },
  lecturer: { label: "Lecturer", tier: "academic", icon: BookOpen, color: "32 92% 50%" },
  student_leader: { label: "Student Leader", tier: "student", icon: UserCog, color: "198 88% 45%" },
  club_admin: { label: "Club Admin", tier: "student", icon: Trophy, color: "262 83% 58%" },
  marketplace_admin: { label: "Marketplace Admin", tier: "commerce", icon: Store, color: "38 92% 50%" },
  wallet_admin: { label: "Wallet Admin", tier: "finance", icon: Wallet, color: "173 75% 38%" },
  support: { label: "Support Team", tier: "operations", icon: LifeBuoy, color: "0 78% 55%" },
  moderator: { label: "Moderator", tier: "trust", icon: Gavel, color: "215 16% 45%" },
};

export const ADMIN_SURFACES = {
  oracle: { label: "Platform Operating Center", to: "/oracle", icon: Network, color: "262 83% 58%", roles: ["super_admin"] },
  management: { label: "Institution HQ", to: "/management", icon: LayoutDashboard, color: "217 91% 60%", roles: ["super_admin", "university_admin"] },
  institution: { label: "Institution Console", to: "/institution/console", icon: Building2, color: "217 91% 60%", roles: ["super_admin", "university_admin", "faculty_admin", "department_admin"] },
  lecturer: { label: "Lecturer Portal", to: "/lecturer/portal", icon: BookOpen, color: "32 92% 50%", roles: ["lecturer", "department_admin", "faculty_admin"] },
  operator: { label: "Operator Workspace", to: "/operator", icon: Cog, color: "142 71% 45%", roles: ["super_admin", "university_admin", "department_admin", "support"] },
  finance: { label: "Finance Platform", to: "/finance", icon: Banknote, color: "173 75% 38%", roles: ["super_admin", "university_admin", "wallet_admin"] },
  wallet: { label: "Wallet Banking", to: "/wallet", icon: Wallet, color: "173 75% 38%", roles: ["super_admin", "wallet_admin"] },
  security: { label: "Security Center", to: "/security", icon: ShieldCheck, color: "0 78% 55%", roles: ["super_admin", "university_admin", "support"] },
  architect: { label: "Architect Builder", to: "/architect", icon: FileStack, color: "262 83% 58%", roles: ["super_admin"] },
  automation: { label: "Automation Center", to: "/automation", icon: Bot, color: "142 71% 45%", roles: ["super_admin", "university_admin"] },
  calendar: { label: "Academic Calendar", to: "/calendar", icon: CalendarClock, color: "198 88% 45%", roles: ["super_admin", "university_admin", "faculty_admin", "department_admin", "lecturer"] },
};

export function getAdminRole(user) {
  if (!user) return null;
  const r = user.role;
  if (ADMIN_ROLES[r]) return r;
  if (r === "admin") return "super_admin";
  const custom = user.data?.admin_role || user.admin_role;
  return custom && ADMIN_ROLES[custom] ? custom : null;
}

export function accessibleSurfaces(role) {
  if (!role) return [];
  return Object.entries(ADMIN_SURFACES)
    .filter(([, s]) => s.roles.includes(role))
    .map(([key, s]) => ({ key, ...s }));
}