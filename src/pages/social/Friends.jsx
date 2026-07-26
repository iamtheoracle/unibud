import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserPlus, UserMinus, Clock, Users, ShieldOff } from "lucide-react";
import { useFriends } from "@/lib/social/useFriends";

const TABS = [
  { key: "friends", label: "Friends", icon: Users },
  { key: "requests", label: "Requests", icon: Clock },
  { key: "blocked", label: "Blocked", icon: ShieldOff },
];

function Avatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full bg-primary/12 flex items-center justify-center text-primary font-semibold text-[16px] shrink-0">
      {initial}
    </div>
  );
}

export default function Friends() {
  const { meId, friends, incoming, outgoing, blocked, respond, remove, loading } = useFriends();
  const [tab, setTab] = useState("friends");

  const otherName = (r, isRecipient) =>
    isRecipient ? r.requester_name || "Student" : r.recipient_name || "Student";

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Friends</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Your trusted circle — requests, connections and privacy.</p>
      </header>

      <div className="flex gap-2 mb-5 p-1 rounded-[16px] bg-muted/40">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = t.key === "friends" ? friends.length : t.key === "requests" ? incoming.length : blocked.length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[12px] text-[12px] font-semibold transition-colors spring-tap ${
                active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === "friends" && (
            <FriendsList friends={friends} meId={meId} onUnfriend={(r) => remove(r.id)} loading={loading} />
          )}
          {tab === "requests" && (
            <RequestsList incoming={incoming} outgoing={outgoing} otherName={otherName} onAccept={(r) => respond({ id: r.id, status: "accepted" })} onDecline={(r) => respond({ id: r.id, status: "declined" })} onCancel={(r) => remove(r.id)} loading={loading} />
          )}
          {tab === "blocked" && (
            <BlockedList blocked={blocked} otherName={otherName} onUnblock={(r) => remove(r.id)} loading={loading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FriendsList({ friends, meId, onUnfriend, loading }) {
  if (friends.length === 0) {
    return (
      <EmptyState icon={UserCheck} title="No friends yet" body="Connect with classmates, study partners and people nearby to grow your circle." />
    );
  }
  return (
    <div className="space-y-2.5">
      {friends.map((r) => {
        const name = r.recipient_id === meId ? r.requester_name : r.recipient_name;
        return (
          <div key={r.id} className="flex items-center gap-3 rounded-[18px] p-3 glass-card">
            <Avatar name={name} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground">Connected</p>
            </div>
            <button
              onClick={() => onUnfriend(r)}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 spring-tap disabled:opacity-50"
            >
              <UserMinus className="w-3 h-3" /> Unfriend
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RequestsList({ incoming, outgoing, otherName, onAccept, onDecline, onCancel, loading }) {
  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <EmptyState icon={UserPlus} title="No pending requests" body="Friend requests you send or receive will appear here." />
    );
  }
  return (
    <div className="space-y-2.5">
      {incoming.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-[18px] p-3 glass-card">
          <Avatar name={otherName(r, true)} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-foreground truncate">{otherName(r, true)}</p>
            <p className="text-[11px] text-muted-foreground truncate">{r.note || "Wants to connect"}</p>
          </div>
          <button onClick={() => onAccept(r)} disabled={loading} className="text-[11px] font-semibold text-primary-foreground px-3 py-1.5 rounded-full bg-primary spring-tap disabled:opacity-50">Accept</button>
          <button onClick={() => onDecline(r)} disabled={loading} className="text-[11px] font-semibold text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 spring-tap disabled:opacity-50">Decline</button>
        </div>
      ))}
      {outgoing.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-[18px] p-3 glass-card">
          <Avatar name={otherName(r, false)} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-foreground truncate">{otherName(r, false)}</p>
            <p className="text-[11px] text-muted-foreground">Request sent</p>
          </div>
          <button onClick={() => onCancel(r)} disabled={loading} className="text-[11px] font-semibold text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 spring-tap disabled:opacity-50">Cancel</button>
        </div>
      ))}
    </div>
  );
}

function BlockedList({ blocked, otherName, onUnblock, loading }) {
  if (blocked.length === 0) {
    return (
      <EmptyState icon={ShieldOff} title="No blocked accounts" body="People you block won't be able to reach you or see your profile." />
    );
  }
  return (
    <div className="space-y-2.5">
      {blocked.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-[18px] p-3 glass-card">
          <Avatar name={otherName(r, false)} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-foreground truncate">{otherName(r, false)}</p>
            <p className="text-[11px] text-muted-foreground">Blocked</p>
          </div>
          <button onClick={() => onUnblock(r)} disabled={loading} className="text-[11px] font-semibold text-primary px-3 py-1.5 rounded-full bg-primary/8 spring-tap disabled:opacity-50">Unblock</button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="rounded-[24px] p-8 glass-card text-center">
      <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <p className="text-[14px] font-semibold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground mt-1">{body}</p>
    </div>
  );
}