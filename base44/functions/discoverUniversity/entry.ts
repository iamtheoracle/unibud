import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * discoverUniversity — intelligent university discovery and provisioning.
 *
 * When a student enters a university that doesn't exist in the directory:
 *  1. Researches the institution using LLM + web search
 *  2. Verifies it is a legitimate institution
 *  3. Creates a pending Institution profile with enriched data
 *  4. Auto-provisions the default community structure
 *
 * Called from the frontend:
 *   base44.functions.invoke('discoverUniversity', { name: 'University of Lagos' })
 */

const COMMUNITY_TEMPLATE = [
  { name: "University Community", type: "university", icon: "GraduationCap" },
  { name: "Official Announcements", type: "interest_group", icon: "Megaphone" },
  { name: "General Discussion", type: "interest_group", icon: "MessageCircle" },
  { name: "Student Marketplace", type: "interest_group", icon: "ShoppingBag" },
  { name: "Events", type: "interest_group", icon: "Calendar" },
  { name: "Academic Hub", type: "interest_group", icon: "BookOpen" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();

    if (!name || name.length < 2) {
      return Response.json({ error: "University name is required" }, { status: 400 });
    }

    // ── 1. Check if the institution already exists ──
    const existing = await base44.asServiceRole.entities.Institution.filter({
      name: { $regex: "^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", $options: "i" },
    });

    if (existing && existing.length > 0) {
      const inst = existing[0];
      // Ensure communities exist for this institution
      const communities = await ensureCommunities(base44, inst);
      return Response.json({
        ok: true,
        institution: formatInstitution(inst),
        communities,
        existing: true,
      });
    }

    // ── 2. Research the institution using LLM + web search ──
    const researchPrompt =
      `Research the educational institution: "${name}". ` +
      `Verify it is a legitimate, real institution (university, polytechnic, or college). ` +
      `If it is legitimate, provide its official details. If it is NOT a real institution, set "is_legitimate" to false.\n\n` +
      `Return the following information:\n` +
      `- Official full name\n` +
      `- Short name or abbreviation\n` +
      `- Type (university, private_university, polytechnic, college_of_education, etc.)\n` +
      `- Country\n` +
      `- City\n` +
      `- Website URL\n` +
      `- Description (1-2 sentences)\n` +
      `- Motto (if known)\n` +
      `- Whether it is a legitimate institution\n`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: researchPrompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          is_legitimate: { type: "boolean" },
          official_name: { type: "string" },
          short_name: { type: "string" },
          type: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          website: { type: "string" },
          description: { type: "string" },
          motto: { type: "string" },
          faculties: { type: "array", items: { type: "string" } },
        },
        required: ["is_legitimate", "official_name"],
      },
    });

    const data = llmResponse || {};

    if (!data.is_legitimate) {
      return Response.json({
        ok: false,
        reason: "We could not verify this as a legitimate educational institution. Please check the name and try again.",
      }, { status: 422 });
    }

    // ── 3. Create the Institution record ──
    const validTypes = [
      "university", "private_university", "polytechnic", "college_of_education",
      "monotechnic", "nursing_school", "health_technology_school", "medical_college",
      "law_school", "technical_college", "vocational_school", "professional_training_institute",
      "research_institute", "secondary_school", "primary_school", "examination_body",
      "examination_center", "independent_learning_center", "online_academy", "corporate_training", "other",
    ];

    const instType = validTypes.includes(data.type) ? data.type : "university";

    const institution = await base44.asServiceRole.entities.Institution.create({
      name: data.official_name || name,
      short_name: data.short_name || "",
      type: instType,
      country: data.country || "",
      city: data.city || "",
      website: data.website || "",
      description: data.description || "",
      motto: data.motto || "",
      is_verified: false,
      verification_status: "awaiting_verification",
      status: "active",
      data_sources: ["llm_research", "web_search"],
    });

    // ── 4. Auto-provision the community structure ──
    const communities = await ensureCommunities(base44, institution);

    return Response.json({
      ok: true,
      institution: formatInstitution(institution),
      communities,
      existing: false,
      verified_by_research: true,
    });
  } catch (error) {
    return Response.json({ error: error.message || "University discovery failed" }, { status: 500 });
  }
});

/**
 * Ensures the default community structure exists for an institution.
 * Creates communities if they don't already exist.
 */
async function ensureCommunities(base44: any, institution: any) {
  const uniName = institution.name;

  // Check for existing communities for this university
  const existing = await base44.asServiceRole.entities.Community.filter({
    university: uniName,
  });

  const existingNames = new Set((existing || []).map((c: any) => c.name));
  const created = [];

  for (const template of COMMUNITY_TEMPLATE) {
    if (existingNames.has(template.name)) continue;

    const community = await base44.asServiceRole.entities.Community.create({
      name: `${template.name} — ${institution.short_name || uniName}`,
      description: `The ${template.name} for ${uniName}.`,
      type: template.type,
      university: uniName,
      icon: template.icon,
      is_official: true,
      is_verified: true,
      members_count: 0,
      members: [],
      rules: [],
      tags: [template.name.toLowerCase().replace(/\s+/g, "_")],
    });
    created.push({ id: community.id, name: community.name, type: template.type });
  }

  return created;
}

function formatInstitution(inst: any) {
  return {
    id: inst.id,
    name: inst.name,
    short_name: inst.short_name,
    type: inst.type,
    country: inst.country,
    city: inst.city,
    website: inst.website,
    description: inst.description,
    motto: inst.motto,
    is_verified: inst.is_verified,
    verification_status: inst.verification_status,
  };
}