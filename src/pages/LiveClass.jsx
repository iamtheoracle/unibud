import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LiveClassHeader from "@/components/live/LiveClassHeader";
import LiveVideoStage from "@/components/live/LiveVideoStage";
import LiveControlBar from "@/components/live/LiveControlBar";
import LiveBudPanel from "@/components/live/LiveBudPanel";
import LiveChatPanel from "@/components/live/LiveChatPanel";
import LiveParticipantList from "@/components/live/LiveParticipantList";
import LivePoll from "@/components/live/LivePoll";
import LiveQuiz from "@/components/live/LiveQuiz";
import BreakoutRooms from "@/components/live/BreakoutRooms";

const MOCK_POLL = {
  question: "Which traversal visits root before children?",
  options: [
    { text: "In-order", votes: 3 },
    { text: "Pre-order", votes: 8 },
    { text: "Post-order", votes: 2 },
    { text: "Level-order", votes: 1 },
  ],
};

const MOCK_QUIZ = {
  questions: [
    { question: "What is the time complexity of BST search?", options: ["O(1)", "O(log n)", "O(n²)", "O(n log n)"], correct: 1 },
    { question: "Which property makes a valid BST?", options: ["Left > Root", "Left < Root < Right", "Unordered", "All equal"], correct: 1 },
  ],
};

export default function LiveClass() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const [view, setView] = useState("speaker");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [whiteboard, setWhiteboard] = useState(false);
  const [recording] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reactions.length === 0) return;
    const t = setTimeout(() => setReactions(r => r.slice(1)), 2500);
    return () => clearTimeout(t);
  }, [reactions]);

  const sendReaction = (emoji) => setReactions(r => [...r, { id: Date.now(), emoji, x: 20 + Math.random() * 60 }]);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <LiveClassHeader elapsed={fmt(elapsed)} recording={recording} onBack={() => navigate("/live")} />

      <div className="flex-1 relative px-3 pb-2 min-h-0">
        <LiveVideoStage view={view} whiteboard={whiteboard} screenSharing={screenSharing} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {reactions.map(r => (
              <motion.div key={r.id} initial={{ y: 0, opacity: 1, left: `${r.x}%` }} animate={{ y: -350, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 2.5, ease: "easeOut" }} className="absolute bottom-10 text-4xl">{r.emoji}</motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {panel === "bud" && <LiveBudPanel key="bud" onClose={() => setPanel(null)} />}
        {panel === "chat" && <LiveChatPanel key="chat" onClose={() => setPanel(null)} />}
        {panel === "participants" && <LiveParticipantList key="ppl" onClose={() => setPanel(null)} />}
        {panel === "poll" && <LivePoll key="poll" poll={MOCK_POLL} onClose={() => setPanel(null)} />}
        {panel === "quiz" && <LiveQuiz key="quiz" quiz={MOCK_QUIZ} onClose={() => setPanel(null)} />}
        {panel === "breakout" && <BreakoutRooms key="br" onClose={() => setPanel(null)} />}
      </AnimatePresence>

      <LiveControlBar
        micOn={micOn} cameraOn={cameraOn} handRaised={handRaised} view={view} activePanel={panel}
        onToggleMic={() => setMicOn(!micOn)}
        onToggleCamera={() => setCameraOn(!cameraOn)}
        onScreenShare={() => { setScreenSharing(!screenSharing); setWhiteboard(false); }}
        onWhiteboard={() => { setWhiteboard(!whiteboard); setScreenSharing(false); }}
        onRaiseHand={() => setHandRaised(!handRaised)}
        onReaction={sendReaction}
        onTogglePanel={(p) => setPanel(panel === p ? null : p)}
        onToggleView={() => setView(view === "speaker" ? "gallery" : "speaker")}
        onLeave={() => navigate("/live")}
      />
    </div>
  );
}