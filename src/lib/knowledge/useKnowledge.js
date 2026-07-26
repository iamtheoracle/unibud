import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  aggregateAll, buildUnifiedIndex, localSearch, allTags,
  smartSearch, extractFromFile, extractFromText, persistExtraction,
  uploadAndCreateDocument, createCollection, addToCollection,
} from "./knowledgeEngine";

const KEY = ["knowledge", "unified"];

/** Loads the unified knowledge index and exposes search + AI extraction. */
export function useKnowledge() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: KEY,
    queryFn: aggregateAll,
    staleTime: 30_000,
  });

  const items = useMemo(() => (data ? buildUnifiedIndex(data) : []), [data]);
  const tags = useMemo(() => allTags(items), [items]);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [source, setSource] = useState("all");
  const [activeTag, setActiveTag] = useState(null);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartLoading, setSmartLoading] = useState(false);

  const filtered = useMemo(() => {
    if (smartResults) return smartResults;
    return localSearch(items, { query, kind, source, tag: activeTag, bookmarksOnly });
  }, [smartResults, items, query, kind, source, activeTag, bookmarksOnly]);

  const runSmartSearch = async () => {
    if (!query.trim()) return;
    setSmartLoading(true);
    try {
      const ranked = await smartSearch(items, query);
      setSmartResults(ranked);
    } finally {
      setSmartLoading(false);
    }
  };

  const clearSmart = () => setSmartResults(null);

  const extract = async (item) => {
    const extraction = item.kind === "note"
      ? await extractFromText(item.title, item.raw.content)
      : await extractFromFile(item.file_url, item.title);
    await persistExtraction(item, extraction);
    await qc.invalidateQueries(KEY);
    return extraction;
  };

  const upload = async (file, sourceModule) => {
    const doc = await uploadAndCreateDocument(file, sourceModule);
    await qc.invalidateQueries(KEY);
    return doc;
  };

  const newCollection = async (name, description, color, icon) => {
    const c = await createCollection(name, description, color, icon);
    await qc.invalidateQueries(KEY);
    return c;
  };

  const addBookmark = async (item) => {
    const payload = { is_bookmarked: !item.bookmarked };
    if (item.kind === "file") await import("@/api/base44Client").then((m) => m.base44.entities.StudentDocument.update(item.id, payload));
    else if (item.kind === "note") await import("@/api/base44Client").then((m) => m.base44.entities.Note.update(item.id, payload));
    else if (item.kind === "library") await import("@/api/base44Client").then((m) => m.base44.entities.LibraryResource.update(item.id, payload));
    await qc.invalidateQueries(KEY);
  };

  return {
    items, tags, filtered, isLoading, refetch,
    query, setQuery, kind, setKind, source, setSource,
    activeTag, setActiveTag, bookmarksOnly, setBookmarksOnly,
    smartLoading, runSmartSearch, clearSmart, isSmart: !!smartResults,
    extract, upload, newCollection, addBookmark,
    counts: {
      file: items.filter((i) => i.kind === "file").length,
      note: items.filter((i) => i.kind === "note").length,
      library: items.filter((i) => i.kind === "library").length,
      collection: items.filter((i) => i.kind === "collection").length,
    },
  };
}