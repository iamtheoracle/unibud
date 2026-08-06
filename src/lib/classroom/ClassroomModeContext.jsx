import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * ClassroomModeContext — when a class with strict exam mode or Bud disabled
 * is active for the current user, Bud (and AI assistance) are suppressed
 * globally so students cannot lean on the companion during exams/classes.
 */
const ClassroomModeContext = createContext(null);

export function ClassroomModeProvider({ children }) {
  const [mode, setMode] = useState({ active: false, classId: null, strictExam: false, budDisabled: false, aiDisabled: false });

  const enter = useCallback((m) => {
    setMode({
      active: true,
      classId: m.classId || null,
      strictExam: !!m.strictExam,
      budDisabled: !m.budEnabled,
      aiDisabled: !m.aiEnabled,
    });
  }, []);

  const exit = useCallback(() => {
    setMode({ active: false, classId: null, strictExam: false, budDisabled: false, aiDisabled: false });
  }, []);

  const suppressBud = mode.active && (mode.strictExam || mode.budDisabled);

  return (
    <ClassroomModeContext.Provider value={{ mode, enter, exit, suppressBud }}>
      {children}
    </ClassroomModeContext.Provider>
  );
}

export const useClassroomMode = () => useContext(ClassroomModeContext);

/**
 * ClassroomBudGate — renders children only when Bud is allowed in the active
 * classroom context. Used to hide the Bud orb and companion during exams.
 */
export function ClassroomBudGate({ children }) {
  const ctx = useContext(ClassroomModeContext);
  if (ctx?.suppressBud) return null;
  return children;
}