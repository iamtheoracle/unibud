import React from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { VERIFICATION_TYPES } from "@/lib/identity/useIdentity";

const STATUS = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/12", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/12", label: "Approved" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/12", label: "Rejected" },
  expired: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Expired" },
  renewal: { icon: Clock, color: "text-information", bg: "bg-information/12", label: "Renewal" },
};

/**
 * VerificationHistory — a student's verification request timeline.
 */
export default function VerificationHistory({ requests }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-[20px] p-6 glass-card text-center">
        <p className="text-[13px] font-semibold text-foreground">No verification history yet</p>
        <p className="text-[11px] text-muted-foreground mt-1">Requests you submit appear here with their status and expiry.</p>
      </div>
    );
  }
  const sorted = [...requests].sort((a, b) => new Date(b.submitted_at || b.created_date) - new Date(a.submitted_at || a.created_date));
  return (
    <div className="space-y-2.5">
      {sorted.map((r) => {
        const s = STATUS[r.status] || STATUS.pending;
        const Icon = s.icon;
        const type = VERIFICATION_TYPES.find((t) => t.key === r.target_type);
        const expiry = r.expires_at ? new Date(r.expires_at) : null;
        const expired = expiry && expiry.getTime() < Date.now();
        return (
          <div key={r.id} className="flex items-start gap-3 rounded-[18px] p-3 glass-card">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${s.bg}`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-foreground truncate">{type?.label || r.target_type}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
              </div>
              {r.target_name && <p className="text-[11px] text-muted-foreground truncate">{r.target_name}</p>}
              {r.reviewer_notes && <p className="text-[11px] text-muted-foreground/80 mt-1">“{r.reviewer_notes}”</p>}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground/70">
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : ""}
                </span>
                {expiry && (
                  <span className={`text-[10px] ${expired ? "text-destructive" : "text-muted-foreground/70"}`}>
                    {expired ? "Expired" : "Expires"} {expiry.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}