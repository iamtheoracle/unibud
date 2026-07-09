import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Building, ShieldCheck, Lock, RefreshCw, Unlink, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, Mail, Hash, Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UNIVERSITIES, getUniversityIntegrations } from "@/data/universities";

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

export default function ConnectedAccounts() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: connections, isLoading } = useQuery({
    queryKey: ["universityConnections"],
    queryFn: () => base44.entities.UniversityConnection.filter({ status: "connected" }),
  });

  const connection = connections?.[0];
  const uni = UNIVERSITIES.find((u) => u.name === user?.university);
  const accent = uni?.accent;

  const handleDisconnect = async () => {
    if (!connection) return;
    setDisconnecting(true);
    try {
      await base44.entities.UniversityConnection.update(connection.id, {
        status: "disconnected",
        consent_given: false,
      });
      await base44.auth.updateMe({
        university_connected: false,
        university_connect_method: null,
      });
      queryClient.invalidateQueries({ queryKey: ["universityConnections"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (err) {}
    setDisconnecting(false);
  };

  const handleResync = async () => {
    if (!connection) return;
    setSyncing(true);
    try {
      await base44.entities.UniversityConnection.update(connection.id, {
        last_synced: new Date().toISOString(),
        sync_status: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["universityConnections"] });
    } catch (err) {}
    setSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const MethodIcon = METHOD_ICONS[connection?.connection_method] || Building;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <Link to="/me" className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-[20px] tracking-tight text-foreground">Connected Accounts</h1>
          <p className="text-[12px] text-muted-foreground">Manage your university and social connections</p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* University Connection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">University Account</h2>
          </div>

          {connection ? (
            <>
              {/* Connection status */}
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

              {/* Connection details */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-[12px] text-muted-foreground">Connection Method</span>
                  <div className="flex items-center gap-1.5">
                    <MethodIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">{METHOD_LABELS[connection.connection_method]}</span>
                  </div>
                </div>
                {connection.identifier && (
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-[12px] text-muted-foreground">Identifier</span>
                    <span className="text-[12px] font-medium text-foreground">{connection.identifier}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-[12px] text-muted-foreground">Consent</span>
                  <span className="text-[12px] font-medium text-foreground">
                    {connection.consent_given ? "Granted" : "Not granted"}
                  </span>
                </div>
                {connection.last_synced && (
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-[12px] text-muted-foreground">Last Synced</span>
                    <span className="text-[12px] font-medium text-foreground">
                      {new Date(connection.last_synced).toLocaleDateString()} {new Date(connection.last_synced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>

              {/* Synced data */}
              {connection.synced_data && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/20 mb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Synchronized Data</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(connection.synced_data).map(([key, val]) => (
                      val ? (
                        <span key={key} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleResync}
                  disabled={syncing}
                  className="flex-1 h-11 rounded-xl bg-muted/50 border border-border/30 text-[13px] font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors spring-tap disabled:opacity-50"
                >
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Resync
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex-1 h-11 rounded-xl bg-error/10 border border-error/20 text-[13px] font-semibold text-error flex items-center justify-center gap-2 hover:bg-error/15 transition-colors spring-tap disabled:opacity-50"
                >
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
                  Your university account is not connected. Connect to automatically sync your courses, timetable, assignments, and grades.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/20 mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-foreground truncate">{user?.university || "No university selected"}</p>
                  <p className="text-[12px] text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Link
                to="/university-connect"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors spring-tap"
              >
                <ShieldCheck className="w-4 h-4" />
                Connect University Account
              </Link>
            </>
          )}
        </motion.div>

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
              <p className="text-[12px] text-muted-foreground leading-relaxed">You can disconnect any connected service at any time. Your data will be removed.</p>
            </div>
          </div>
        </motion.div>

        {/* Social accounts placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Social Accounts</h2>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
            Connect your social accounts to enrich your feed. UNIBUD will never post on your behalf without your explicit permission.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {["LinkedIn", "Instagram", "TikTok", "X", "GitHub", "Behance", "Dribbble", "Discord"].map((platform) => (
              <div key={platform} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-muted/30 border border-border/20 opacity-60">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">{platform}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">Social integrations coming soon</p>
        </motion.div>
      </div>
    </div>
  );
}