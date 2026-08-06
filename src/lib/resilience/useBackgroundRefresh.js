import { useEffect, useRef } from "react";

/**
 * useBackgroundRefresh — periodically refetches a query / calls a
 * callback on an interval. Pauses when the tab is hidden to save
 * battery and bandwidth, resumes on visibility change.
 *
 * @param {Function} refetch - async refetch function
 * @param {number} intervalMs - refresh interval (default 60s)
 */
export function useBackgroundRefresh(refetch, intervalMs = 60000) {
  const fnRef = useRef(refetch);
  fnRef.current = refetch;

  useEffect(() => {
    let timer = null;

    const start = () => {
      stop();
      timer = setInterval(() => {
        if (document.visibilityState === "visible") {
          fnRef.current?.().catch(() => {});
        }
      }, intervalMs);
    };

    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fnRef.current?.().catch(() => {});
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
}