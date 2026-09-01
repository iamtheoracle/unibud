import React, { useState } from "react";
import { motion } from "framer-motion";

const EMOJI_CATEGORIES = {
  Smileys: ["😀", "😂", "🥰", "😍", "🤔", "😎", "🤩", "😴", "🥳", "😭", "😅", "🙃", "😇", "🤗", "🤫", "😏", "😬", "🤯", "😱", "🥺"],
  Gestures: ["👍", "👎", "👏", "🙌", "🤝", "🙏", "✌️", "🤞", "🤟", "👌", "💪", "🫶", "👋", "🤙", "✋", "💪"],
  Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💖", "💘", "💝"],
  Party: ["🎉", "🎊", "🥂", "🎂", "🎈", "🎁", "🏆", "🥇", "⭐", "🌟", "✨", "🔥", "💯", "🎯", "🚀", "💫"],
  Objects: ["📚", "📝", "💡", "🎓", "🔬", "💻", "📱", "☕", "🍕", "🍔", "🎵", "⚽", "🏀", "Chess", "🎲", "🎮"],
  Nature: ["🌸", "🌺", "🌻", "🌈", "☀️", "🌙", "⚡", "🌊", "🍃", "🌱", "🌳", "🌍", "🏔️", "🏖️", "🔥", "❄️"],
};

export default function EmojiPicker({ onSelect, onClose: _onClose }) {
  const [category, setCategory] = useState("Smileys");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-card rounded-[20px] border border-border/40 soft-shadow overflow-hidden"
    >
      <div className="flex gap-1 px-2 pt-2 overflow-x-auto no-scrollbar">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
              category === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[160px] overflow-y-auto no-scrollbar">
        {EMOJI_CATEGORIES[category].map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg spring-tap"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}