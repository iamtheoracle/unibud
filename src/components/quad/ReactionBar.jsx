import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import ReactionPicker from "./ReactionPicker";
import { REACTIONS, getUserReaction, formatCount } from "./quadConstants";

/**
 * Reaction bar showing total reactions and current user's reaction.
 * Long-press (mobile) or hover (desktop) opens the reaction picker.
 */
export default function ReactionBar({ postId, reactions = {}, likesCount = 0, onReact }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userReaction, setUserReaction] = useState(() => getUserReaction(postId));
  const [showBurst, setShowBurst] = useState(false);
  const pressTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setUserReaction(getUserReaction(postId));
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const currentReactionObj = REACTIONS.find((r) => r.id === userReaction);

  const handleQuickReact = () => {
    const newReaction = userReaction ? null : "like";
    setUserReaction(newReaction || null);
    onReact(newReaction);
    if (newReaction) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
  };

  const handlePickReaction = (reactionId) => {
    const newReaction = userReaction === reactionId ? null : reactionId;
    setUserReaction(newReaction || null);
    onReact(newReaction);
    setPickerOpen(false);
    if (newReaction) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
  };

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setPickerOpen(true);
    }, 350);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  // Collect active reactions for display
  const activeReactions = REACTIONS.filter((r) => (reactions[r.id] || 0) > 0);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Reaction Picker */}
      {pickerOpen && (
        <div className="absolute bottom-10 left-0 z-50">
          <ReactionPicker
            onSelect={handlePickReaction}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}

      {/* Like/React Button */}
      <button
        onClick={handleQuickReact}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap relative"
      >
        {showBurst && (
          <span className="absolute inset-0 grid place-items-center pointer-events-none">
            <span className="w-6 h-6 rounded-full border-2 border-primary/50 heart-burst" />
          </span>
        )}
        <motion.div
          animate={showBurst ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {currentReactionObj ? (
            <span className="text-[16px] leading-none">{currentReactionObj.emoji}</span>
          ) : (
            <ThumbsUp
              className="w-4 h-4 text-muted-foreground"
              strokeWidth={1.8}
            />
          )}
        </motion.div>
        <span
          className={`text-[11px] font-semibold ${
            currentReactionObj ? "" : "text-muted-foreground"
          }`}
          style={currentReactionObj ? { color: currentReactionObj.color } : {}}
        >
          {formatCount(likesCount || 0)}
        </span>
      </button>

      {/* Active reaction emoji stack (shown when multiple reaction types exist) */}
      {activeReactions.length > 1 && !pickerOpen && (
        <div className="flex items-center -ml-1">
          {activeReactions.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-card -ml-0.5"
              style={{ background: r.color + "20" }}
            >
              {r.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}