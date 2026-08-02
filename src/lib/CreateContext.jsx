import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CreateSheet from "@/components/create/CreateSheet";
import MediaDiscussionComposer from "@/components/create/MediaDiscussionComposer";

const CreateContext = createContext(null);

export function useCreate() {
  return useContext(CreateContext);
}

/**
 * CreateProvider — the Universal Create System.
 * Exposes `openCreate()` globally so any component can trigger
 * the creation hub. Manages the CreateSheet and the smart
 * MediaDiscussionComposer as globally-rendered overlays.
 */
export function CreateProvider({ children }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mediaComposer, setMediaComposer] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const openCreate = useCallback(() => setSheetOpen(true), []);
  const closeCreate = useCallback(() => setSheetOpen(false), []);

  const openMediaDiscussion = useCallback((mediaType) => {
    setSheetOpen(false);
    setMediaComposer({ mediaType });
  }, []);

  const closeMediaDiscussion = useCallback(() => setMediaComposer(null), []);

  return (
    <CreateContext.Provider value={{ openCreate, closeCreate }}>
      {children}
      <CreateSheet
        open={sheetOpen}
        onClose={closeCreate}
        onMediaDiscussion={openMediaDiscussion}
      />
      {mediaComposer && (
        <MediaDiscussionComposer
          mediaType={mediaComposer.mediaType}
          user={user}
          onClose={closeMediaDiscussion}
        />
      )}
    </CreateContext.Provider>
  );
}