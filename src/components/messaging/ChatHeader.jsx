import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Phone, Video, Search } from "lucide-react";
import {
  CONVERSATION_TYPES, getConversationDisplayTitle, getConversationDisplayImage,
  getOtherParticipant,
} from "./messagingConstants";

export default function ChatHeader({ conversation, user, typingUser, onBack, onCall, onVideoCall, onSearch, onInfo }) {
  if (!conversation) return null;

  const isDirect = conversation.type === "direct";
  const other = isDirect ? getOtherParticipant(conversation, user?.id) : null;
  const title = getConversationDisplayTitle(conversation, user?.id);
  const image = getConversationDisplayImage(conversation, user?.id);
  const typeMeta = CONVERSATION_TYPES[conversation.type] || CONVERSATION_TYPES.direct;
  const Icon = typeMeta.icon;
  const participantCount = conversation.participants?.length || 0;

  return (
    <div className="px-4 py-3 glass border-b border-border/20 flex items-center gap-2.5 z-10">
      <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted spring-tap shrink-0">
        <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
      </button>

      <button onClick={onInfo} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
        <div className="relative shrink-0">
          {image ? (
            <img src={image} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
          )}
          {isDirect && other && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-[15px] truncate text-foreground">{title}</h2>
          {typingUser ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-primary font-medium"
            >
              {typingUser.name} is typing...
            </motion.p>
          ) : isDirect ? (
            <p className="text-[11px] text-muted-foreground">{other ? "Active now" : "Offline"}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {participantCount} {participantCount === 1 ? "member" : "members"}
            </p>
          )}
        </div>
      </button>

      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={onCall} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted spring-tap">
          <Phone className="w-[17px] h-[17px] text-muted-foreground" strokeWidth={2} />
        </button>
        <button onClick={onVideoCall} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted spring-tap">
          <Video className="w-[17px] h-[17px] text-muted-foreground" strokeWidth={2} />
        </button>
        <button onClick={onSearch} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted spring-tap">
          <Search className="w-[17px] h-[17px] text-muted-foreground" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}