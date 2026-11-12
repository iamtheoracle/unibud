import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const publicHome = readFileSync("apps/web/src/app/page.tsx", "utf8");
const authenticatedHome = readFileSync("apps/web/src/app/home/page.tsx", "utf8");

const expectedSpaces = [
  "Connect",
  "Quad",
  "Bud",
  "Flow",
  "Square",
  "The Quarter",
  "SouLync",
  "Wayward",
  "Riff",
  "Lync",
  "Concierge",
  "The Fixer"
];

for (const [label, source] of [
  ["public landing", publicHome],
  ["authenticated home", authenticatedHome]
]) {
  for (const space of expectedSpaces) {
    assert.ok(source.includes(`"${space}"`), `${label} is missing approved space: ${space}`);
  }
  assert.match(source, /In development/, `${label} must disclose that these experiences are not yet available`);
}

assert.match(publicHome, /01 — 12/, "public landing must present all twelve consumer destinations");
assert.match(publicHome, /not interactive product features yet/, "public landing must not imply that space cards are live");
assert.match(authenticatedHome, /not yet interactive/, "authenticated home must not imply that space cards are live");
assert.match(publicHome, /Board as its digital campus/, "Board must remain inside Bud");
assert.match(authenticatedHome, /Board is its digital campus/, "Board must remain inside Bud");
assert.match(publicHome, /age assurance, safety and consent controls/, "SouLync must retain age and consent release boundaries");
assert.match(authenticatedHome, /age assurance, safety and consent controls/, "SouLync must retain age and consent release boundaries");

for (const source of [publicHome, authenticatedHome]) {
  assert.doesNotMatch(source, /name: "UNIBUD Operations"|\["UNIBUD Operations"/, "Operations must remain internal-only");
  assert.doesNotMatch(source, /name: "Oracle Arc"|\["Oracle Arc"/, "Oracle Arc must remain independently governed, not a consumer space tile");
}

console.log("Approved consumer-space inventory and availability boundaries verified.");
