/**
 * Artist Service — Interface
 *
 * The Artist owns: visual creation — diagrams, illustrations, animations,
 * visual explanations, educational graphics, creator assets, brand assets,
 * and UI assets.
 *
 * The Artist NEVER teaches or communicates directly with students.
 * The Artist supports Bud and platform products only.
 *
 * See src/lib/intelligence/registry.ts for the full Artist definition.
 */

export type ArtistCreationType =
  | "diagram"
  | "illustration"
  | "animation"
  | "visual_explanation"
  | "educational_graphic"
  | "creator_asset"
  | "brand_asset"
  | "ui_asset";

export type DiagramType =
  | "flowchart"
  | "sequence"
  | "mindmap"
  | "class"
  | "er"
  | "gantt"
  | "pie"
  | "custom";

export type DiagramStyle = "default" | "minimal" | "colorful" | "dark";

export type AssetFormat = "png" | "svg" | "webp" | "gif";

export interface ArtistCreateRequest {
  type: ArtistCreationType;
  subject: string;
  style?: string;
  dimensions?: { width: number; height: number };
  format?: AssetFormat;
  /** Additional context for more accurate generation */
  context?: string;
}

export interface ArtistDiagramRequest {
  type: DiagramType;
  /** Mermaid syntax string, or plain-English description for AI-to-diagram */
  content: string;
  style?: DiagramStyle;
}

export interface ArtistAsset {
  url: string;
  format: AssetFormat | string;
  width: number;
  height: number;
  altText: string;
  generatedAt: string;
  requestId: string;
}

/**
 * ArtistService — the contract every Artist implementation must satisfy.
 */
export interface ArtistService {
  /**
   * Main creation endpoint. Accepts a creation request, returns a generated asset.
   * Called by Bud and Spark only.
   */
  create(request: ArtistCreateRequest): Promise<ArtistAsset>;

  /**
   * Generate a diagram from a spec string (Mermaid) or topic description.
   */
  diagram(request: ArtistDiagramRequest): Promise<ArtistAsset>;
}
