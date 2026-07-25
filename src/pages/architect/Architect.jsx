import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShieldAlert, Loader2 } from "lucide-react";
import ArchitectShell from "@/components/architect/ArchitectShell";
import { ARCHITECT_MODULES, moduleById } from "@/lib/architect/modules";
import Workspace from "@/components/architect/sections/Workspace";
import PageBuilder from "@/components/architect/sections/PageBuilder";
import FormBuilder from "@/components/architect/sections/FormBuilder";
import WorkflowBuilder from "@/components/architect/sections/WorkflowBuilder";
import DashboardBuilder from "@/components/architect/sections/DashboardBuilder";
import ReportBuilder from "@/components/architect/sections/ReportBuilder";
import MenuBuilder from "@/components/architect/sections/MenuBuilder";
import ThemeBuilder from "@/components/architect/sections/ThemeBuilder";
import ComponentLibrary from "@/components/architect/sections/ComponentLibrary";
import PermissionBuilder from "@/components/architect/sections/PermissionBuilder";
import NotificationBuilder from "@/components/architect/sections/NotificationBuilder";
import AIBuilder from "@/components/architect/sections/AIBuilder";
import VersionControl from "@/components/architect/sections/VersionControl";

const SECTIONS = {
  home: Workspace,
  versions: VersionControl,
  pages: PageBuilder,
  forms: FormBuilder,
  workflows: WorkflowBuilder,
  dashboards: DashboardBuilder,
  reports: ReportBuilder,
  menus: MenuBuilder,
  themes: ThemeBuilder,
  components: ComponentLibrary,
  permissions: PermissionBuilder,
  notifications: NotificationBuilder,
  ai: AIBuilder,
};

export default function Architect() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "home";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  // Platform-only: Oracle Administrators and Platform Architects.
  const allowed = user && (user.role === "admin" || user.role === "architect");
  if (!allowed) {
    return (
      <div className="h-screen grid place-items-center px-6">
        <div className="glass-card radius-lg p-6 text-center max-w-[380px]">
          <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
          <h2 className="font-heading font-bold text-[18px]">Architect access required</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Architect is the platform builder — restricted to Oracle Administrators and Platform Architects. Management, Operators, institutions, lecturers, parents and students cannot access or edit platform architecture.</p>
        </div>
      </div>
    );
  }

  const mod = moduleById(active) || ARCHITECT_MODULES[0];
  const Section = SECTIONS[mod.id] || Workspace;
  return (
    <ArchitectShell user={user} modules={ARCHITECT_MODULES} active={active} onActive={onActive}>
      <Section onActive={onActive} />
    </ArchitectShell>
  );
}