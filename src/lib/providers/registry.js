import { ADAPTERS, DEFAULTS } from "./adapters";

const byId = Object.fromEntries(ADAPTERS.map((a) => [a.id, a]));
const active = { ...DEFAULTS };

export const all = () => ADAPTERS.slice();
export const get = (id) => byId[id];
export const byGroup = (g) => ADAPTERS.filter((a) => a.group === g);
export const groups = () => [...new Set(ADAPTERS.map((a) => a.group))];
/** Set the active adapter for a group (used by the Integration Hub / Architect config). */
export const setActive = (g, id) => { if (byId[id] && byId[id].group === g) active[g] = id; };
/** Returns the active adapter implementation for a group. */
export const getActive = (g) => byId[active[g]] || byGroup(g)[0];
export const activeId = (g) => active[g];
/** Metadata for UI (no method bodies exposed). */
export const metadata = (g) => byGroup(g).map((a) => ({ id: a.id, name: a.name, group: a.group, capabilities: a.capabilities, version: a.version }));