import { useState, useEffect, useMemo } from "react";

/**
 * useConnectedContext — reads the student's connected account state and derives
 * interest signals for the Connected Context Engine.
 *
 * Connected accounts are stored in localStorage by ConnectedAccounts.jsx under
 * the key "unibud_social_connections". This hook listens for changes so any
 * connect/disconnect action is immediately reflected in recommendation logic.
 *
 * Returns derived interest tags, platform availability flags, and the raw
 * connection map — all private to the student.
 */
const KEY = "unibud_social_connections";

export function useConnectedContext() {
  const [connections, setConnections] = useState({});

  useEffect(() => {
    const read = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
        setConnections(stored.connections || stored);
      } catch {
        setConnections({});
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("unibud-connections-changed", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("unibud-connections-changed", read);
    };
  }, []);

  const connectedPlatforms = useMemo(
    () => Object.entries(connections).filter(([, v]) => v).map(([k]) => k),
    [connections]
  );

  // Derive interest signals from connected platforms
  const interests = useMemo(() => {
    const tags = new Set();
    if (connections.spotify || connections.apple_music || connections.audiomack || connections.boomplay || connections.youtube_music) tags.add("music");
    if (connections.youtube) tags.add("video");
    if (connections.instagram || connections.tiktok || connections.x || connections.threads) tags.add("social");
    if (connections.google_calendar) tags.add("calendar");
    if (connections.google_drive || connections.one_drive || connections.dropbox) tags.add("storage");
    if (connections.discord || connections.whatsapp || connections.telegram) tags.add("communication");
    return Array.from(tags);
  }, [connections]);

  // Map interests to community categories for the Context Engine
  const recommendedCommunityCategories = useMemo(() => {
    const cats = new Set();
    if (interests.includes("music")) { cats.add("music"); cats.add("cultural"); }
    if (interests.includes("video")) { cats.add("art"); }
    if (interests.includes("social")) { cats.add("journalism"); cats.add("drama"); }
    if (interests.includes("storage")) { cats.add("research"); cats.add("science"); }
    return Array.from(cats);
  }, [interests]);

  const hasAnyConnection = connectedPlatforms.length > 0;

  return {
    connections,
    connectedPlatforms,
    interests,
    recommendedCommunityCategories,
    hasAnyConnection,
    hasMusic: !!(connections.spotify || connections.apple_music || connections.audiomack || connections.boomplay || connections.youtube_music),
    hasVideo: !!connections.youtube,
    hasCalendar: !!connections.google_calendar,
    hasStorage: !!(connections.google_drive || connections.one_drive || connections.dropbox),
    hasSocial: !!(connections.instagram || connections.tiktok || connections.x || connections.threads || connections.facebook || connections.reddit || connections.linkedin),
    hasCommunication: !!(connections.discord || connections.whatsapp || connections.telegram),
  };
}