import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import {
  generateCandidates,
  ensureUnique,
  validateUsername,
  isReserved,
  USERNAME_RE,
} from "../../shared/usernameUtils.ts";

/**
 * usernameService — handles automatic username generation, real-time
 * availability checking, and username suggestions.
 *
 * Actions:
 *  • generate  — auto-generate & assign a unique username for the current user
 *  • check     — real-time availability check (format + uniqueness + reserved)
 *  • suggest   — generate up to N suggestions without assigning
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── generate: auto-assign a unique username ──
    if (action === "generate" || !action) {
      // Skip if user already has a username
      if (user.username) {
        return Response.json({ ok: true, username: user.username, existing: true });
      }

      const fullName = body.full_name || user.full_name || "";
      const email = body.email || user.email || "";
      const candidates = generateCandidates(fullName, email);

      if (candidates.length === 0) {
        return Response.json({ ok: false, reason: "Could not generate a username from your name. Please set one manually." }, { status: 400 });
      }

      // Check which candidates are already taken
      const existing = await base44.asServiceRole.entities.User.filter({
        username: { $in: candidates },
      });

      const takenUsernames = (existing || []).map((u) => u.username);
      const available = candidates.find((c) => !takenUsernames.includes(c));

      let finalUsername: string;
      if (available) {
        finalUsername = available;
      } else {
        // All taken — use the first candidate with a suffix
        finalUsername = ensureUnique(candidates[0], takenUsernames);
      }

      // Assign the username
      await base44.asServiceRole.entities.User.update(user.id, { username: finalUsername });

      return Response.json({ ok: true, username: finalUsername });
    }

    // ── check: real-time availability ──
    if (action === "check") {
      const username = (body.username || "").toLowerCase().trim();

      if (!USERNAME_RE.test(username)) {
        return Response.json({ available: false, reason: "3–20 chars: lowercase letters, numbers, or underscores." });
      }
      if (isReserved(username)) {
        return Response.json({ available: false, reason: "This username is reserved." });
      }

      const existing = await base44.asServiceRole.entities.User.filter({ username });
      const taken = existing && existing.some((u) => u.id !== user.id);

      return Response.json({ available: !taken, reason: taken ? "That username is taken." : null });
    }

    // ── suggest: generate suggestions without assigning ──
    if (action === "suggest") {
      const fullName = body.full_name || user.full_name || "";
      const email = body.email || user.email || "";
      const candidates = generateCandidates(fullName, email);

      // Check availability of each
      const existing = await base44.asServiceRole.entities.User.filter({
        username: { $in: candidates },
      });
      const takenUsernames = (existing || []).map((u) => u.username);

      const suggestions = candidates
        .filter((c) => !takenUsernames.includes(c))
        .slice(0, 5);

      return Response.json({ ok: true, suggestions });
    }

    return Response.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Username service failed" }, { status: 500 });
  }
});