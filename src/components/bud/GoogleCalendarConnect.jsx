import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Check, Loader2, Unlink, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function GoogleCalendarConnect() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Check if Google Calendar is connected
  const { data: connections } = useQuery({
    queryKey: ["gcal", "connections"],
    queryFn: () => base44.entities.AcademicCalendarSync.list("-created_date", 5),
    enabled: isOnline,
  });

  const isConnected = connections && connections.length > 0 && connections[0]?.sync_enabled !== false;

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      // Create a sync record to track the connection
      await base44.entities.AcademicCalendarSync.create({
        provider: "google",
        sync_enabled: true,
        sync_direction: "two_way",
        last_sync_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ["gcal"] });
    } catch (err) {
      setError("Failed to connect Google Calendar. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      if (connections && connections.length > 0) {
        await base44.entities.AcademicCalendarSync.update(connections[0].id, {
          sync_enabled: false,
        });
        await queryClient.invalidateQueries({ queryKey: ["gcal"] });
      }
    } catch (err) {
      setError("Failed to disconnect. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      if (connections && connections.length > 0) {
        await base44.entities.AcademicCalendarSync.update(connections[0].id, {
          last_sync_at: new Date().toISOString(),
          sync_enabled: true,
        });
        await queryClient.invalidateQueries({ queryKey: ["gcal"] });
      }
    } catch (err) {
      setError("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-[18px] bg-card overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
      <div className="p-3.5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground">Google Calendar</p>
            <p className="text-[10px] text-muted-foreground">
              {isConnected ? "Connected & syncing" : "Connect to sync your schedule"}
            </p>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-success px-2 py-0.5 rounded-full bg-success/10">
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
              Active
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] bg-primary/10 text-primary text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.2} />
              )}
              Sync Now
            </button>
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-[12px] bg-muted text-muted-foreground text-[11px] font-bold active:scale-95 transition-transform"
            >
              <Unlink className="w-3.5 h-3.5" strokeWidth={2.2} />
              Disconnect
            </button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConnect}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-bold disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
            ) : (
              <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
            )}
            Connect Google Calendar
          </motion.button>
        )}

        {error && (
          <p className="text-[10px] text-destructive mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}