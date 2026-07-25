import { get, all } from "./registry";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export async function check(id) {
  const a = get(id);
  if (!a) return { id, ok: false, latency: 0, message: "Unknown adapter" };
  const t0 = now();
  try { const r = await a.health(); return { id, ...r, latency: Math.round(now() - t0) }; }
  catch (e) { return { id, ok: false, latency: Math.round(now() - t0), message: String(e) }; }
}

export async function checkAll() { return Promise.all(all().map((a) => check(a.id))); }