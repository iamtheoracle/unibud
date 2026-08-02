import React from "react";
import { motion } from "framer-motion";
import { Users, Radio, Plus, Check } from "lucide-react";
import { getGameType } from "./gamesConstants";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * GameRoomCard — displays a game room with participants, status, and join/leave.
 */
export default function GameRoomCard({ room, user, onJoin }) {
  const gameType = getGameType(room.game_type);
  const Icon = gameType.Icon;
  const participants = room.participants || [];
  const hasJoined = participants.some((p) => p.user_id === user?.id);
  const isFull = participants.length >= (room.max_participants || 2);
  const isInProgress = room.status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="p-3 rounded-[18px] glass-card"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-muted/40 shrink-0">
          <Icon className="w-5 h-5 text-foreground/70" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-1">{room.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{gameType.label}</span>
            {isInProgress && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-warning">
                <Radio className="w-2.5 h-2.5" /> LIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => { hapticTap(); onJoin(room); }}
          disabled={isFull && !hasJoined}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold spring-tap shrink-0 disabled:opacity-40 ${
            hasJoined ? "glass text-foreground" : "bg-foreground text-background"
          }`}
        >
          {hasJoined ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span className="ml-1">{hasJoined ? "Joined" : isFull ? "Full" : "Join"}</span>
        </button>
      </div>

      {/* Participant avatars */}
      <div className="flex items-center gap-1.5 mt-2.5">
        <Users className="w-3 h-3 text-muted-foreground" />
        <div className="flex -space-x-1.5">
          {participants.slice(0, 5).map((p, i) => (
            <div key={p.user_id || i} className="w-5 h-5 rounded-full ring-1 ring-background overflow-hidden bg-muted grid place-items-center">
              {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[8px] font-bold text-muted-foreground">{p.name?.[0]?.toUpperCase()}</span>}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground ml-1">
          {participants.length}/{room.max_participants || 2}
        </span>
        {room.voice_chat_enabled && <span className="text-[9px] text-muted-foreground ml-auto">🔊 Voice</span>}
      </div>
    </motion.div>
  );
}