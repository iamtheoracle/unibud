import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// App-user workspace connectors (registered in this workspace)
const CONNECTORS = {
  tiktok: "6a64d08fb9414f10f292dac6",
  discord: "6a64cbde892c4603ea7adbd1",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ connected: false, error: "Unauthorized" }, { status: 200 });

    const body = await req.json().catch(() => ({}));
    const connector = body?.connector;
    const connectorId = CONNECTORS[connector];
    if (!connectorId) return Response.json({ connected: false, error: "Unknown connector" }, { status: 200 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    if (connector === "tiktok") {
      const res = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,likes_count",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const p = data?.data?.user || {};
      return Response.json({ connected: true, profile: { name: p.display_name, avatar: p.avatar_url, followers: p.follower_count, likes: p.likes_count } });
    }

    if (connector === "discord") {
      const res = await fetch("https://discord.com/api/v10/users/@me", { headers: { Authorization: `Bearer ${accessToken}` } });
      const u = await res.json();
      return Response.json({
        connected: true,
        profile: { name: u.username, avatar: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` : null },
      });
    }

    return Response.json({ connected: false, error: "Not implemented" }, { status: 200 });
  } catch (error) {
    return Response.json({ connected: false, error: error?.message || "Not connected" }, { status: 200 });
  }
});