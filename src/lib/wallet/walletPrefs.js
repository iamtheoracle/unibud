import { useState, useEffect, useCallback } from "react";

const BOARD_KEY = "wallet.board";
const DEFAULT_BOARD = {
  order: ["balance", "quickActions", "upcoming", "insights", "recent"],
  hidden: [],
  pinned: ["balance", "quickActions"],
};

/** Board customization — pin / hide / reorder dashboard modules. Persisted. */
export function useWalletBoard() {
  const [board, setBoard] = useState(DEFAULT_BOARD);
  useEffect(() => {
    try { const s = localStorage.getItem(BOARD_KEY); if (s) setBoard(JSON.parse(s)); } catch {}
  }, []);
  const save = useCallback((b) => {
    setBoard(b);
    try { localStorage.setItem(BOARD_KEY, JSON.stringify(b)); } catch {}
  }, []);
  const toggleHidden = (k) =>
    save({ ...board, hidden: board.hidden.includes(k) ? board.hidden.filter((x) => x !== k) : [...board.hidden, k] });
  const togglePin = (k) =>
    save({ ...board, pinned: board.pinned.includes(k) ? board.pinned.filter((x) => x !== k) : [...board.pinned, k] });
  const move = (k, dir) => {
    const i = board.order.indexOf(k);
    const j = i + dir;
    if (j < 0 || j >= board.order.length) return;
    const ord = [...board.order];
    [ord[i], ord[j]] = [ord[j], ord[i]];
    save({ ...board, order: ord });
  };
  const visible = board.order.filter((k) => !board.hidden.includes(k));
  return { board, visible, toggleHidden, togglePin, move };
}

/** Spark adaptive priority — surfaces what matters most today, keeps structure stable. */
export function adaptivePriority(ctx) {
  if (ctx?.tuitionDue) return { order: ["upcoming", "savings", "insights", "budget", "recent"], highlight: "Tuition due soon — payment prioritised" };
  if (ctx?.loanDue) return { order: ["insights", "upcoming", "savings", "budget", "recent"], highlight: "Loan repayment due — progress shown first" };
  if (ctx?.scholarshipReceived) return { order: ["savings", "insights", "upcoming", "budget", "recent"], highlight: "Scholarship received — balance highlighted" };
  if (ctx?.frequentTransfer) return { order: ["recent", "upcoming", "savings", "insights", "budget"], highlight: "You transfer often — Transfer stays within reach" };
  if (ctx?.savingsActive) return { order: ["savings", "insights", "upcoming", "budget", "recent"], highlight: "Savings goals active — progress shown first" };
  return { order: ["upcoming", "savings", "insights", "budget", "recent"], highlight: null };
}