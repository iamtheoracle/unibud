import React, { useState } from "react";
import { ShieldCheck, IdCard, Clock } from "lucide-react";
import { useIdentity } from "@/lib/identity/useIdentity";
import DigitalIdCard from "@/components/identity/DigitalIdCard";
import AddIdentifierForm from "@/components/identity/AddIdentifierForm";
import VerificationComposer from "@/components/identity/VerificationComposer";
import VerificationHistory from "@/components/identity/VerificationHistory";
import { useToast } from "@/components/ui/use-toast";

/**
 * CampusIdentity — the trusted identity hub. A student views their digital
 * Student ID with QR profile, registers identifiers, requests verification,
 * and tracks their verification history with status and expiry.
 */
export default function CampusIdentity() {
  const { user, primaryId, isVerified, institution, identifiers, allRequests, pendingRequests, submitId, submitVerification, loading } = useIdentity();
  const { toast } = useToast();
  const [tab, setTab] = useState("id");

  const onAddId = (data) => {
    submitId(data, {
      onSuccess: () => toast({ title: "Student ID added", description: "It will be verified by your institution." }),
      onError: () => toast({ title: "Couldn’t save ID", variant: "destructive" }),
    });
  };
  const onVerify = (data) => {
    submitVerification(data, {
      onSuccess: () => toast({ title: "Verification submitted", description: "We’ll review your request shortly." }),
      onError: () => toast({ title: "Couldn’t submit request", variant: "destructive" }),
    });
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Campus Identity
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">Your verified digital identity across the ecosystem.</p>
      </header>

      <DigitalIdCard user={user} primaryId={primaryId} isVerified={isVerified} institution={institution} />

      <div className="flex gap-2 mt-5 mb-4 p-1 rounded-[16px] bg-muted/40">
        <TabBtn active={tab === "id"} onClick={() => setTab("id")} icon={IdCard} label="My IDs" count={identifiers.length} />
        <TabBtn active={tab === "verify"} onClick={() => setTab("verify")} icon={ShieldCheck} label="Verify" count={pendingRequests.length} />
        <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={Clock} label="History" count={allRequests.length} />
      </div>

      {tab === "id" && (
        <div className="space-y-3">
          {identifiers.length === 0 && (
            <div className="rounded-[20px] p-6 glass-card text-center mb-3">
              <p className="text-[13px] font-semibold text-foreground">No student IDs yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">Add your student or matriculation number to unlock your digital ID.</p>
            </div>
          )}
          {identifiers.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-[18px] p-3 glass-card">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground truncate">{i.identifier_value}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{i.identifier_type.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{i.institution_name}</p>
              </div>
              {i.is_verified ? (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-success/12 text-success flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/12 text-warning">Pending</span>
              )}
            </div>
          ))}
          <AddIdentifierForm onSubmit={onAddId} defaultInstitution={institution} loading={loading} />
        </div>
      )}

      {tab === "verify" && (
        <div className="space-y-3">
          {pendingRequests.length > 0 && (
            <p className="text-[11px] text-muted-foreground px-1">{pendingRequests.length} request{pendingRequests.length > 1 ? "s" : ""} awaiting review.</p>
          )}
          <VerificationComposer onSubmit={onVerify} loading={loading} />
        </div>
      )}

      {tab === "history" && <VerificationHistory requests={allRequests} />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[12px] text-[12px] font-semibold transition-colors spring-tap ${
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {count > 0 && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"}`}>{count}</span>
      )}
    </button>
  );
}