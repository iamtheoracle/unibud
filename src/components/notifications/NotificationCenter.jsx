import React from "react";
import { AnimatePresence } from "framer-motion";
import { Inbox, CheckCheck, Loader2 } from "lucide-react";
import NotificationFilterBar from "./NotificationFilterBar";
import NotificationItem from "./NotificationItem";
import EmptyState from "@/components/ui/EmptyState";

export default function NotificationCenter({ hook }) {
  const {
    sections, unreadCount, filter, setFilter, isLoading, isFetching,
    markRead, markAllRead, togglePin, archive, loadMore, hasMore,
  } = hook;

  const onAction = (type, item) => {
    if (type === "pin") togglePin(item);
    else if (type === "read") markRead(item);
    else if (type === "archive") archive(item);
  };

  return (
    <div className="px-4 space-y-4 pb-10">
      <NotificationFilterBar active={filter} onChange={setFilter} unreadCount={unreadCount} />

      {unreadCount > 0 && filter !== "archived" && (
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-[12px] font-medium text-primary spring-tap"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      )}

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[84px] rounded-[20px] shimmer" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="Announcements, assignment reminders, and campus updates will appear here."
        />
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {sections.map((section) => (
              <div key={section.key}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">
                  {section.label}
                </p>
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {section.items.map((item) => (
                      <NotificationItem
                        key={item.id}
                        item={item}
                        onAction={(type) => onAction(type, item)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isFetching}
              className="w-full py-2.5 rounded-full glass text-[12px] font-semibold text-muted-foreground spring-tap flex items-center justify-center gap-2"
            >
              {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}