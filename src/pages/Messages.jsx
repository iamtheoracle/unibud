import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useConversations } from "@/hooks/useConversations";
import OrbitMessagingHome from "@/components/messaging/OrbitMessagingHome";
import ChatView from "@/components/messaging/ChatView";
import EmptyChatState from "@/components/messaging/EmptyChatState";
import NewConversationModal from "@/components/messaging/NewConversationModal";
import OrbitProfilePreview from "@/components/messaging/OrbitProfilePreview";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [previewConv, setPreviewConv] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const {
    conversations, isLoading, filter, setFilter,
    togglePin, toggleMute, toggleArchive,
  } = useConversations(user);

  const activeConversation = conversations?.find((c) => c.id === conversationId);

  return (
    <div className="flex flex-col h-[calc(100dvh-112px)] overflow-hidden lg:flex-row lg:h-[calc(100dvh-128px)] lg:gap-0 lg:rounded-[24px] lg:overflow-hidden lg:border lg:border-border/20 lg:soft-shadow lg:bg-card">
      {/* Conversation List */}
      <div className={conversationId ? "hidden lg:block lg:w-[360px] lg:flex-shrink-0 lg:border-r lg:border-border/30" : "flex-1 min-h-0 lg:w-[360px] lg:flex-shrink-0 lg:border-r lg:border-border/30"}>
        <OrbitMessagingHome
          conversations={conversations}
          isLoading={isLoading}
          activeId={conversationId}
          onSelect={(id) => navigate("/messages/" + id)}
          onNewConversation={() => setNewConvOpen(true)}
          user={user}
          filter={filter}
          setFilter={setFilter}
          onTogglePin={togglePin}
          onToggleMute={toggleMute}
          onToggleArchive={toggleArchive}
          onAvatarTap={(conv) => setPreviewConv(conv)}
        />
      </div>

      {/* Chat View */}
      <div className={conversationId ? "flex-1 min-h-0" : "hidden lg:block lg:flex-1"}>
        {conversationId && user ? (
          <ChatView
            conversationId={conversationId}
            user={user}
            onBack={() => navigate("/messages")}
          />
        ) : !conversationId ? (
          <div className="hidden lg:flex h-full">
            <EmptyChatState onNewConversation={() => setNewConvOpen(true)} />
          </div>
        ) : null}
      </div>

      {/* New conversation modal */}
      <NewConversationModal
        open={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        user={user}
        onCreate={(conv) => {
          setNewConvOpen(false);
          navigate("/messages/" + conv.id);
        }}
      />

      {/* Profile preview sheet */}
      <OrbitProfilePreview
        conversation={previewConv}
        user={user}
        open={!!previewConv}
        onClose={() => setPreviewConv(null)}
        onMessage={() => previewConv && navigate("/messages/" + previewConv.id)}
      />
    </div>
  );
}