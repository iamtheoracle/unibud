import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * smartUserSearch — fuzzy/partial user search across UNIBUD.
 *
 * Searches by username, full_name, and preferred_name with partial matching.
 * Boosts results from the same university, faculty, and department.
 * Returns only public-facing fields — never emails, phones, or matric numbers.
 *
 * Called from the frontend:
 *   base44.functions.invoke('smartUserSearch', { query: 'ade', limit: 10 })
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = (body.query || "").trim().toLowerCase();
    const limit = Math.min(body.limit || 15, 50);
    const viewerUniv = user.university || body.university || "";

    if (!query || query.length < 1) {
      return Response.json({ results: [] });
    }

    // Build regex for partial matching (case-insensitive)
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Query: match username, full_name, or preferred_name
    const filter = {
      $or: [
        { username: { $regex: escaped, $options: "i" } },
        { full_name: { $regex: escaped, $options: "i" } },
        { preferred_name: { $regex: escaped, $options: "i" } },
      ],
    };

    const records = await base44.asServiceRole.entities.User.filter(filter, "-created_date", limit * 3);

    // Rank results: prefix matches first, then same university, then contains
    const scored = (records || [])
      .filter((r) => r.id !== user.id) // exclude self
      .map((r) => {
        const username = (r.username || "").toLowerCase();
        const fullName = (r.full_name || "").toLowerCase();
        const prefName = (r.preferred_name || "").toLowerCase();

        let score = 0;

        // Username prefix match (highest)
        if (username.startsWith(query)) score += 100;
        // Username contains
        else if (username.includes(query)) score += 60;

        // Name prefix match
        if (fullName.startsWith(query)) score += 80;
        if (prefName.startsWith(query)) score += 70;
        // Name contains
        else if (fullName.includes(query) || prefName.includes(query)) score += 40;

        // Same university boost
        if (viewerUniv && r.university === viewerUniv) score += 25;
        // Same faculty boost
        if (user.faculty && r.faculty === user.faculty) score += 10;
        // Same department boost
        if (user.department && r.department === user.department) score += 5;
        // Has avatar (slight visual preference)
        if (r.avatar_url) score += 2;

        return { record: r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Return only public fields
    const results = scored.map(({ record: r, score }) => ({
      id: r.id,
      username: r.username || null,
      full_name: r.full_name || null,
      preferred_name: r.preferred_name || null,
      avatar_url: r.avatar_url || null,
      university: r.university || null,
      faculty: r.faculty || null,
      department: r.department || null,
      level: r.level || null,
      is_verified: r.matriculation_verified || false,
      _score: score,
    }));

    return Response.json({ results, count: results.length });
  } catch (error) {
    return Response.json({ error: error.message || "Search failed" }, { status: 500 });
  }
});