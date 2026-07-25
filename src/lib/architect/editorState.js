import { useState, useEffect, useCallback } from "react";

/** Generic undo/redo history wrapper for any editor state shape. */
export function useHistory(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);

  const set = useCallback((updater, commit = true) => {
    setPresent((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (commit && next !== prev) { setPast((p) => [...p, prev]); setFuture([]); }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => { if (!p.length) return p; const prev = p[p.length - 1]; setFuture((f) => [present, ...f]); setPresent(prev); return p.slice(0, -1); });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((f) => { if (!f.length) return f; const next = f[0]; setPast((p) => [...p, present]); setPresent(next); return f.slice(1); });
  }, [present]);

  const reset = useCallback((v) => { setPast([]); setFuture([]); setPresent(v); }, []);

  return { state: present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0, reset };
}

/** Editor lifecycle: history + debounced autosave + publish + keyboard shortcuts (⌘Z/⌘⇧Z/⌘S/⌘P). */
export function useEditor(record, { onSave, onPublish, defaultConfig }) {
  const { state, set, undo, redo, canUndo, canRedo, reset } = useHistory(record?.config || defaultConfig);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const saveNow = useCallback(async () => {
    if (!record) return;
    setSaving(true);
    try { await onSave(record.id, state); setLastSaved(new Date()); } finally { setSaving(false); }
  }, [record, state, onSave]);

  // debounced autosave on state change
  useEffect(() => {
    if (!record) return;
    const id = setTimeout(() => { saveNow(); }, 900);
    return () => clearTimeout(id);
  }, [state]); // eslint-disable-line

  // re-sync when switching records
  useEffect(() => { reset(record?.config || defaultConfig); }, [record?.id]); // eslint-disable-line

  const publishNow = useCallback(async () => { if (!record) return; await saveNow(); onPublish(record.id); }, [record, saveNow, onPublish]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (k === "y") { e.preventDefault(); redo(); }
      else if (k === "s") { e.preventDefault(); saveNow(); }
      else if (k === "p") { e.preventDefault(); publishNow(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, saveNow, publishNow]);

  return { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow };
}