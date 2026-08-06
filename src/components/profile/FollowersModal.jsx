import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];

export default function FollowersModal({ open, onClose, title, users = [] }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] glass-card p-4 pb-8 max-h-[70vh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
              <button type="button" onClick={onClose} className="text-[12px] text-muted-foreground spring-tap">
                Close
              </button>
            </div>

            <div className="space-y-2">
              {users.length === 0 ? (
                <div className="p-4 rounded-[16px] glass-card text-center text-[12px] text-muted-foreground">
                  No users yet.
                </div>
              ) : (
                users.map((record) => {
                  const targetId = title === "Followers" ? record.follower_id : record.followed_id;
                  return (
                    <div key={record.id} className="flex items-center justify-between gap-3 p-3 rounded-[16px] glass-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted grid place-items-center text-[14px] font-bold text-muted-foreground shrink-0">
                          {targetId?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground">User</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{targetId}</p>
                        </div>
                      </div>
                      <Link to={`/profile/${targetId}`} className="text-[12px] font-semibold text-primary spring-tap">
                        View Profile
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
