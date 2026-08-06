import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { logAuditEvent } from "../../shared/auditLogger.ts";

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

    // ── Audit logging for significant changes ──
    const actorName = user.full_name || user.preferred_name || user.email || 'Unknown';
    const actorRole = user.role || 'student';

    // Username change — security event
    if (username !== undefined && user.username !== updates.username) {
      await logAuditEvent(base44, {
        action: 'username_changed',
        actor_id: user.id,
        actor_name: actorName,
        actor_role: actorRole,
        target_type: 'user',
        target_user_id: user.id,
        details: `Username changed from @${user.username || '(none)'} to @${updates.username}`,
        previous_value: user.username || null,
        new_value: updates.username,
        severity: 'warning',
        category: 'security',
      });
    }

    // University change — major event
    if (university !== undefined && user.university !== updates.university) {
      await logAuditEvent(base44, {
        action: 'university_changed',
        actor_id: user.id,
        actor_name: actorName,
        actor_role: actorRole,
        target_type: 'user',
        target_user_id: user.id,
        details: `University changed from "${user.university || '(none)'}" to "${updates.university}"`,
        previous_value: user.university || null,
        new_value: updates.university,
        severity: 'warning',
        category: 'account',
      });
    }

    // Matriculation number change — verification event
    if (matriculation_number !== undefined && user.matriculation_number !== updates.matriculation_number) {
      await logAuditEvent(base44, {
        action: 'matriculation_updated',
        actor_id: user.id,
        actor_name: actorName,
        actor_role: actorRole,
        target_type: 'user',
        target_user_id: user.id,
        details: 'Matriculation number updated',
        previous_value: user.matriculation_number || null,
        new_value: updates.matriculation_number,
        severity: 'info',
        category: 'academic',
      });
    }

    // General profile update (catches bio, avatar, phone, preferred_name, faculty, department, level)
    const otherFields = ['preferred_name', 'bio', 'avatar_url', 'phone', 'faculty', 'department', 'level'];
    const hasOtherChanges = otherFields.some((f) => updates[f] !== undefined && updates[f] !== user[f]);
    if (hasOtherChanges) {
      const changedFields = otherFields.filter((f) => updates[f] !== undefined && updates[f] !== user[f]);
      await logAuditEvent(base44, {
        action: 'profile_updated',
        actor_id: user.id,
        actor_name: actorName,
        actor_role: actorRole,
        target_type: 'user',
        target_user_id: user.id,
        details: `Profile fields updated: ${changedFields.join(', ')}`,
        meta: { fields: changedFields },
        severity: 'info',
        category: 'account',
      });
    }

    const fresh = await base44.auth.me();
    return Response.json({ ok: true, user: fresh });
  } catch (error) {
    return Response.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
});