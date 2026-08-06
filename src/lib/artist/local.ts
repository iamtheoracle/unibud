/**
 * Artist Service — Local Implementation
 *
 * Used in development and test environments. Returns placeholder asset stubs.
 * No actual image generation takes place.
 *
 * Replace with LiveArtistService in production.
 */

import type {
  ArtistService,
  ArtistCreateRequest,
  ArtistDiagramRequest,
  ArtistAsset,
} from "./interface";

export class LocalArtistService implements ArtistService {
  async create(request: ArtistCreateRequest): Promise<ArtistAsset> {
    return this._stub(request.subject, `artist:create:${request.type}`);
  }

  async diagram(request: ArtistDiagramRequest): Promise<ArtistAsset> {
    return this._stub(request.content, `artist:diagram:${request.type}`);
  }

  private _stub(subject: string, requestId: string): ArtistAsset {
    return {
      url: "",
      format: "svg",
      width: 800,
      height: 600,
      altText: `Visual: ${subject}`,
      generatedAt: new Date().toISOString(),
      requestId,
    };
  }
}
