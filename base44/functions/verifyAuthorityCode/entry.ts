import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyAuthorityCode, logExecutiveAction } from "../../shared/authorityVerification.ts";

/**
 * verifyAuthorityCode — Oracle Executive Authority verification endpoint.
 *
 * Accepts an authority code from an authenticated admin, verifies it against
 * their assigned role, creates an audit record, and returns a verification
 * token (never the code itself). The code is immediately consumed and cannot
 * be reused within the replay window.
 *
 * SECURITY: The raw authority code is NEVER stored, logged, or returned.
 * Only a non-reversible hash is persisted for deduplication.
 *
 * POST { code: string, scope?: string }
 * → { status, verificationId, authorityCode, verifiedAt }
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden — admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { code, scope } = body;

    if (!code || typeof code !== "string") {
      return Response.json({ error: "Authority code required" }, { status: 400 });
    }

    const result = await verifyAuthorityCode(base44, user, code, scope);

    if (result.status === "verified") {
      // Return only safe fields — NEVER the raw code.
      return Response.json({
        status: "verified",
        verificationId: result.codeHash,
        authorityCode: result.authorityCode,
        verifiedAt: result.verifiedAt,
        message: "Executive authority verified. Oracle is now in Executive Mode.",
      });
    }

    // Log failed verification attempt (without the code).
    await base44.asServiceRole.entities.AuditLog.create({
      action: "authority_code_failed",
      actor_name: user.full_name || user.email,
      actor_id: user.id,
      actor_role: user.role,
      target_type: "authority",
      target_name: "verification_failed",
      details: `Status: ${result.status}. Reason: ${result.reason}`,
      severity: "warning",
    }).catch(() => {});

    return Response.json({
      status: result.status,
      message: result.reason || "Verification failed",
    }, { status: 403 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}