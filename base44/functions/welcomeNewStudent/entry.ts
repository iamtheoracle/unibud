import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification } from "../../shared/notifications.ts";
import { generateCandidates, ensureUnique } from "../../shared/usernameUtils.ts";

/**
 * welcomeNewStudent — triggered when a new student registers.
 *  1. Auto-generates a unique username for the new user
 *  2. Sends a welcome notification
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const studentId = body.student_id || body.entity_id;
    const fullName = body.full_name || body.name || "there";
    const email = body.email || "";

    // ── Auto-generate username ──
    let assignedUsername: string | null = null;
    try {
      // Fetch the user record to check if username already exists
      const userRecord = studentId
        ? await base44.asServiceRole.entities.User.get(studentId)
        : null;

      if (userRecord && !userRecord.username) {
        const candidates = generateCandidates(fullName, email);
        if (candidates.length > 0) {
          // Check which are taken
          const existing = await base44.asServiceRole.entities.User.filter({
            username: { $in: candidates },
          });
          const takenUsernames = (existing || []).map((u: any) => u.username);
          const available = candidates.find((c) => !takenUsernames.includes(c));

          assignedUsername = available
            ? available
            : ensureUnique(candidates[0], takenUsernames);

          await base44.asServiceRole.entities.User.update(studentId, {
            username: assignedUsername,
          });
        }
      } else if (userRecord && userRecord.username) {
        assignedUsername = userRecord.username;
      }
    } catch (e) {
      // Username generation is best-effort — don't fail the welcome
      console.error("Username generation failed:", e.message);
    }

    // ── Send welcome notification ──
    const firstName = fullName.split(" ")[0];
    const notif = buildNotification({
      title: `Welcome to UNIBUD, ${firstName}!`,
      message: assignedUsername
        ? `You're all set, @${assignedUsername}. Your campus is now in your pocket — tap to explore.`
        : "Your campus is now in your pocket. Tap to set your academic goals and meet Bud.",
      type: "system",
      icon: "Sparkles",
      link: "/home",
    });
    await base44.asServiceRole.entities.Notification.create(notif).catch(() => {});

    return Response.json({
      status: "success",
      student_id: studentId,
      welcomed: true,
      username: assignedUsername,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});