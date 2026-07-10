import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useConversations } from "@/hooks/useConversations";
import ConversationList from "@/components/messaging/ConversationList";
import ChatView from "@/components/messaging/ChatView";
import EmptyChatState from "@/components/messaging/EmptyChatState";
import NewConversationModal from "@/components/messaging/NewConversationModal";
import ChatHeader from "@/components/messaging/ChatHeader";
import MessageBubble from "@/components/messaging/MessageBubble";
import MessageComposer from "@/components/messaging/MessageComposer";
import {
  hasUnreadMessages, isSameDay, formatDateDivider,
} from "@/components/messaging/messagingConstants";

const DEMO_USER = {
  id: "demo-user",
  full_name: "Adaeze Okafor",
  email: "demo@unibud.com",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  university: "University of Benin",
  role: "student",
};

const DEMO_CONVERSATIONS = [
  {
    id: "demo-1",
    type: "lecturer",
    title: "Dr. Adeyemi",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    participants: [
      { user_id: "demo-user", name: "Adaeze", role: "student", last_read_at: new Date().toISOString() },
      { user_id: "dr-1", name: "Dr. Adeyemi", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", role: "lecturer" },
    ],
    last_message: { content: "Don't forget the assignment due Friday", author_name: "Dr. Adeyemi", type: "text", created_at: new Date(Date.now() - 3600000).toISOString() },
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    is_pinned: true,
  },
  {
    id: "demo-2",
    type: "study_group",
    title: "CSC 301 Study Group",
    avatar_url: "",
    participants: [
      { user_id: "demo-user", name: "Adaeze", role: "student", last_read_at: new Date(Date.now() - 7200000).toISOString() },
      { user_id: "u1", name: "Chidi Okafor", role: "student" },
      { user_id: "u2", name: "Fatima Bello", role: "student" },
      { user_id: "u3", name: "Emeka Nwosu", role: "student" },
    ],
    last_message: { content: "Can we meet tomorrow at 3PM?", author_name: "Fatima", type: "text", created_at: new Date(Date.now() - 7200000).toISOString() },
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "demo-3",
    type: "mentor",
    title: "Eng. Tunde Bakare",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    participants: [
      { user_id: "demo-user", name: "Adaeze", role: "student", last_read_at: new Date(Date.now() - 86400000).toISOString() },
      { user_id: "mentor-1", name: "Eng. Tunde Bakare", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", role: "mentor" },
    ],
    last_message: { content: "Great progress on your project! Let's schedule a review session.", author_name: "Eng. Tunde", type: "text", created_at: new Date(Date.now() - 86400000).toISOString() },
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    is_muted: false,
  },
  {
    id: "demo-4",
    type: "course",
    title: "PHY 203 — Quantum Mechanics",
    avatar_url: "",
    participants: [
      { user_id: "demo-user", name: "Adaeze", role: "student", last_read_at: new Date().toISOString() },
      { user_id: "u4", name: "Dr. Ibrahim", role: "lecturer" },
      { user_id: "u5", name: "Various Students", role: "student" },
    ],
    last_message: { content: "Tutorial notes uploaded to the library", author_name: "Dr. Ibrahim", type: "text", created_at: new Date(Date.now() - 172800000).toISOString() },
    last_message_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const DEMO_MESSAGES = {
  "demo-1": [
    { id: "dm1", content: "Hi Dr. Adeyemi, I have a question about the Data Structures assignment", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 7200000).toISOString(), read_by: ["demo-user", "dr-1"] },
    { id: "dm2", content: "Of course! What's your question?", type: "text", author_name: "Dr. Adeyemi", author_id: "dr-1", author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", created_date: new Date(Date.now() - 6600000).toISOString(), read_by: ["demo-user", "dr-1"] },
    { id: "dm3", content: "I'm confused about the time complexity of merge sort. Is it O(n log n) in all cases?", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 6000000).toISOString(), read_by: ["demo-user", "dr-1"] },
    { id: "dm4", content: "Yes, exactly! Merge sort has O(n log n) time complexity in all cases — best, average, and worst. Unlike quicksort which degrades to O(n²) in the worst case.", type: "text", author_name: "Dr. Adeyemi", author_id: "dr-1", author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", created_date: new Date(Date.now() - 5400000).toISOString(), read_by: ["demo-user", "dr-1"] },
    { id: "dm5", content: "That makes sense. Thank you!", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 4800000).toISOString(), read_by: ["demo-user", "dr-1"] },
    { id: "dm6", content: "Don't forget the assignment due Friday. Submit through the portal before 11:59 PM.", type: "text", author_name: "Dr. Adeyemi", author_id: "dr-1", author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", created_date: new Date(Date.now() - 3600000).toISOString(), read_by: ["demo-user", "dr-1"] },
  ],
  "demo-2": [
    { id: "dg1", content: "Hey everyone, how's the prep for the midterm going?", type: "text", author_name: "Chidi Okafor", author_id: "u1", created_date: new Date(Date.now() - 14400000).toISOString(), read_by: ["demo-user"] },
    { id: "dg2", content: "I've been going through the past papers. Question 3 from 2022 was tricky 🤔", type: "text", author_name: "Emeka Nwosu", author_id: "u3", created_date: new Date(Date.now() - 12600000).toISOString(), read_by: ["demo-user"] },
    { id: "dg3", content: "I struggled with that too. The recursion tree method was confusing", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 10800000).toISOString(), read_by: ["demo-user"] },
    { id: "dg4", content: "Can we meet tomorrow at 3PM in the library to review together?", type: "text", author_name: "Fatima Bello", author_id: "u2", created_date: new Date(Date.now() - 7200000).toISOString(), read_by: ["demo-user"] },
  ],
  "demo-3": [
    { id: "dm1", content: "Hi Eng. Tunde, I wanted to update you on my FYP progress", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 172800000).toISOString(), read_by: ["demo-user", "mentor-1"] },
    { id: "dm2", content: "I've completed the backend API and started working on the frontend. Should have a working prototype by next week.", type: "text", author_name: "Adaeze Okafor", author_id: "demo-user", author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 172700000).toISOString(), read_by: ["demo-user", "mentor-1"] },
    { id: "dm3", content: "Great progress on your project! Let's schedule a review session.", type: "text", author_name: "Eng. Tunde Bakare", author_id: "mentor-1", author_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", created_date: new Date(Date.now() - 86400000).toISOString(), read_by: ["demo-user", "mentor-1"] },
  ],
  "demo-4": [
    { id: "dp1", content: "Reminder: Quantum Mechanics tutorial this Friday at 3PM in Lab 3", type: "text", author_name: "Dr. Ibrahim", author_id: "u4", created_date: new Date(Date.now() - 259200000).toISOString(), read_by: ["demo-user"] },
    { id: "dp2", content: "Tutorial notes uploaded to the library", type: "text", author_name: "Dr. Ibrahim", author_id: "u4", created_date: new Date(Date.now() - 172800000).toISOString(), read_by: ["demo-user"] },
  ],
};

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [newConvOpen, setNewConvOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const {
    conversations, isLoading, filter, setFilter,
    togglePin, toggleMute, toggleArchive,
  } = useConversations(isDemoMode ? DEMO_USER : user);

  const activeUser = isDemoMode ? DEMO_USER : user;

  const demoConversations = useMemo(() => {
    return DEMO_CONVERSATIONS.map((c) => ({
      ...c,
      _hasUnread: hasUnreadMessages(c, DEMO_USER.id),
    }));
  }, []);

  const displayConversations = isDemoMode ? demoConversations : conversations;

  return (
    <div className="flex flex-col h-[calc(100dvh-112px)] overflow-hidden lg:flex-row lg:h-[calc(100dvh-128px)] lg:gap-0 lg:rounded-[24px] lg:overflow-hidden lg:border lg:border-border/20 lg:soft-shadow lg:bg-card">
      {/* Conversation List */}
      <div className={conversationId ? "hidden lg:block lg:w-[340px] lg:flex-shrink-0 lg:border-r lg:border-border/30" : "flex-1 min-h-0 lg:w-[340px] lg:flex-shrink-0 lg:border-r lg:border-border/30"}>
        <ConversationList
          conversations={displayConversations}
          isLoading={!isDemoMode && isLoading}
          activeId={conversationId}
          onSelect={(id) => navigate("/messages/" + id)}
          user={activeUser}
          filter={filter}
          setFilter={setFilter}
          togglePin={togglePin}
          toggleMute={toggleMute}
          toggleArchive={toggleArchive}
          onNewConversation={() => isDemoMode ? navigate("/messages/demo-1") : setNewConvOpen(true)}
        />
      </div>

      {/* Chat View */}
      <div className={conversationId ? "flex-1 min-h-0" : "hidden lg:block lg:flex-1"}>
        {conversationId && activeUser ? (
          isDemoMode ? (
            <DemoChatView
              conversationId={conversationId}
              user={activeUser}
              onBack={() => navigate("/messages")}
            />
          ) : (
            <ChatView
              conversationId={conversationId}
              user={activeUser}
              onBack={() => navigate("/messages")}
            />
          )
        ) : !conversationId ? (
          <div className="hidden lg:flex h-full">
            <EmptyChatState onNewConversation={() => setNewConvOpen(true)} />
          </div>
        ) : null}
      </div>

      {!isDemoMode && (
        <NewConversationModal
          open={newConvOpen}
          onClose={() => setNewConvOpen(false)}
          user={user}
          onCreate={(conv) => {
            setNewConvOpen(false);
            navigate("/messages/" + conv.id);
          }}
        />
      )}
    </div>
  );
}

function DemoChatView({ conversationId, user, onBack }) {
  const conversation = DEMO_CONVERSATIONS.find((c) => c.id === conversationId);
  const initialMessages = DEMO_MESSAGES[conversationId] || [];
  const [messages, setMessages] = useState(initialMessages);
  const [replyTo, setReplyTo] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [editValue, setEditValue] = useState("");

  if (!conversation) {
    return <EmptyChatState onNewConversation={onBack} />;
  }

  const handleSend = (content, type = "text") => {
    const newMsg = {
      id: "demo_new_" + Date.now(),
      conversation_id: conversationId,
      content,
      type,
      author_name: user.full_name,
      author_image: user.avatar_url,
      author_id: user.id,
      created_date: new Date().toISOString(),
      read_by: [user.id],
      reactions: {},
      reply_to_id: replyTo?.id || null,
      reply_to_content: replyTo?.content || null,
      reply_to_author: replyTo?.author_name || null,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyTo(null);
  };

  const handleReact = (emoji) => {
    if (!actionMessage) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== actionMessage.id) return m;
        const reactions = { ...(m.reactions || {}) };
        const voters = reactions[emoji] || [];
        if (voters.includes(user.id)) {
          reactions[emoji] = voters.filter((u) => u !== user.id);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...voters, user.id];
        }
        return { ...m, reactions };
      })
    );
  };

  const handleDelete = () => {
    if (!actionMessage) return;
    setMessages((prev) => prev.filter((m) => m.id !== actionMessage.id));
  };

  const renderMessages = () => {
    const elements = [];
    let prevMsg = null;

    messages.forEach((msg, i) => {
      if (!prevMsg || !isSameDay(msg.created_date, prevMsg.created_date)) {
        elements.push(
          <div key={"date_" + i} className="flex justify-center py-2">
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
              {formatDateDivider(msg.created_date)}
            </span>
          </div>
        );
      }

      const showAvatar = !prevMsg ||
        prevMsg.author_id !== msg.author_id ||
        new Date(msg.created_date) - new Date(prevMsg.created_date) > 5 * 60 * 1000;

      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.author_id === user.id}
          showAvatar={showAvatar}
          showName={showAvatar && msg.author_id !== user.id}
          user={user}
          onLongPress={() => setActionMessage(msg)}
          isEditing={false}
          editValue={editValue}
          onEditChange={setEditValue}
          onEditSubmit={() => {}}
          onEditCancel={() => {}}
        />
      );

      prevMsg = msg;
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        conversation={conversation}
        user={user}
        typingUser={null}
        onBack={onBack}
        onCall={() => {}}
        onVideoCall={() => {}}
        onSearch={() => {}}
        onInfo={() => {}}
      />

      <div className="flex-1 overflow-y-auto py-3">
        {renderMessages()}
      </div>

      <MessageComposer
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={null}
        editValue=""
        onEditChange={() => {}}
        onEditSubmit={() => {}}
        onEditCancel={() => {}}
        onOracleOpen={() => {}}
        disabled={false}
      />

      <DemoMessageActions
        open={!!actionMessage}
        message={actionMessage}
        isOwn={actionMessage?.author_id === user.id}
        onClose={() => setActionMessage(null)}
        onReact={handleReact}
        onReply={() => { setReplyTo(actionMessage); }}
        onDelete={handleDelete}
        onCopy={() => {
          if (actionMessage?.content) navigator.clipboard.writeText(actionMessage.content);
        }}
      />
    </div>
  );
}

function DemoMessageActions({ open, message, isOwn, onClose, onReact, onReply, onDelete, onCopy }) {
  if (!open || !message) return null;
  const QUICK = ["👍", "❤️", "😂", "😮", "😢", "👏"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg glass-strong rounded-t-[28px] pb-6 pt-3 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
        <div className="flex items-center justify-center gap-2 mb-4">
          {QUICK.map((emoji) => (
            <button key={emoji} onClick={() => { onReact(emoji); onClose(); }} className="w-11 h-11 rounded-full flex items-center justify-center text-[22px] spring-tap hover:bg-muted bg-card border border-border/30">
              {emoji}
            </button>
          ))}
        </div>
        <div className="h-px bg-border/30 mb-2" />
        <div className="grid grid-cols-4 gap-1">
          <button onClick={() => { onReply(); onClose(); }} className="flex flex-col items-center gap-1.5 py-3 spring-tap">
            <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center"><span className="text-[14px]">↩</span></div>
            <span className="text-[10px] font-medium">Reply</span>
          </button>
          <button onClick={() => { onCopy(); onClose(); }} className="flex flex-col items-center gap-1.5 py-3 spring-tap">
            <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center"><span className="text-[14px]">📋</span></div>
            <span className="text-[10px] font-medium">Copy</span>
          </button>
          {isOwn && (
            <button onClick={() => { onDelete(); onClose(); }} className="flex flex-col items-center gap-1.5 py-3 spring-tap">
              <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center"><span className="text-[14px]">🗑</span></div>
              <span className="text-[10px] font-medium text-destructive">Delete</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-full bg-card border border-border/40 text-[13px] font-medium text-muted-foreground spring-tap">Cancel</button>
      </div>
    </div>
  );
}