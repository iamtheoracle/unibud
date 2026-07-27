import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Building, ShieldCheck, Lock, RefreshCw, Unlink, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, Mail, Hash, Globe, Bell,
  Smartphone, MessageCircle, Calendar, Plus, Sparkles, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UNIVERSITIES } from "@/data/universities";

const METHOD_LABELS = {
  matriculation_number: "Matriculation Number",
  student_email: "Student Email",
  student_portal: "Student Portal",
  official_login: "Official Login",
  manual: "Manual Entry",
};

const METHOD_ICONS = {
  matriculation_number: Hash,
  student_email: Mail,
  student_portal: Globe,
  official_login: Lock,
  manual: Building,
};

const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", color: "hsl(var(--unibud-blue))" },
  { id: "instagram", label: "Instagram", color: "hsl(var(--unibud-purple))" },
  { id: "tiktok", label: "TikTok", color: "hsl(var(--foreground))" },
  { id: "x", label: "X", color: "hsl(var(--foreground))" },
  { id: "facebook", label: "Facebook", color: "hsl(var(--unibud-blue))" },
  { id: "youtube", label: "YouTube", color: "hsl(var(--unibud-red))" },
  { id: "github", label: "GitHub", color: "hsl(var(--foreground))" },
  { id: "behance", label: "Behance", color: "hsl(var(--unibud-blue))" },
  { id: "portfolio", label: "Portfolio", color: "hsl(var(--unibud-gold))" },
];

const REMINDER_CHANNELS = [
  { key: "unibud_push", label: "UNIBUD Push", icon: Bell, color: "text-primary" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-success" },
  { key: "email", label: "Email", icon: Mail, color: "text-info" },
  { key: "sms", label: "SMS", icon: Smartphone, color: "text-warning" },
  { key: "google_calendar", label: "Google Calendar", icon: Calendar, color: "text-info" },
  { key: "apple_calendar", label: "Apple Calendar", icon: Calendar, color: "text-foreground" },
  { key: "outlook_calendar", label: "Outlook Calendar", icon: Calendar, color: "text-info" },
];

const REMINDER_TYPES = [
  { key: "assignment_reminders", label: "Assignments" },
  { key: "exam_reminders", label: "Exams & Tests" },
  { key: "event_reminders", label: "Campus Events" },
  { key: "deadline_reminders", label: "Deadlines" },
  { key: "meeting_reminders", label: "Meetings" },
];

export default function ConnectedAccounts() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefs, setPrefs] = useState(null);
  const [socialModal, setSocialModal] = useState(null);
  const [socialForm, setSocialForm] = useState({ url: "", consent: false });
  const [togglingSocial, setTogglingSocial] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: connections, isLoading } = useQuery({
    queryKey: ["universityConnections"],
    queryFn: () => base44.entities.UniversityConnection.filter({ status: "connected" }),
  });

  const { data: socialConnections } = useQuery({
    queryKey: ["socialConnections"],
    queryFn: () => base44.entities.SocialConnection.filter({ is_connected: true }),
  });

  const { data: statusData } = useQuery({
    queryKey: ["connectStatus"],
    queryFn: () => base44.functions.invoke("universityConnectSync", { action: "get_status" }),
  });

  useEffect(() => {
    if (statusData?.data?.reminder_preference) {
      setPrefs(statusData.data.reminder_preference);
    } else {
      setPrefs({
        unibud_push: true, whatsapp: false, email: true, sms: false,
        google_calendar: false, apple_calendar: false, outlook_calendar: false,
        reminder_lead_hours: 24, assignment_reminders: true, exam_reminders: true,
        event_reminders: true, deadline_reminders: true, meeting_reminders: true,
      });
    }
  }, [statusData]);

  const connection = connections?.[0];
  const uni = UNIVERSITIES.find((u) => u.name === user?.university);
  const accent = uni?.accent;

  const handleResync = async () => {
    if (!connection) return;
    setSyncing(true);
    try {
      await base44.functions.invoke("universityConnectSync", { action: "sync" });
      queryClient.invalidateQueries({ queryKey: ["universityConnections"] });
      queryClient.invalidateQueries({ queryKey: ["connectStatus"] });
    } catch (err) {}
    setSyncing(false);
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    setDisconnecting(true);
    try {
      await base44.entities.UniversityConnection.update(connection.id, {
        status: "disconnected", consent_given: false,
      });
      await base44.auth.updateMe({ university_connected: false, university_connect_method: null });
      queryClient.invalidateQueries({ queryKey: ["universityConnections"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (err) {}
    setDisconnecting(false);
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await base44.functions.invoke("universityConnectSync", { action: "update_reminder_prefs", preferences: prefs });
      queryClient.invalidateQueries({ queryKey: ["connectStatus"] });
    } catch (err) {}
    setSavingPrefs(false);
  };

  const toggleChannel = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const toggleReminderType = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleToggleSocial = async (platform) => {
    setTogglingSocial(platform.id);
    const existing = socialConnections?.find(s => s.platform === platform.id);
    try {
      if (existing) {
        await base44.entities.SocialConnection.update(existing.id, { is_connected: false });
      } else {
        await base44.entities.SocialConnection.create({
          platform: platform.id,
          profile_url: "",
          username: "",
          is_connected: true,
          connected_date: new Date().toISOString(),
          consent_for_recommendations: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["socialConnections"] });
    } catch (err) {}
    setTogglingSocial(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const MethodIcon = METHOD_ICONS[connection?.connection_method] || Building;
  const connectedSocials = socialConnections || [];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <Link to="/me" className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-[20px] tracking-tight text-foreground">Connected Accounts</h1>
          <p className="text-[12px] text-muted-foreground">University, reminders & social</p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* University Connection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">University Account</h2>
          </div>

          {connection ? (
            <>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/5 border border-success/15 mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0" style={accent ? { backgroundColor: `${accent}15` } : {}}>
                  <Building className="w-5 h-5 text-success" style={accent ? { color: accent } : {}} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-foreground truncate">{user?.university}</p>
                  <p className="text-[12px] text-muted-foreground">{METHOD_LABELS[connection.connection_method] || "Connected"}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span className="text-[10px] font-semibold text-success">Active</span>
                </div>
              </div>

              {/* Synced data summary */}
              {connection.synced_data && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/20 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Synchronized Data</p>
                    {connection.last_synced && (
                      <span className="text-[10px] text-muted-foreground">
                        Last: {new Date(connection.last_synced).toLocaleDateString()} {new Date(connection.last_synced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(connection.synced_data).filter(([k]) => !k.startsWith("_")).map(([key, val]) => (
                      val ? (
                        <span key={key} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleResync} disabled={syncing}
                  className="flex-1 h-11 rounded-xl bg-muted/50 border border-border/30 text-[13px] font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors spring-tap disabled:opacity-50">
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Resync Now
                </button>
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="flex-1 h-11 rounded-xl bg-error/10 border border-error/20 text-[13px] font-semibold text-error flex items-center justify-center gap-2 hover:bg-error/15 transition-colors spring-tap disabled:opacity-50">
                  {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/5 border border-warning/15 mb-4">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Your university account is not connected. Connect to automatically sync courses, timetable, assignments, and grades.
                </p>
              </div>
              <Link to="/university-connect" className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors spring-tap">
                <ShieldCheck className="w-4 h-4" /> Connect University Account
              </Link>
            </>
          )}
        </motion.div>

        {/* Smart Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Reminder Channels</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            Choose where Bud sends your reminders. Enable or disable any channel individually.
          </p>

          {prefs ? (
            <>
              <div className="space-y-2 mb-4">
                {REMINDER_CHANNELS.map(ch => (
                  <div key={ch.key} className="flex items-center gap-3 py-2 border-b border-border/20">
                    <ch.icon className={`w-4 h-4 ${ch.color}`} />
                    <span className="flex-1 text-[12px] font-medium text-foreground">{ch.label}</span>
                    <button
                      onClick={() => toggleChannel(ch.key)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${prefs[ch.key] ? "bg-primary" : "bg-muted"}`}
                      role="switch"
                      aria-checked={prefs[ch.key]}
                      aria-label={ch.label}
                    >
                      <motion.div
                        animate={{ x: prefs[ch.key] ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reminder types */}
              <div className="pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">What to remind about</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {REMINDER_TYPES.map(rt => (
                    <button
                      key={rt.key}
                      onClick={() => toggleReminderType(rt.key)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold spring-tap ${prefs[rt.key] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead time */}
              <div className="flex items-center gap-2 py-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-[12px] text-foreground">Remind me</span>
                <select
                  value={prefs.reminder_lead_hours}
                  onChange={e => setPrefs(p => ({ ...p, reminder_lead_hours: parseInt(e.target.value) }))}
                  className="bg-muted/50 border border-border/40 rounded-lg px-2 py-1 text-[11px] font-semibold text-foreground focus:outline-none"
                >
                  <option value={1}>1 hour before</option>
                  <option value={6}>6 hours before</option>
                  <option value={12}>12 hours before</option>
                  <option value={24}>1 day before</option>
                  <option value={48}>2 days before</option>
                  <option value={72}>3 days before</option>
                </select>
              </div>

              <button
                onClick={handleSavePrefs}
                disabled={savingPrefs}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap disabled:opacity-50"
              >
                {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Preferences
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </motion.div>

        {/* Social Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Social Accounts</h2>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
            Optionally connect social accounts. Bud uses these only to recommend challenges, opportunities, and networking. Nothing is ever posted without your explicit approval.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {SOCIAL_PLATFORMS.map(platform => {
              const connected = connectedSocials.find(s => s.platform === platform.id);
              const isToggling = togglingSocial === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => handleToggleSocial(platform)}
                  disabled={isToggling}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all spring-tap ${
                    connected
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/20 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: connected ? `${platform.color}15` : "hsl(var(--muted))" }}>
                    {isToggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : connected ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: platform.color }} />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold ${connected ? "text-foreground" : "text-muted-foreground"}`}>{platform.label}</span>
                </button>
              );
            })}
          </div>

          {connectedSocials.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bud is now using your connected accounts to personalize recommendations. You'll see better-matched challenges, internships, and career opportunities.
              </p>
            </div>
          )}
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Your Privacy</h2>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground leading-relaxed">All connections require your explicit consent before accessing any data.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground leading-relaxed">Your credentials are encrypted and never shared with third parties.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Unlink className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground leading-relaxed">You can disconnect any service at any time. Your data will be removed.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}