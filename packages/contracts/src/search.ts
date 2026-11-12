import type { ApplicationId, ResourceId } from "./identity.ts";

/**
 * Search intent is classified by trusted server logic. A client-provided
 * destination or intent is only a hint and must never grant access.
 */
export type ConnectSearchCategory =
  | "people"
  | "communities"
  | "creators"
  | "institutions"
  | "opportunities"
  | "services"
  | "food"
  | "events"
  | "trips";

export type SearchIntent =
  | { kind: "academic" }
  | { kind: "general_discovery"; category: ConnectSearchCategory }
  | { kind: "adult_dating" }
  | { kind: "space_scoped"; applicationId: ApplicationId; resourceId?: ResourceId };

export type SearchSpace =
  | "connect"
  | "quad"
  | "bud_board"
  | "square"
  | "soullync"
  | "riff"
  | "wayward"
  | "quarter"
  | "flow";

export type SearchRoute =
  | { kind: "space"; space: "bud_board"; parentSpace: "bud" }
  | { kind: "space"; space: "connect" }
  | { kind: "space"; space: "soullync"; requiresAdultEligibility: true; requiresIndependentConsent: true }
  | {
      kind: "scoped";
      applicationId: ApplicationId;
      resourceId?: ResourceId;
      requiresAdultEligibility?: true;
      requiresIndependentConsent?: true;
    };

/**
 * Routes a server-classified intent to its product space. This is navigation
 * policy only: the destination service must independently enforce session,
 * profile, membership, visibility, block, age, location and resource policy.
 * Quad is intentionally never inferred from generic discovery.
 */
export function routeSearchIntent(intent: SearchIntent): SearchRoute {
  switch (intent.kind) {
    case "academic":
      return { kind: "space", space: "bud_board", parentSpace: "bud" };
    case "general_discovery":
      return { kind: "space", space: "connect" };
    case "adult_dating":
      return {
        kind: "space",
        space: "soullync",
        requiresAdultEligibility: true,
        requiresIndependentConsent: true
      };
    case "space_scoped":
      return {
        kind: "scoped",
        applicationId: intent.applicationId,
        ...(intent.resourceId ? { resourceId: intent.resourceId } : {}),
        ...(intent.applicationId === "soullync"
          ? { requiresAdultEligibility: true as const, requiresIndependentConsent: true as const }
          : {})
      };
  }
}
