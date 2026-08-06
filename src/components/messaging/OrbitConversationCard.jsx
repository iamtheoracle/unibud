import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, BellOff, Archive, CheckCheck, Check, BadgeCheck,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import {
  CONVERSATION_TYPES, getConversationDisplayTitle, getConversationDisplayImage,
  getLastMessagePreview, hasUnreadMessages, formatRelativeTime,
  getCategoryMeta, isVerifiedParticipant, getParticipantUniversity,
  getTypingUser,
} from "./messagingConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitConversationCard — premium glass conversation row.
 * Avatar with category icon, verification, typing, read receipts,
 * unread badge, pinned/muted indicators, long-press context menu.
 */
export default function OrbitConversationCard({
  conversation, user, isActive, onSelect, onTogglePin, onToggleMute, onToggleArchive,
  onAvatarTap, index = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const unread = hasUnreadMessages(conversation, user?.id);
  const title = getConversationDisplayTitle(conversation, user?.id);
  const image = getConversationDisplayImage(conversation, user?.id);
  const typeMeta = CONVERSATION_TYPES[conversation.type] || CONVERSATION_TYPES.direct;
  const Icon = typeMeta.icon;
  const catMeta = getCategoryMeta(conversation);
  const CatIcon = catMeta.icon;
  const verified = isVerifiedParticipant(conversation, user?.id);
  const university = getParticipantUniversity(conversation, user?.id);
  const typingUser = getTypingUser(conversation, user?.id);
  const isOwnLast = conversation.last_message?.author_id === user?.id;

  const handleLongPressStart = () => {
    const timer = setTimeout(() => setMenuOpen(true), 500);
    setLongPressTimer(timer);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index * 0.035, 0.35) }}
      className="relative"
    >
      <div
        onClick={() => onSelect(conversation.id)}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
        onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true); }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-[18px] cursor-pointer transition-all spring-tap ${
          isActive
            ? "glass border border-primary/15"
            : "hover:bg-muted/40 active:bg-muted/60"
        }`}
      >
        {/* Avatar with category icon */}
        <div className="relative flex-shrink-0" onClick={(e) => { e.stopPropagation(); onAvatarTap?.(conversation); }}>
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
            {image ? (
              <Image src={image} alt="" fittingType="fill" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary text-[17px] font-bold text-foreground">
                {(title || "?").charAt(0)}
              </div>
            )}
          </div>
          {/* Category icon badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-[20px] h-[20px] rounded-full bg-card border-2 border-background flex items-center justify-center">
            <CatIcon className="w-[11px] h-[11px] text-muted-foreground" strokeWidth={2.2} />
          </div>
          {/* Unread dot */}
          {unread && !typingUser && (
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <span className={`font-heading font-semibold text-[14px] truncate ${unread ? "text-foreground" : "text-foreground/85"}`}>
                {title}
              </span>
              {verified && <BadgeCheck className="w-[14px] h-[14px] text-primary flex-shrink-0 fill-primary/15" />}
              {conversation.is_pinned && <Pin className="w-[11px] h-[11px] text-muted-foreground/60 flex-shrink-0" strokeWidth={2.5} />}
              {conversation.is_muted && <BellOff className="w-[11px] h-[11px] text-muted-foreground/60 flex-shrink-0" strokeWidth={2.5} />}
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 font-medium">
              {formatRelativeTime(conversation.last_message_at || conversation.created_date)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {typingUser ? (
              <div className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary"
                      style={{ animation: `live-typing-350 1.4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </span>
                <span className="text-[12px] text-primary font-medium">{typingUser.name?.split(" ")[0]} is typing…</span>
              </div>
            ) : (
              <p className={`text-[12px] truncate flex items-center gap-1 ${unread ? "text-foreground/75 font-medium" : "text-muted-foreground"}`}>
                {isOwnLast && conversation.last_message && (
                  <span className="flex-shrink-0 flex items-center">
                    {unread ? (
                      <Check className="w-[12px] h-[12px] text-muted-foreground/50" strokeWidth={2.5} />
                    ) : (
                      <CheckCheck className="w-[12px] h-[12px] text-primary/60" strokeWidth={2.5} />
                    )}
                  </span>
                )}
                <span className="truncate">{getLastMessagePreview(conversation)}</span>
              </p>
            )}
            {unread && !typingUser && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                •
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Long-press context menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="absolute right-3 top-14 z-50 w-44 glass-strong rounded-2xl py-1.5 elevated-shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <MenuRow icon={Pin} label={conversation.is_pinned ? "Unpin" : "Pin"} onClick={() => { onTogglePin?.(conversation.id, conversation.is_pinned); setMenuOpen(false); }} />
              <MenuRow icon={BellOff} label={conversation.is_muted ? "Unmute" : "Mute"} onClick={() => { onToggleMute?.(conversation.id, conversation.is_muted); setMenuOpen(false); }} />
              <MenuRow icon={Archive} label={conversation.is_archived ? "Unarchive" : "Archive"} onClick={() => { onToggleArchive?.(conversation.id, conversation.is_archived); setMenuOpen(false); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2.5 text-left text-[12px] hover:bg-muted/60 flex items-center gap-2.5 transition-colors spring-tap">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
      <span className="text-foreground/90">{label}</span>
    </button>
  );
}