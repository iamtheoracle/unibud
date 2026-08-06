# The Artist — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Internal
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `artist` |
| Name | The Artist |
| Layer | Intelligence Layer (Internal) |
| Status | Active |

---

## Purpose

The visual and creative intelligence of the platform.

---

## Mission

Create diagrams, illustrations, animations, visual explanations, educational graphics, creator assets, brand assets, and UI assets — supporting Bud and platform products without ever teaching directly.

---

## Vision

Every complex idea on UNIBUD has a beautiful visual explanation. Every creator has the tools to produce professional-quality assets.

---

## Primary Responsibility

Visual creation for education, communication, and platform products.

---

## Responsibilities

1. Generate diagrams and flowcharts for complex topics
2. Create illustrations for educational content
3. Produce animations and motion graphics
4. Generate visual explanations of academic concepts
5. Create educational graphics for Library and Creator Studio
6. Produce creator assets (thumbnails, banners, overlays)
7. Generate brand assets for communities and organisations
8. Create UI assets for platform products
9. **Never** teach or explain concepts directly

---

## Goals

- Make complex concepts visually understandable
- Support content creators with high-quality AI-generated assets
- Maintain brand consistency across platform visuals
- Enable visual communication between students

---

## Creation Types

| Type | Description |
|---|---|
| `diagram` | Flowcharts, sequence diagrams, mind maps |
| `illustration` | Custom artwork for educational content |
| `animation` | Motion graphics and animated explanations |
| `visual_explanation` | Step-by-step visual walkthroughs |
| `educational_graphic` | Infographics and study aids |
| `creator_asset` | Thumbnails, banners, and overlays |
| `brand_asset` | Community and organisation branding |
| `ui_asset` | Icons, illustrations for platform screens |

---

## Inputs

| Input | Description |
|---|---|
| Visual creation request from Bud or Spark | Type, subject, style, format |
| Creator brief from Creator Studio | Custom creation specs |
| Brand guidelines | Community or organisation brand rules |
| Academic concept from Library or Spark | Subject matter for educational visuals |

---

## Outputs

| Output | Description |
|---|---|
| Generated image | PNG, SVG, or WebP |
| Generated animation | GIF, WebM, or Lottie |
| Generated diagram | Mermaid, SVG |
| Asset metadata | Dimensions, format, alt text |

---

## Workflow

```
1. Receive creation request via `artist:create` event
             ↓
2. Parse request type and style requirements
             ↓
3. Select appropriate generation strategy
             ↓
4. Generate asset
             ↓
5. Return asset via `artist:asset` event with metadata
```

---

## Dependencies

None. The Artist generates assets independently.

---

## Consumers

| Intelligence / Product | Reason |
|---|---|
| Bud | Requests visuals to accompany explanations |
| Spark | Requests visuals as part of assembled responses |
| Creator Studio | Requests creator and brand assets |
| Library | Requests educational graphics |

---

## Events

| Event | Direction | Description |
|---|---|---|
| `artist:create` | Subscribes | Receives a visual creation request |
| `artist:asset` | Publishes | Returns created asset to requester |

---

## API Contracts

### `create(request)`

```typescript
create(request: ArtistCreateRequest): Promise<ArtistAsset>

interface ArtistCreateRequest {
  type: ArtistCreationType;
  subject: string;
  style?: string;
  dimensions?: { width: number; height: number };
  format?: "png" | "svg" | "webp" | "gif";
  context?: string;
}
```

### `diagram(spec)`

```typescript
diagram(request: ArtistDiagramRequest): Promise<ArtistAsset>

interface ArtistDiagramRequest {
  type: DiagramType;
  content: string;  // Mermaid syntax or plain-English description
  style?: DiagramStyle;
}
```

---

## Data Contracts

### `ArtistAsset`
```typescript
{
  url: string;
  format: string;
  width: number;
  height: number;
  altText: string;      // Always present for accessibility
  generatedAt: string;
  requestId: string;
}
```

---

## Failure Behaviour

If image generation is unavailable, return a structured diagram as SVG fallback. If all generation methods fail, return an error with a descriptive message.

## Fallback Strategy

For diagrams, fall back to Mermaid text rendering in the UI. For illustrations, return a contextual placeholder with alt text. Never block Bud's response waiting for an asset — deliver the asset asynchronously.

---

## Permissions

- `invoke:image_generation`
- `invoke:diagram_renderer`
- `read:brand_guidelines`
- `write:media_store`

---

## Restrictions

- Must **never** communicate directly with students
- Must **never** teach or explain concepts in text
- Must not generate content that violates platform content policy
- Must not reproduce copyrighted characters or logos without authorisation
- Must **always** include accessibility alt text with generated assets

---

## Metrics

| Metric | Description |
|---|---|
| `asset_generation_latency_p50` | Median asset generation time |
| `asset_generation_latency_p95` | 95th percentile generation time |
| `generation_success_rate` | % of requests that produced a valid asset |
| `creator_asset_usage_rate` | % of creator assets used in published content |
| `educational_graphic_request_rate` | Educational graphic requests per day |
| `fallback_invocation_rate` | % of requests that required fallback |

---

## Future Expansion

- Video generation for educational summaries
- Personalised infographic generation
- Interactive diagram editor
- Brand kit management per community
- AR/VR asset generation
