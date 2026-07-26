import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * updateProfile — the single, authoritative path for changing a user's
 * identity fields (preferred_name, username, bio, avatar_url, phone).
 *
 *  • Runs as service role so it can enforce username uniqueness across
 *    ALL users and write the update to the real User record.
 *  • Supports `dry_run: true` to validate a username (format + uniqueness)
 *    without persisting — used for live availability checks in the editor.
 *  • Never touches built-in email / full_name (the platform login identifier
 *    and legal name are not changed here).
 */

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { preferred_name, username, bio, avatar_url, phone, matriculation_number, department, faculty, university, level, dry_run } = body || {};

    // Validate username (format + uniqueness) whenever it is supplied.
    if (username !== undefined) {
      const u = String(username).trim().toLowerCase();
      if (!USERNAME_RE.test(u)) {
        return Response.json(
          { ok: false, field: 'username', reason: 'Username must be 3–20 characters: lowercase letters, numbers, or underscores.' },
          { status: 400 }
        );
      }
      const existing = await base44.asServiceRole.entities.User.filter({ username: u });
      if (existing && existing.length && existing.some((x) => x.id !== user.id)) {
        return Response.json(
          { ok: false, field: 'username', reason: 'That username is taken. Try another.' },
          { status: 409 }
        );
      }
    }

    // Dry-run: validation only, no persistence.
    if (dry_run) return Response.json({ ok: true });

    const updates = {};
    if (preferred_name !== undefined) updates.preferred_name = String(preferred_name).trim().slice(0, 60);
    if (username !== undefined) updates.username = String(username).trim().toLowerCase();
    if (bio !== undefined) updates.bio = String(bio).trim().slice(0, 280);
    if (avatar_url !== undefined) updates.avatar_url = avatar_url ? String(avatar_url) : '';
    if (phone !== undefined) updates.phone = phone ? String(phone).trim().slice(0, 20) : '';
    if (matriculation_number !== undefined) updates.matriculation_number = String(matriculation_number).trim();
    if (department !== undefined) updates.department = String(department).trim();
    if (faculty !== undefined) updates.faculty = String(faculty).trim();
    if (university !== undefined) updates.university = String(university).trim();
    if (level !== undefined) updates.level = String(level).trim();

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(user.id, updates);
    const fresh = await base44.auth.me();
    return Response.json({ ok: true, user: fresh });
  } catch (error) {
    return Response.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
});