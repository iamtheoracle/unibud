import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * trustProfile — aggregates a user's marketplace reviews, reports filed
 * against them, and verification status into a 0–100 trust score and level.
 * Upserts the result into the TrustScore entity (service role). Public read
 * of TrustScore lets trust badges render anywhere.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const targetId = body.user_id || user.id;
    const targetName = body.user_name || (targetId === user.id ? user.full_name : "");

    const [reviewsRes, reportsRes, verRes, listingsRes, existingRes] = await Promise.all([
      base44.asServiceRole.entities.MarketplaceReview.filter({ seller_id: targetId }).catch(() => []),
      base44.asServiceRole.entities.ContentReport.filter({ reported_user_id: targetId }).catch(() => []),
      base44.asServiceRole.entities.VerificationRequest.filter({ target_type: "user", target_id: targetId, status: "approved" }).catch(() => []),
      base44.asServiceRole.entities.MarketplaceListing.filter({ created_by_id: targetId }).catch(() => []),
      base44.asServiceRole.entities.TrustScore.filter({ user_id: targetId }).catch(() => []),
    ]);

    const reviews = reviewsRes || [];
    const reviewsCount = reviews.length;
    const reviewsAvg = reviewsCount ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewsCount : 0;
    const reportsCount = (reportsRes || []).length;
    const verified = (verRes || []).length > 0;
    const listingsCount = (listingsRes || []).length;

    let score = 40;
    if (verified) score += 20;
    score += Math.round(reviewsAvg * 8);
    score -= reportsCount * 5;
    score = Math.max(0, Math.min(100, score));

    let level = "new";
    if (verified && reviewsCount >= 10 && reviewsAvg >= 4.5) level = "star";
    else if (verified && reviewsCount >= 3) level = "trusted";
    else if (verified) level = "verified";
    else if (reviewsCount > 0 || listingsCount > 0) level = "unverified";

    const profile = {
      user_id: targetId, user_name: targetName, score, level, verified,
      reviews_count: reviewsCount, reviews_avg: Math.round(reviewsAvg * 10) / 10,
      reports_count: reportsCount, listings_count: listingsCount,
      updated_at: new Date().toISOString(),
    };

    try {
      if (existingRes && existingRes.length) {
        await base44.asServiceRole.entities.TrustScore.update(existingRes[0].id, profile);
      } else {
        await base44.asServiceRole.entities.TrustScore.create(profile);
      }
    } catch {}

    return Response.json(profile);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});