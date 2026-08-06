import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * Oracle Platform Access Code Validator
 *
 * Evaluates a platform access code submitted during sign-in. If valid, elevates
 * the authenticated user's role accordingly. The code is NEVER stored, NEVER
 * returned to the client, and is discarded immediately after evaluation.
 *
 * Platform staff (moderators, operators, admins, super admins) can ONLY join
 * the platform through invitation. Access codes elevate invited users who have
 * already authenticated — they do not bypass authentication.
 *
 * Code 072400 → super_admin (Oracle Command Center)
 */

// Codes live server-side only — never exposed to the frontend, never persisted.
const PLATFORM_ACCESS_CODES = {
  "072400": "super_admin",
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Require authentication — codes elevate existing users, never create sessions.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const accessCode = body?.access_code ? String(body.access_code).trim() : "";

    if (!accessCode) {
      return Response.json({ valid: false });
    }

    const elevatedRole = PLATFORM_ACCESS_CODES[accessCode];

    // Invalid code — return without revealing whether the code exists.
    if (!elevatedRole) {
      return Response.json({ valid: false });
    }

    // Elevate the user's role via service role (User.role is a built-in field
    // that cannot be overridden by the user themselves via updateMe).
    await base44.asServiceRole.entities.User.update(user.id, { role: elevatedRole });

    // Return only the resulting role — the code itself is never echoed back.
    return Response.json({ valid: true, role: elevatedRole });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}