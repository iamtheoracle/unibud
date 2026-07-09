import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Check, X, Clock, User, Building, FileText } from "lucide-react";
import { PortalPageHeader, SectionCard, StatusPill } from "@/components/portal/PortalUI";

const TABS = ["Pending", "Approved", "Rejected"];

const MOCK_APPROVALS = [
  { id: 1, type: "User Registration", requester: "Dr. Sarah Okonkwo", target: "Lecturer account", detail: "Computer Science Dept", date: "2026-07-08", status: "pending" },
  { id: 2, type: "Content Publication", requester: "Prof. Ibrahim", target: "Lecture Notes — PHY 203", detail: "Quantum Mechanics Ch. 5", date: "2026-07-07", status: "pending" },
  { id: 3, type: "Module Request", requester: "University of Lagos", target: "Enable Marketplace", detail: "Campus-wide feature toggle", date: "2026-07-06", status: "pending" },
  { id: 4, type: "Event Approval", requester: "Student Union", target: "Department Week", detail: "Engineering Faculty", date: "2026-07-05", status: "pending" },
  { id: 5, type: "User Registration", requester: "John Adeyemi", target: "Student account", detail: "University of Benin", date: "2026-07-04", status: "approved" },
  { id: 6, type: "Content Publication", requester: "Dr. Nnamdi", target: "Assignment — CSC 305", detail: "Operating Systems", date: "2026-07-03", status: "rejected" },
];

const TYPE_ICONS = {
  "User Registration": User,
  "Content Publication": FileText,
  "Module Request": Building,
  "Event Approval": ClipboardCheck,
};

export default function Approvals() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);

  const filtered = approvals.filter((a) => a.status === activeTab.toLowerCase());

  const handleAction = (id, action) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Approvals" subtitle="Review and manage pending platform requests." />

      <div className="flex gap-2 p-1.5 bg-muted/50 rounded-[20px] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-[16px] text-[12px] font-semibold transition-all ${
              activeTab === tab
                ? "bg-card text-foreground elevated-shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            <span className="ml-2 text-[10px] opacity-60">
              {approvals.filter((a) => a.status === tab.toLowerCase()).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((approval, i) => {
          const Icon = TYPE_ICONS[approval.type] || ClipboardCheck;
          return (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <SectionCard delay={0}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-[16px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-foreground">{approval.type}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{approval.requester}</p>
                    </div>
                    <StatusPill status={approval.status === "pending" ? "open" : approval.status === "approved" ? "resolved" : "disabled"} label={approval.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="text-muted-foreground w-16">Target:</span>
                      <span className="font-medium text-foreground">{approval.target}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="text-muted-foreground w-16">Detail:</span>
                      <span className="font-medium text-foreground">{approval.detail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{approval.date}</span>
                    </div>
                  </div>

                  {approval.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(approval.id, "approved")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] bg-success/10 text-success hover:bg-success/15 spring-tap transition-colors text-[12px] font-semibold"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(approval.id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] bg-error/10 text-error hover:bg-error/15 spring-tap transition-colors text-[12px] font-semibold"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </SectionCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] text-muted-foreground">No {activeTab.toLowerCase()} approvals</p>
        </div>
      )}
    </div>
  );
}