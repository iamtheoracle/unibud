import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Mail, Send, Loader2, Plus, Building2, Globe, Users, Clock,
  CheckCircle2, XCircle, MailOpen, X, Sparkles, MapPin,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  INSTITUTION_TYPES, OUTREACH_STATUSES, getOutreachStatus,
} from "@/lib/institutionConfig";
import { useToast } from "@/components/ui/use-toast";

const STATUS_ICONS = {
  pending: Clock,
  sent: Send,
  responded: MailOpen,
  accepted: CheckCircle2,
  declined: XCircle,
  expired: Clock,
};

export default function InstitutionOutreach() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);

  const { data: outreachList, isLoading } = useQuery({
    queryKey: ["institutionOutreach"],
    queryFn: () => base44.entities.InstitutionOutreach.list("-invitation_sent_at", 50),
  });

  const handleSendInvitation = async (formData) => {
    setSending(true);
    try {
      const outreach = await base44.entities.InstitutionOutreach.create({
        ...formData,
        outreach_status: "sent",
        invitation_sent_at: new Date().toISOString(),
      });

      // Send the invitation email
      await base44.integrations.Core.SendEmail({
        to: formData.contact_email,
        subject: `${formData.institution_name} — Join UNIBUD, the University Operating System`,
        body: buildInvitationEmail(formData),
        from_name: "UNIBUD Platform",
      });

      queryClient.invalidateQueries({ queryKey: ["institutionOutreach"] });
      toast({ title: "Invitation Sent", description: `Invitation email sent to ${formData.contact_email}` });
      setShowForm(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not send invitation. Please try again.", variant: "destructive" });
    }
    setSending(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updates = { outreach_status: newStatus };
      if (newStatus === "accepted") updates.onboarded_at = new Date().toISOString();
      if (["responded", "accepted", "declined"].includes(newStatus)) updates.response_at = new Date().toISOString();
      await base44.entities.InstitutionOutreach.update(id, updates);
      queryClient.invalidateQueries({ queryKey: ["institutionOutreach"] });
      toast({ title: "Status Updated", description: `Marked as ${getOutreachStatus(newStatus).label}` });
    } catch {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-[22px] text-foreground">Institution Outreach</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Invite universities, polytechnics, and colleges to join UNIBUD. Students never lose data when their institution verifies.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[13px] spring-tap"
          >
            <Plus className="w-4 h-4" /> New Invitation
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {OUTREACH_STATUSES.map((s, i) => {
          const count = (outreachList || []).filter((o) => o.outreach_status === s.value).length;
          return (
            <GlassCard key={s.value} variant="solid" className="p-3 text-center" delay={i * 0.03}>
              <p className="font-heading font-bold text-[18px] text-foreground">{count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Outreach List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (outreachList || []).length === 0 ? (
        <GlassCard variant="solid" className="p-8 text-center">
          <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-heading font-semibold text-[14px] text-foreground">No Outreach Yet</p>
          <p className="text-[12px] text-muted-foreground mt-1">Send your first institution invitation to get started.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {(outreachList || []).map((item, idx) => (
            <OutreachCard key={item.id} item={item} delay={idx * 0.04} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}

      {/* Invitation Form Modal */}
      {showForm && (
        <InvitationFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleSendInvitation}
          sending={sending}
        />
      )}
    </div>
  );
}

function OutreachCard({ item, delay, onStatusUpdate }) {
  const [showActions, setShowActions] = useState(false);
  const status = getOutreachStatus(item.outreach_status);
  const StatusIcon = STATUS_ICONS[item.outreach_status] || Clock;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard variant="solid" className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-semibold text-[14px] text-foreground">{item.institution_name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${status.color === "success" ? "bg-success/10 text-success" : status.color === "info" ? "bg-info/10 text-info" : status.color === "warning" ? "bg-warning/10 text-warning" : status.color === "error" ? "bg-error/10 text-error" : "bg-muted text-muted-foreground"}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
              {item.contact_name && <span>{item.contact_name}</span>}
              {item.contact_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.contact_email}</span>}
              {item.country && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {item.country}</span>}
              {item.estimated_student_count > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> ~{item.estimated_student_count} students</span>}
            </div>
            {item.notes && <p className="text-[11px] text-muted-foreground mt-1.5 italic">{item.notes}</p>}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              {item.outreach_status === "pending" && (
                <button onClick={() => onStatusUpdate(item.id, "sent")} className="px-3 py-1.5 rounded-lg bg-info/10 text-info text-[11px] font-semibold hover:bg-info/20">
                  Mark as Sent
                </button>
              )}
              {item.outreach_status === "sent" && (
                <>
                  <button onClick={() => onStatusUpdate(item.id, "responded")} className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-[11px] font-semibold hover:bg-warning/20">
                    Mark Responded
                  </button>
                  <button onClick={() => onStatusUpdate(item.id, "declined")} className="px-3 py-1.5 rounded-lg bg-error/10 text-error text-[11px] font-semibold hover:bg-error/20">
                    Declined
                  </button>
                </>
              )}
              {item.outreach_status === "responded" && (
                <button onClick={() => onStatusUpdate(item.id, "accepted")} className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-[11px] font-semibold hover:bg-success/20">
                  Accept & Onboard
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function InvitationFormModal({ onClose, onSubmit, sending }) {
  const [form, setForm] = useState({
    institution_name: "",
    institution_type: "university",
    country: "",
    city: "",
    contact_email: "",
    contact_name: "",
    contact_role: "",
    estimated_student_count: 0,
    notes: "",
    invitation_message: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const canSubmit = form.institution_name && form.contact_email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-[24px] elevated-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <div>
            <h3 className="font-heading font-bold text-[16px] text-foreground">New Institution Invitation</h3>
            <p className="text-[11px] text-muted-foreground">Send a professional invitation to join UNIBUD</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Institution Name *">
              <input value={form.institution_name} onChange={(e) => set("institution_name", e.target.value)} placeholder="e.g. University of Benin" className="input-base" />
            </FormField>
            <FormField label="Institution Type">
              <select value={form.institution_type} onChange={(e) => set("institution_type", e.target.value)} className="input-base">
                {INSTITUTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Country">
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="e.g. Nigeria" className="input-base" />
            </FormField>
            <FormField label="City">
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Benin City" className="input-base" />
            </FormField>
            <FormField label="Contact Email *">
              <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="registrar@institution.edu" className="input-base" />
            </FormField>
            <FormField label="Contact Name">
              <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Registrar / VC / Dean" className="input-base" />
            </FormField>
            <FormField label="Contact Role">
              <input value={form.contact_role} onChange={(e) => set("contact_role", e.target.value)} placeholder="e.g. Vice-Chancellor" className="input-base" />
            </FormField>
            <FormField label="Estimated Student Count">
              <input type="number" value={form.estimated_student_count || ""} onChange={(e) => set("estimated_student_count", parseInt(e.target.value) || 0)} placeholder="0" className="input-base" />
            </FormField>
          </div>
          <FormField label="Custom Message (optional)">
            <textarea value={form.invitation_message} onChange={(e) => set("invitation_message", e.target.value)} rows={3} placeholder="Add a personal note to the invitation email" className="input-base resize-none" />
          </FormField>
          <FormField label="Internal Notes">
            <input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Internal notes (not sent to institution)" className="input-base" />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border/20">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit || sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Invitation
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function buildInvitationEmail(data) {
  return `Dear ${data.contact_name || "Colleague"},

UNIBUD is the university operating system that connects, organizes, and powers student life. We are extending an invitation to ${data.institution_name} to officially join the platform.

${data.invitation_message ? data.invitation_message + "\n\n" : ""}By joining UNIBUD, your institution will be able to:
• Manage official announcements, grades, attendance, and timetables
• Verify students using your own identifier formats (matriculation numbers, student IDs, or any identifier you use)
• Configure your academic structure, traditions, and terminology
• Connect with students who are already using UNIBUD

Your students are already benefiting from UNIBUD — official verification simply unlocks institution-managed features without affecting any existing student data.

To get started, please reply to this email or visit UNIBUD to complete the onboarding process.

Warm regards,
The UNIBUD Team
My Realm Network Limited`;
}