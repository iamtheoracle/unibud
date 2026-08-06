import { base44 } from "@/api/base44Client";

/**
 * Knowledge Engine — the single source of truth for UNIBUD user content.
 * Aggregates personal files (StudentDocument), smart notes (Note),
 * the shared library (LibraryResource) and collections (Collection) into
 * one unified, searchable, AI-indexed knowledge surface.
 *
 * Spark powers extraction & semantic search via InvokeLLM.
 */

export const KIND_LABELS = {
  file: "File",
  note: "Note",
  library: "Library",
  collection: "Collection",
};

export const SOURCE_LABELS = {
  academics: "Academics",
  connect: "Connect",
  marketplace: "Marketplace",
  wallet: "Wallet",
  news: "News",
  knowledge: "Knowledge",
  other: "Other",
};

export const FILE_CATEGORY_ICONS = {
  pdf: "FileText",
  word: "FileType",
  powerpoint: "Presentation",
  excel: "Sheet",
  images: "Image",
  voice_notes: "Mic",
  audio: "Mic",
  video: "Video",
  text: "FileText",
  scanned_notes: "ScanLine",
  other: "File",
};

/** Load every knowledge source the current user can see. */
export async function aggregateAll() {
  const [files, notes, library, collections] = await Promise.all([
    base44.entities.StudentDocument.list("-updated_date", 200),
    base44.entities.Note.list("-updated_date", 200),
    base44.entities.LibraryResource.list("-updated_date", 200),
    base44.entities.Collection.list("-updated_date", 100),
  ]);
  return { files, notes, library, collections };
}

/** Normalize any source record into a unified knowledge item. */
export function normalizeItem(raw, kind) {
  if (!raw) return null;
  const base = {
    id: raw.id,
    kind,
    title: raw.title || "Untitled",
    created_date: raw.created_date,
    updated_date: raw.updated_date,
    raw,
  };
  if (kind === "file") {
    return {
      ...base,
      subtitle: raw.original_filename || raw.category,
      type: raw.category,
      tags: raw.suggested_tags || [],
      source: raw.source_module || "knowledge",
      file_url: raw.file_url,
      thumbnail: raw.thumbnail_url,
      summary: raw.summary,
      concepts: raw.key_concepts || [],
      bookmarked: !!raw.is_bookmarked,
      ai_indexed: !!raw.ai_indexed,
    };
  }
  if (kind === "note") {
    return {
      ...base,
      subtitle: raw.course_code || raw.note_type,
      type: raw.note_type,
      tags: raw.tags || [],
      source: raw.source_module || "academics",
      file_url: raw.file_url,
      thumbnail: raw.thumbnail_url,
      summary: raw.summary,
      concepts: raw.key_concepts || [],
      bookmarked: !!raw.is_bookmarked,
      ai_indexed: !!raw.ai_indexed,
    };
  }
  if (kind === "library") {
    return {
      ...base,
      subtitle: raw.author || raw.subject,
      type: raw.type,
      tags: raw.tags || [],
      source: "academics",
      file_url: raw.file_url,
      thumbnail: raw.cover_url,
      summary: raw.description,
      concepts: [],
      bookmarked: !!raw.is_bookmarked,
      ai_indexed: true,
    };
  }
  if (kind === "collection") {
    return {
      ...base,
      subtitle: `${(raw.resource_ids || []).length} items`,
      type: raw.type,
      tags: [],
      source: "knowledge",
      count: (raw.resource_ids || []).length,
    };
  }
  return base;
}

/** Flatten all sources into one searchable index. */
export function buildUnifiedIndex({ files, notes, library, collections }) {
  const items = [];
  (files || []).forEach((f) => items.push(normalizeItem(f, "file")));
  (notes || []).forEach((n) => items.push(normalizeItem(n, "note")));
  (library || []).forEach((l) => items.push(normalizeItem(l, "library")));
  (collections || []).forEach((c) => items.push(normalizeItem(c, "collection")));
  return items;
}

/** Local filter — fast, always available offline. */
export function localSearch(items, { query = "", kind = "all", source = "all", tag = null, bookmarksOnly = false } = {}) {
  const q = query.trim().toLowerCase();
  return items.filter((it) => {
    if (kind !== "all" && it.kind !== kind) return false;
    if (source !== "all" && it.source !== source) return false;
    if (tag && !(it.tags || []).includes(tag)) return false;
    if (bookmarksOnly && !it.bookmarked) return false;
    if (!q) return true;
    const hay = [it.title, it.subtitle, it.summary, (it.tags || []).join(" "), (it.concepts || []).join(" ")]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}

/** All unique tags across the index, with counts. */
export function allTags(items) {
  const map = new Map();
  items.forEach((it) => (it.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
  return [...map.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

/**
 * Spark semantic search — sends the user's natural-language query plus the
 * item titles/summaries to InvokeLLM and returns a ranked list of ids.
 */
export async function smartSearch(items, query) {
  if (!query.trim() || items.length === 0) return items.map((i) => i.id);
  const catalog = items.map((it) => ({
    id: it.id,
    title: it.title,
    subtitle: it.subtitle,
    summary: it.summary || "",
    tags: (it.tags || []).join(", "),
    kind: it.kind,
  }));
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark, UNIBUD's knowledge engine. Given a user's natural-language query and a catalog of their saved knowledge items, ` +
      `rank the items by semantic relevance to the query. Return ONLY a JSON object { "ranked_ids": [ids in best-first order], "matched_concepts": [up to 5 concepts the query relates to] }.\n\n` +
      `Query: "${query}"\n\nCatalog:\n${JSON.stringify(catalog.slice(0, 120))}`,
    response_json_schema: {
      type: "object",
      properties: {
        ranked_ids: { type: "array", items: { type: "string" } },
        matched_concepts: { type: "array", items: { type: "string" } },
      },
    },
  });
  const ranked = res?.ranked_ids || [];
  const rankedSet = new Set(ranked);
  const ordered = ranked.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  ordered.push(...items.filter((i) => !rankedSet.has(i.id)));
  return ordered;
}

/**
 * Spark AI Knowledge Extraction — reads a file (or text) and returns a
 * structured knowledge payload: summary, key concepts, suggested tags,
 * document type and related topics. Persists back onto the entity.
 */
export async function extractFromFile(file_url, title) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. Analyze this document ("${title}") and extract structured knowledge. ` +
      `Return JSON: { summary (2-4 sentences), key_concepts (up to 8), suggested_tags (up to 6, lowercase), ` +
      `document_type (one of: pdf, word, powerpoint, excel, images, text, audio, video, other), ` +
      `related_topics (up to 5) }.`,
    file_urls: [file_url],
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        key_concepts: { type: "array", items: { type: "string" } },
        suggested_tags: { type: "array", items: { type: "string" } },
        document_type: { type: "string" },
        related_topics: { type: "array", items: { type: "string" } },
      },
    },
  });
  return res;
}

export async function extractFromText(title, content) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. Summarize this note ("${title}") and extract knowledge.\n\nContent:\n${(content || "").slice(0, 8000)}\n\n` +
      `Return JSON: { summary (2-3 sentences), key_concepts (up to 6), suggested_tags (up to 5, lowercase), related_topics (up to 4) }.`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        key_concepts: { type: "array", items: { type: "string" } },
        suggested_tags: { type: "array", items: { type: "string" } },
        related_topics: { type: "array", items: { type: "string" } },
      },
    },
  });
  return res;
}

/** Persist extraction results back onto the source entity. */
export async function persistExtraction(item, extraction) {
  const payload = {
    summary: extraction.summary,
    key_concepts: extraction.key_concepts || [],
    ai_indexed: true,
    indexed_at: new Date().toISOString(),
  };
  if (item.kind === "file") {
    payload.suggested_tags = extraction.suggested_tags || [];
    await base44.entities.StudentDocument.update(item.id, payload);
  } else if (item.kind === "note") {
    payload.tags = [...new Set([...(item.tags || []), ...(extraction.suggested_tags || [])])];
    await base44.entities.Note.update(item.id, payload);
  }
  return payload;
}

/** Collections — reuse the Collection entity as smart folders. */
export async function createCollection(name, description = "", color = "#2563EB", icon = "Folder") {
  return base44.entities.Collection.create({ name, description, type: "personal", color, icon, resource_ids: [] });
}

export async function addToCollection(collectionId, resourceId) {
  const c = await base44.entities.Collection.get(collectionId);
  const ids = new Set([...(c.resource_ids || []), resourceId]);
  await base44.entities.Collection.update(collectionId, { resource_ids: [...ids] });
  return [...ids];
}

export async function uploadAndCreateDocument(file, sourceModule = "knowledge") {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  const doc = await base44.entities.StudentDocument.create({
    title: file.name.replace(/\.[^.]+$/, ""),
    category: detectCategory(file),
    file_url,
    original_filename: file.name,
    file_type: file.type,
    file_size: file.size,
    content_type: file.type,
    source_module: sourceModule,
  });
  return doc;
}

export function detectCategory(file) {
  const t = (file.type || "").toLowerCase();
  const n = (file.name || "").toLowerCase();
  if (t.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  if (t.includes("word") || n.endsWith(".docx") || n.endsWith(".doc")) return "word";
  if (t.includes("presentation") || n.endsWith(".pptx") || n.endsWith(".ppt")) return "powerpoint";
  if (t.includes("sheet") || n.endsWith(".xlsx") || n.endsWith(".xls")) return "excel";
  if (t.startsWith("image/")) return "images";
  if (t.startsWith("audio/")) return "audio";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("text/")) return "text";
  return "other";
}