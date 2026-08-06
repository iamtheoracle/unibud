import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * useOptimisticUpdate — apply a local change immediately, sync to the
 * server, and offer an undo window before the change is committed.
 *
 * Returns { update, undo, pendingUndo }.
 *  - update({ optimistic, commit, undoMessage, undoMs }) — applies
 *    `optimistic` (local state fn), calls `commit` (server), and shows
 *    an undo toast for `undoMs`. If undone, calls `optimistic`'s inverse.
 */
export function useOptimisticUpdate() {
  const { toast } = useToast();
  const [pendingUndo, setPendingUndo] = useState(null);
  const undoFnRef = useRef(null);

  const update = useCallback(
    async ({ optimistic, commit, undo, undoMessage = "Undo", undoMs = 5000 }) => {
      // 1. Apply optimistic local change
      optimistic?.();

      // 2. Show undo toast
      undoFnRef.current = undo;
      const id = toast({
        title: undoMessage,
        duration: undoMs,
        action: undo
          ? {
              label: "Undo",
              onClick: () => {
                undoFnRef.current?.();
                undoFnRef.current = null;
                setPendingUndo(null);
              },
            }
          : undefined,
      });
      setPendingUndo(id);

      // 3. Commit to server after the undo window closes
      const timer = setTimeout(async () => {
        try {
          await commit?.();
        } catch {
          // If commit fails, try to revert optimistically
          undo?.();
        }
        undoFnRef.current = null;
        setPendingUndo(null);
      }, undoMs);

      return () => clearTimeout(timer);
    },
    [toast]
  );

  return { update, pendingUndo };
}