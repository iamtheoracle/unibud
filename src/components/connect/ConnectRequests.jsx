import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { UserPlus, Check, X, Bell, BellOff } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

/* ── Friend Requests Tab ── */
export function ConnectRequests() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["friend-requests", user?.id],
    queryFn: async () => {
      const all = await base44.entities.FriendRequest.filter({ status: "pending" }, "-created_date", 50);
      return all.filter((r) => r.recipient_id === user?.id);
    },
    enabled: !!user,
  });

  const handleRespond = async (requestId, accept) => {
    try {
      await base44.entities.FriendRequest.update(requestId, { status: accept ? "accepted" : "rejected" });
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
    } catch (e) { console.error("Failed to respond to request:", e); }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="glass rounded-[20px] mt-2">
        <EmptyState
          icon={UserPlus}
          title="No pending requests"
          description="When someone wants to connect, you'll see them here"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <AnimatePresence>
        {requests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-3 p-3 glass rounded-xl"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
            >
              {(req.requester_name || "?")[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground truncate">
                {req.requester_name || "Unknown"}
              </p>
              <p className="text-[12px] text-muted-foreground">wants to connect</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRespond(req.id, true)}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap"
                aria-label="Accept"
              >
                <Check className="w-[16px] h-[16px]" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleRespond(req.id, false)}
                className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center spring-tap"
                aria-label="Decline"
              >
                <X className="w-[16px] h-[16px]" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Notifications Tab ── */
export function ConnectNotifications() {
  const navigate = useNavigate();
  const { notifications, isLoading, markAsRead, filter, setFilter } = useNotificationCenter();

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "social", label: "Social" },
    { key: "academic", label: "Academic" },
    { key: "opportunity", label: "Opportunities" },
    { key: "system", label: "System" },
  ];

  const handleClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="glass rounded-[20px] mt-2">
        <EmptyState
          icon={BellOff}
          title="All caught up"
          description="You have no notifications right now"
        />
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {notifications.slice(0, 30).map((n) => (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left spring-tap transition-colors ${
                n.is_read ? "bg-transparent" : "bg-primary/5 border border-primary/10"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.is_read ? "bg-muted/60" : "bg-primary/15"
              }`}>
                <Bell className={`w-[15px] h-[15px] ${n.is_read ? "text-muted-foreground" : "text-primary"}`} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] ${n.is_read ? "font-medium text-muted-foreground" : "font-bold text-foreground"} truncate`}>
                  {n.title}
                </p>
                <p className="text-[12px] text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {new Date(n.created_date).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", weekday: "short" })}
                </p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}