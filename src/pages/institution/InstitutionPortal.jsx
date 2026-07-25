import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutDashboard, ClipboardList, GraduationCap, FileText, Megaphone, BarChart3, Palette, ShieldCheck } from "lucide-react";
import PortalShell from "@/components/institution/PortalShell";
import PortalDashboard from "@/components/institution/sections/PortalDashboard";
import PortalAdmissions from "@/components/institution/sections/PortalAdmissions";
import PortalAcademic from "@/components/institution/sections/PortalAcademic";
import PortalRecords from "@/components/institution/sections/PortalRecords";
import PortalCommunications from "@/components/institution/sections/PortalCommunications";
import PortalAnalytics from "@/components/institution/sections/PortalAnalytics";
import PortalBranding from "@/components/institution/sections/PortalBranding";
import PortalPermissions from "@/components/institution/sections/PortalPermissions";
import UDSEmptyState from "@/components/uds/UDSEmptyState";
import UDSButton from "@/components/uds/UDSButton";
import { useInstitution } from "@/lib/institution/useInstitution";
import { isAdminRole } from "@/lib/institution/roles";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "admissions", label: "Admissions", icon: ClipboardList },
  { id: "academic", label: "Academic Management", icon: GraduationCap },
  { id: "records", label: "Student Records", icon: FileText },
  { id: "communications", label: "Communications", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "permissions", label: "Permissions", icon: ShieldCheck },
];

export default function InstitutionPortal() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { institution, user, loading } = useInstitution();
  const active = params.get("section") || "dashboard";
  const setActive = (id) => setParams({ section: id });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading portal…</div>;

  if (!user?.institution_id || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[420px]">
          <UDSEmptyState title="No institution" message="Register an institution to access the portal." action={<UDSButton onClick={() => navigate("/institution/onboard")}>Register institution</UDSButton>} />
        </div>
      </div>
    );
  }

  if (!isAdminRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[420px]">
          <UDSEmptyState title="Administrators only" message="This portal is for institution owners and administrators." action={<UDSButton variant="secondary" onClick={() => navigate("/home")}>Back to Campus</UDSButton>} />
        </div>
      </div>
    );
  }

  return (
    <PortalShell institution={institution} user={user} active={active} onActive={setActive} sections={SECTIONS} onBack={() => navigate("/home")}>
      {active === "dashboard" && <PortalDashboard institution={institution} />}
      {active === "admissions" && <PortalAdmissions institution={institution} />}
      {active === "academic" && <PortalAcademic institution={institution} />}
      {active === "records" && <PortalRecords institution={institution} />}
      {active === "communications" && <PortalCommunications institution={institution} />}
      {active === "analytics" && <PortalAnalytics institution={institution} />}
      {active === "branding" && <PortalBranding institution={institution} />}
      {active === "permissions" && <PortalPermissions institution={institution} user={user} />}
    </PortalShell>
  );
}