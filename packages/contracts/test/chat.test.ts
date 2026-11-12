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

test("ordinary space chat requires every common server-derived authorization gate", () => {
  assert.deepEqual(evaluateChatAccess("connect", permittedFacts), { allowed: true });
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

test("SouLync requires independently verified adult eligibility and current consent", () => {
  assert.deepEqual(evaluateChatAccess("soullync", permittedFacts), {
    allowed: false,
    reason: "adult_eligibility_unverified"
  });
  assert.deepEqual(evaluateChatAccess("soullync", {
    ...permittedFacts,
    adultEligibilityVerified: true
  }), {
    allowed: false,
    reason: "independent_consent_missing"
  });
  assert.deepEqual(evaluateChatAccess("soullync", {
    ...permittedFacts,
    adultEligibilityVerified: true,
    independentConsentGranted: true
  }), { allowed: true });
});

test("Riff remains subject to its own lifecycle adapter", () => {
  assert.deepEqual(evaluateChatAccess("riff", permittedFacts), {
    allowed: false,
    reason: "riff_lifecycle_denied"
  });
  assert.deepEqual(evaluateChatAccess("riff", {
    ...permittedFacts,
    riffLifecycleAllowed: true
  }), { allowed: true });
});


test("spaces without an approved shared Chat adapter fail closed", () => {
  assert.deepEqual(evaluateChatAccess("quad" as ChatSpaceKey, permittedFacts), {
    allowed: false,
    reason: "space_policy_denied"
  });
  assert.deepEqual(evaluateChatAccess("square" as ChatSpaceKey, permittedFacts), {
    allowed: false,
    reason: "space_policy_denied"
  });
});
