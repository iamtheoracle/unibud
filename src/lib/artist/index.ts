/**
 * Artist Service — Public SDK
 *
 * The Artist is the visual and creative intelligence of UNIBUD.
 * It creates diagrams, illustrations, animations, visual explanations,
 * educational graphics, creator assets, brand assets, and UI assets.
 *
 * Consumers (Bud, Spark) should import from here:
 *   import { createArtist } from "@/lib/artist";
 *
 * The bus integration wires The Artist to the Intelligence Event Bus so
 * Bud/Spark can dispatch `artist:create` events and receive `artist:asset`
 * responses.
 */

export type {
  ArtistService,
  ArtistCreateRequest,
  ArtistDiagramRequest,
  ArtistAsset,
  ArtistCreationType,
  DiagramType,
  DiagramStyle,
  AssetFormat,
} from "./interface";

import type { ArtistService } from "./interface";
import { LocalArtistService } from "./local";
import { intelligenceBus } from "@/lib/intelligence/bus";
import type { ArtistCreatePayload } from "@/lib/intelligence/bus";

export interface ArtistConfig {
  provider?: ArtistService;
  /** Wire The Artist to the Intelligence Bus. Defaults to true. */
  useBus?: boolean;
}

export interface Artist extends ArtistService {
  dispose(): void;
}

export function createArtist(config: ArtistConfig = {}): Artist {
  const service: ArtistService = config.provider ?? new LocalArtistService();
  const unsubs: Array<() => void> = [];

  if (config.useBus !== false) {
    unsubs.push(
      intelligenceBus.subscribe(
        "artist:create",
        async (payload: ArtistCreatePayload) => {
          const asset = await service.create({
            type: payload.type,
            subject: payload.subject,
            style: payload.style,
            dimensions: payload.dimensions,
            format: payload.format,
            context: payload.context,
          });
          intelligenceBus.publish("artist:asset", {
            requestId: payload.requestId,
            url: asset.url,
            format: asset.format,
            width: asset.width,
            height: asset.height,
            altText: asset.altText,
            generatedAt: asset.generatedAt,
          });
        }
      )
    );
  }

  return {
    create: (req) => service.create(req),
    diagram: (req) => service.diagram(req),
    dispose() {
      for (const unsub of unsubs) unsub();
      unsubs.length = 0;
    },
  };
}
