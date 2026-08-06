import { useState, useEffect } from "react";

const TOAST_LIMIT = 4;
const DEFAULT_DURATION = 3500; // 2–4s spec range
const EXIT_DELAY = 380;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const timers = new Map();

function clearTimer(id) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
}

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.toast].slice(-TOAST_LIMIT) };
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      timers.set(
        toastId,
        setTimeout(() => dispatch({ type: actionTypes.REMOVE_TOAST, toastId }), EXIT_DELAY)
      );
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
      };
    }
    case actionTypes.REMOVE_TOAST:
      clearTimer(action.toastId);
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
    default:
      return state;
  }
};

const listeners = [];
let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

function toast({ duration = DEFAULT_DURATION, ...props }) {
  const id = genId();
  const ms = Math.min(4000, Math.max(2000, Number(duration) || DEFAULT_DURATION));
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
  timers.set(id, setTimeout(dismiss, ms));
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: { ...props, id, open: true, duration: ms, onOpenChange: (open) => { if (!open) dismiss(); } },
  });
  return { id, dismiss };
}

function useToast() {
  const [state, setState] = useState(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };