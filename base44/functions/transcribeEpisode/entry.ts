import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * transcribeEpisode — Bud's document-understanding + summarization capability
 * applied to podcast audio. The creator triggers it; Bud transcribes the audio
 * (TranscribeAudio), then generates a concise summary + key takeaways (InvokeLLM),
 * and persists both onto the episode so listeners get an instant overview.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const episodeId = body.episode_id;
    if (!episodeId) return Response.json({ error: "episode_id required" }, { status: 400 });

    const episode = await base44.entities.PodcastEpisode.get(episodeId);
    if (!episode) return Response.json({ error: "Episode not found" }, { status: 404 });
    if (episode.created_by_id !== user.id && user.role !== "admin") {
      return Response.json({ error: "Only the creator can transcribe" }, { status: 403 });
    }
    if (!episode.audio_url) return Response.json({ error: "This episode has no audio file" }, { status: 400 });

    // 1. Transcribe the audio (Bud document understanding)
    let transcript = "";
    try {
      const tr = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url: episode.audio_url });
      transcript = typeof tr === "string" ? tr : (tr?.text || tr?.transcript || "");
    } catch (err) {
      console.error("TranscribeAudio failed", err?.message || err);
      return Response.json({ error: "Transcription failed — ensure the audio is a supported format under 25MB." }, { status: 422 });
    }
    if (!transcript || transcript.trim().length < 5) {
      return Response.json({ error: "Transcription returned no usable text" }, { status: 422 });
    }

    // 2. Summarize + extract takeaways (Bud summarization)
    let summary = "";
    let takeaways: string[] = [];
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:
          "You are Bud, UNIBUD's academic companion. Read the following podcast episode transcript and produce: (1) a concise, engaging summary in 3-5 sentences, and (2) three key takeaways a student should remember. Episode title: " +
          (episode.title || "Untitled") + ".\n\nTranscript:\n" + transcript.slice(0, 12000),
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            takeaways: { type: "array", items: { type: "string" } },
          },
          required: ["summary", "takeaways"],
        },
      });
      if (res && typeof res === "object") {
        summary = res.summary || "";
        takeaways = Array.isArray(res.takeaways) ? res.takeaways.slice(0, 5) : [];
      } else if (typeof res === "string") {
        summary = res;
      }
    } catch (err) {
      console.error("InvokeLLM summary failed", err?.message || err);
    }

    // 3. Persist transcript + summary onto the episode
    await base44.entities.PodcastEpisode.update(episodeId, {
      transcript,
      summary,
      takeaways,
    });

    return Response.json({ status: "success", transcript, summary, takeaways });
  } catch (error) {
    console.error("transcribeEpisode error", error?.message || error);
    return Response.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}