import test from "node:test";
import assert from "node:assert/strict";
import { evaluateChatAccess, type ChatAuthorizationFacts, type ChatSpaceKey } from "../src/chat.ts";

const permittedFacts: ChatAuthorizationFacts = {
  verifiedSession: true,
  activeAccount: true,
  activeProfileAuthorized: true,
  conversationParticipant: true,
  spacePolicyAllowed: true,
  blockPolicyAllowed: true,
  moderationAllowed: true
};

test("Bud and Connect use the shared Chat authorization contract", () => {
  assert.deepEqual(evaluateChatAccess("bud", permittedFacts), { allowed: true });
  assert.deepEqual(evaluateChatAccess("connect", permittedFacts), { allowed: true });
});

test("ordinary space chat requires every common server-derived authorization gate", () => {
  const deniedFacts: Array<[keyof ChatAuthorizationFacts, ChatAuthorizationFacts[keyof ChatAuthorizationFacts], string]> = [
    ["verifiedSession", false, "session_unverified"],
    ["activeAccount", false, "account_inactive"],
    ["activeProfileAuthorized", false, "profile_not_authorized"],
    ["conversationParticipant", false, "not_a_conversation_participant"],
    ["spacePolicyAllowed", false, "space_policy_denied"],
    ["blockPolicyAllowed", false, "blocked"],
    ["moderationAllowed", false, "moderation_denied"]
  ];
  for (const [key, value, reason] of deniedFacts) {
    assert.deepEqual(
      evaluateChatAccess("connect", { ...permittedFacts, [key]: value }),
      { allowed: false, reason }
    );
  }
});

test("Riff and SouLync cannot opt into the generic Chat authorization contract", () => {
  for (const space of ["riff", "soullync", "quad", "square"] as const) {
    assert.deepEqual(
      evaluateChatAccess(space as unknown as ChatSpaceKey, permittedFacts),
      { allowed: false, reason: "space_policy_denied" }
    );
  }
});
