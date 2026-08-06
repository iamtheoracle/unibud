import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bookmark, Heart, Clock, MapPin, BarChart3, Eye,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useStorySeen } from "@/hooks/useStorySeen";
import { HIGHLIGHT_CATEGORIES } from "./storyConstants";

const QUICK_EMOJIS = ["❤️", "🔥", "👏", "💯", "🎉", "🤔"];

export default function StoryViewer({
  groups,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
  user,
  isDemoMode = false,
  mode = "active",
  onClose,
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [savedHighlight, setSavedHighlight] = useState(false);
  const [pollVotes, setPollVotes] = useState({});
  const [floatingEmoji, setFloatingEmoji] = useState(null);
  const videoRef = useRef(null);
  const progressRef = useRef(0);
  progressRef.current = progress;
  const { isSeen, markSeen } = useStorySeen();

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const duration = currentStory?.duration_seconds || 5;

  const advanceRef = useRef(() => {});
  advanceRef.current = () => {
    setProgress(0);
    if (currentGroup && storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goBackRef = useRef(() => {});
  goBackRef.current = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex(groupIndex - 1);
      setStoryIndex(Math.max(0, (prevGroup?.stories.length || 1) - 1));
    }
  };

  // Track seen + create StoryView
  useEffect(() => {
    if (!currentStory || mode !== "active" || isDemoMode) return;
    if (isSeen(currentStory.id)) return;
    markSeen(currentStory.id);

    base44.entities.StoryView.create({
      story_id: currentStory.id,
      viewer_name: user?.full_name || "Student",
      viewer_image: user?.avatar_url || "",
      viewer_handle: user?.department || "",
      viewed_at: new Date().toISOString(),
    }).catch(() => {});

    base44.entities.Story.update(currentStory.id, {
      views_count: (currentStory.views_count || 0) + 1,
    }).catch(() => {});
  }, [currentStory?.id, mode, isDemoMode]);

  // Progress timer for non-video stories
  useEffect(() => {
    if (!currentStory || isPaused) return;
    if (currentStory.type === "video" && currentStory.media_url) return;

    const startTime = performance.now();
    const initialProgress = progressRef.current;
    let raf;

    const tick = (now) => {
      const elapsed = (now - startTime) / (duration * 1000) + initialProgress;
      if (elapsed >= 1) {
        setProgress(0);
        advanceRef.current();
      } else {
        setProgress(elapsed);
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, currentStory?.id, duration, currentStory?.type]);

  // Video play/pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStory?.media_url || currentStory.type !== "video") return;
    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPaused, currentStory?.id, currentStory?.type]);

  // Reset saved highlight state on story change
  useEffect(() => {
    setSavedHighlight(!!currentStory?.is_highlight);
    setShowHighlightPicker(false);
  }, [currentStory?.id]);

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.35) {
      goBackRef.current();
    } else if (x > rect.width * 0.65) {
      advanceRef.current();
    } else {
      setIsPaused((p) => !p);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || isDemoMode) {
      setReplyText("");
      return;
    }
    try {
      await base44.entities.StoryReply.create({
        story_id: currentStory.id,
        content: replyText,
        author_name: user?.full_name || "Student",
        author_image: user?.avatar_url || "",
        type: "text",
      });
      await base44.entities.Story.update(currentStory.id, {
        replies_count: (currentStory.replies_count || 0) + 1,
      });
    } catch {}
    setReplyText("");
  };

  const handleReact = async (emoji) => {
    setShowReactions(false);
    setFloatingEmoji(emoji);
    setTimeout(() => setFloatingEmoji(null), 1500);

    if (isDemoMode) return;
    try {
      await base44.entities.StoryReply.create({
        story_id: currentStory.id,
        content: emoji,
        reaction_emoji: emoji,
        author_name: user?.full_name || "Student",
        author_image: user?.avatar_url || "",
        type: "reaction",
      });
      await base44.entities.Story.update(currentStory.id, {
        replies_count: (currentStory.replies_count || 0) + 1,
      });
    } catch {}
  };

  const handleSaveHighlight = async (category) => {
    setShowHighlightPicker(false);
    setSavedHighlight(true);
    if (isDemoMode) return;
    try {
      await base44.entities.Story.update(currentStory.id, {
        is_highlight: true,
        highlight_category: category,
      });
    } catch {}
  };

  const handlePollVote = async (optionIndex) => {
    if (!currentStory?.poll_data) return;
    const pollKey = `story_poll_${currentStory.id}`;
    try {
      if (localStorage.getItem(pollKey) !== null) return;
      localStorage.setItem(pollKey, String(optionIndex));
    } catch { return; }

    setPollVotes((prev) => ({ ...prev, [currentStory.id]: optionIndex }));

    if (!isDemoMode) {
      try {
        const updatedPollData = {
          ...currentStory.poll_data,
          options: currentStory.poll_data.options.map((opt, i) =>
            i === optionIndex ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
          ),
        };
        await base44.entities.Story.update(currentStory.id, { poll_data: updatedPollData });
      } catch {}
    }
  };

  if (!currentStory) return null;

  const getPollData = () => {
    if (!currentStory.poll_data) return null;
    const voted = pollVotes[currentStory.id];
    try {
      const stored = localStorage.getItem(`story_poll_${currentStory.id}`);
      if (stored !== null) return { ...currentStory.poll_data, userVoted: parseInt(stored) };
    } catch {}
    if (voted !== undefined) {
      return {
        ...currentStory.poll_data,
        userVoted: voted,
        options: currentStory.poll_data.options.map((opt, i) =>
          i === voted ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
        ),
      };
    }
    return { ...currentStory.poll_data, userVoted: null };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black flex items-center justify-center"
    >
      {/* Story content container */}
      <div
        className="relative w-full h-full max-w-md mx-auto overflow-hidden"
        onClick={handleTap}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background */}
        {currentStory.type === "text" ? (
          <div className="absolute inset-0 flex items-center justify-center p-8" style={{ background: currentStory.background_color || "#000" }}>
            <p className="text-white text-center text-[18px] font-heading font-medium leading-relaxed">{currentStory.content}</p>
          </div>
        ) : currentStory.type === "video" && currentStory.media_url ? (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            poster={currentStory.thumbnail_url}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onTimeUpdate={(e) => {
              const video = e.target;
              if (video.duration) setProgress(video.currentTime / video.duration);
            }}
            onEnded={() => advanceRef.current()}
          />
        ) : (
          <img src={currentStory.media_url || currentStory.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" alt="" loading="lazy" />
        )}

        {/* Caption overlay for media stories */}
        {currentStory.type !== "text" && currentStory.content && (
          <div className="absolute bottom-24 left-0 right-0 px-5 pointer-events-none">
            <p className="text-white text-[14px] font-medium drop-shadow-lg">{currentStory.content}</p>
          </div>
        )}

        {/* Stickers */}
        <div className="absolute bottom-24 left-0 right-0 px-4 space-y-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {currentStory.stickers?.map((sticker, i) => (
            <StorySticker
              key={i}
              sticker={sticker}
              pollData={sticker.type === "poll" ? getPollData() : null}
              onVote={handlePollVote}
            />
          ))}
          {currentStory.poll_data && !currentStory.stickers && (
            <StorySticker
              sticker={{ type: "poll", data: getPollData() }}
              pollData={getPollData()}
              onVote={handlePollVote}
            />
          )}
          {currentStory.countdown_data && (
            <CountdownSticker data={currentStory.countdown_data} />
          )}
          {currentStory.location && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-white text-[11px] font-medium">{currentStory.location}</span>
            </div>
          )}
          {currentStory.link_url && (
            <a
              href={currentStory.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-sm"
            >
              <span className="text-white text-[11px] font-medium truncate block">{currentStory.link_url}</span>
            </a>
          )}
        </div>

        {/* Floating emoji reaction */}
        <AnimatePresence>
          {floatingEmoji && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -200, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 text-6xl pointer-events-none z-30"
            >
              {floatingEmoji}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top overlay: progress bars + author */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 max-w-md mx-auto">
        <div className="flex gap-1 mb-3">
          {currentGroup?.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentGroup?.authorImage ? (
              <img src={currentGroup.authorImage} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" loading="lazy" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-[12px] font-bold">{(currentGroup?.authorName || "U").charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-white text-[13px] font-semibold leading-tight">{currentGroup?.authorName}</p>
              <p className="text-white/60 text-[10px]">{currentGroup?.authorHandle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center spring-tap" aria-label="Close story viewer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom: reply bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 max-w-md mx-auto">
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center gap-3 mb-3"
            >
              {QUICK_EMOJIS.map((emoji, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 1.4 }}
                  onClick={() => handleReact(emoji)}
                  className="text-3xl spring-tap"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHighlightPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card rounded-3xl p-4 mb-3"
            >
              <p className="text-foreground font-semibold text-[13px] mb-3">Save to Highlights</p>
              <div className="grid grid-cols-3 gap-2.5">
                {HIGHLIGHT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSaveHighlight(cat.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/30 spring-tap"
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: cat.color + "20" }}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <span className="text-[10px] text-foreground font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === "active" && (
          <div className="flex items-center gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              placeholder={`Reply to ${currentGroup?.authorName?.split(" ")[0] || ""}...`}
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5 text-white text-[13px] placeholder:text-white/40 focus:outline-none focus:border-white/40"
              aria-label="Reply to story"
            />
            <button
              onClick={() => setShowReactions((s) => !s)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center spring-tap"
              aria-label="Quick reactions"
            >
              <Heart className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => !savedHighlight && setShowHighlightPicker((s) => !s)}
              disabled={savedHighlight}
              className={"w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center spring-tap " + (savedHighlight ? "bg-primary" : "bg-white/10")}
              aria-label="Save to highlights"
            >
              <Bookmark className={"w-5 h-5 " + (savedHighlight ? "text-primary-foreground fill-primary-foreground" : "text-white")} />
            </button>
          </div>
        )}

        {/* Views count */}
        {mode === "active" && !isDemoMode && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Eye className="w-3 h-3 text-white/40" />
            <span className="text-white/40 text-[10px]">{currentStory.views_count || 0} views</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StorySticker({ sticker, pollData, onVote }) {
  const { type, data } = sticker;

  if (type === "poll" && pollData) {
    const totalVotes = (pollData.options || []).reduce((sum, opt) => sum + (opt.votes || 0), 0);
    return (
      <div className="rounded-2xl bg-black/40 backdrop-blur-md p-3 border border-white/10">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white text-[12px] font-semibold">{pollData.question || "Poll"}</span>
        </div>
        <div className="space-y-1.5">
          {(pollData.options || []).map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
            const voted = pollData.userVoted === i;
            return (
              <button
                key={i}
                onClick={() => onVote(i)}
                disabled={pollData.userVoted !== null}
                className="w-full relative overflow-hidden rounded-xl bg-white/10 border border-white/10 p-2 text-left transition-all spring-tap disabled:cursor-default"
              >
                {pollData.userVoted !== null && (
                  <div className="absolute inset-0 bg-primary/20" style={{ width: `${pct}%` }} />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-white text-[11px] font-medium">{opt.text || `Option ${i + 1}`}</span>
                  {pollData.userVoted !== null && (
                    <span className="text-white/70 text-[10px]">{pct}%</span>
                  )}
                  {voted && <span className="text-primary text-[10px] ml-1">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        {totalVotes > 0 && (
          <p className="text-white/40 text-[10px] mt-1.5">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
        )}
      </div>
    );
  }

  if (type === "question" && data?.question) {
    return (
      <div className="rounded-2xl bg-black/40 backdrop-blur-md p-3 border border-white/10">
        <p className="text-white text-[12px] font-medium">{data.question}</p>
      </div>
    );
  }

  if (type === "countdown" && data?.target_date) {
    return <CountdownSticker data={data} />;
  }

  if (type === "location" && data?.name) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
        <MapPin className="w-3 h-3 text-white" />
        <span className="text-white text-[11px] font-medium">{data.name}</span>
      </div>
    );
  }

  if (type === "link" && data?.url) {
    return (
      <a href={data.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-sm">
        <span className="text-white text-[11px] font-medium truncate block">{data.title || data.url}</span>
      </a>
    );
  }

  return null;
}

function CountdownSticker({ data }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const target = new Date(data.target_date).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining("Completed");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (days > 0) setRemaining(`${days}d ${hours}h ${mins}m`);
      else if (hours > 0) setRemaining(`${hours}h ${mins}m ${secs}s`);
      else setRemaining(`${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [data.target_date]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
      <Clock className="w-3 h-3 text-primary" />
      <span className="text-white text-[11px] font-medium">{data.label || "Countdown"}</span>
      <span className="text-primary text-[12px] font-bold tabular-nums">{remaining}</span>
    </div>
  );
}