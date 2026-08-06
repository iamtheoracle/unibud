import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyAuthorityCode, logExecutiveAction } from "../../shared/authorityVerification.ts";

/**
 * logExecutiveAction — records an executive administrative operation.
 *
 * Every privileged action (module toggle, maintenance mode, feature flag,
 * permission change, deployment) must be logged with full accountability:
 * who, what authority, when, what action, target, result, and rollback info.
 *
 * POST {
 *   verificationId: string,   // from verifyAuthorityCode
 *   authorityCode: string,
 *   action: string,           // e.g. "module_disabled"
 *   targetType: string,       // e.g. "module"
 *   targetName: string,       // e.g. "wallet"
 *   result?: string,           // "success" | "failed"
 *   rollback?: string         // rollback instructions
 * }
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { verificationId, authorityCode, action, targetType, targetName, result, rollback } = body;

    if (!verificationId || !action || !targetType) {
      return Response.json({ error: "verificationId, action, and targetType required" }, { status: 400 });
    }

    const verificationRecord = {
      status: "verified",
      codeHash: verificationId,
      authorityCode,
      userId: user.id,
      userName: user.full_name || user.email,
      verifiedAt: new Date().toISOString(),
    };

    await logExecutiveAction(base44, verificationRecord, action, targetType, targetName, result, rollback);

    return Response.json({
      status: "logged",
      message: "Executive action recorded in audit trail.",
      action,
      targetType,
      targetName,
      actor: verificationRecord.userName,
      authorityCode: verificationRecord.authorityCode,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}