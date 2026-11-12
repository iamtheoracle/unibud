import { createHash } from "node:crypto";
import { createFlowStepUpProof } from "./flow-step-up-core";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import type {
  FlowWebAuthnRepository,
  FlowWebAuthnCredential
} from "./flow-webauthn-repository";

function webAuthnConfiguration(): { rpId: string; origin: string; rpName: string } {
  const rpId = process.env.UNIBUD_WEBAUTHN_RP_ID?.trim().toLowerCase() ?? "";
  const configuredOrigin = process.env.UNIBUD_WEBAUTHN_ORIGIN?.trim() ?? "";
  const rpName = process.env.UNIBUD_WEBAUTHN_RP_NAME?.trim() || "UNIBUD Flow";
  if (!rpId || !configuredOrigin) {
    throw new Error("UNIBUD_WEBAUTHN_RP_ID and UNIBUD_WEBAUTHN_ORIGIN are required.");
  }
  let parsed: URL;
  try {
    parsed = new URL(configuredOrigin);
  } catch {
    throw new Error("UNIBUD_WEBAUTHN_ORIGIN must be a valid origin URL.");
  }
  if (parsed.origin !== configuredOrigin.replace(/\/$/, "") ||
      parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("UNIBUD_WEBAUTHN_ORIGIN must be an exact origin without a path.");
  }
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("UNIBUD_WEBAUTHN_ORIGIN must use HTTPS in production.");
  }
  if (parsed.hostname !== rpId && !parsed.hostname.endsWith("." + rpId)) {
    throw new Error("UNIBUD_WEBAUTHN_RP_ID must be the origin host or a parent domain.");
  }
  return { rpId, origin: parsed.origin, rpName };
}


function canonicalCredentialDigest(input: {
  challengeDigest: Buffer;
  credentialId: Buffer;
  publicKeyCose: Buffer;
  signatureCounter: number;
  transports: string[];
}): Buffer {
  const canonical = [
    input.challengeDigest.toString("hex"),
    input.credentialId.toString("hex"),
    input.publicKeyCose.toString("hex"),
    String(input.signatureCounter),
    input.transports.join(",")
  ].join(":");
  return createHash("sha256").update(canonical, "utf8").digest();
}

export class FlowWebAuthnService {
  private readonly repository: FlowWebAuthnRepository;
  private readonly verifyResponse: typeof verifyRegistrationResponse;

  constructor(
    repository: FlowWebAuthnRepository,
    verifyResponse: typeof verifyRegistrationResponse = verifyRegistrationResponse
  ) {
    this.repository = repository;
    this.verifyResponse = verifyResponse;
  }

  async createRegistrationOptions(input: {
    accountId: string;
    sessionId: string;
  }): Promise<{ registrationId: string; options: Awaited<ReturnType<typeof generateRegistrationOptions>> }> {
    const config = webAuthnConfiguration();
    const credentials: FlowWebAuthnCredential[] = await this.repository.listCredentials(
      input.accountId,
      input.sessionId
    );
    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpId,
      userID: Buffer.from(input.accountId, "utf8"),
      userName: input.accountId,
      userDisplayName: "UNIBUD Flow account",
      attestationType: "none",
      excludeCredentials: credentials.map(credential => ({
        id: credential.credentialId.toString("base64url"),
        transports: credential.transports as never
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required"
      },
      timeout: 60_000
    });
    const challenge = Buffer.from(options.challenge, "base64url");
    const registrationId = await this.repository.createRegistrationChallenge(
      input.accountId,
      input.sessionId,
      challenge,
      new Date(Date.now() + 5 * 60_000)
    );
    if (!registrationId) {
      throw new Error("A WebAuthn registration challenge could not be created. Check rate limits and active challenges.");
    }
    return { registrationId, options };
  }

  async verifyRegistration(input: {
    accountId: string;
    sessionId: string;
    registrationId: string;
    response: unknown;
  }): Promise<boolean> {
    const config = webAuthnConfiguration();
    const challenge = await this.repository.getRegistrationChallenge(
      input.accountId,
      input.sessionId,
      input.registrationId
    );
    if (!challenge) return false;

    let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
    try {
      verification = await this.verifyResponse({
        response: input.response as Parameters<typeof verifyRegistrationResponse>[0]["response"],
        expectedChallenge: challenge.challenge.toString("base64url"),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        requireUserVerification: true
      });
    } catch {
      await this.repository.failRegistrationChallenge(
        input.accountId,
        input.sessionId,
        input.registrationId
      );
      return false;
    }

    const credential = verification.registrationInfo?.credential;
    if (!verification.verified || !credential) {
      await this.repository.failRegistrationChallenge(
        input.accountId,
        input.sessionId,
        input.registrationId
      );
      return false;
    }

    const credentialId = Buffer.from(credential.id, "base64url");
    const publicKeyCose = Buffer.from(credential.publicKey);
    const signatureCounter = credential.counter;
    const transports = [...new Set(credential.transports ?? [])].sort();
    const payloadDigest = canonicalCredentialDigest({
      challengeDigest: challenge.challengeDigest,
      credentialId,
      publicKeyCose,
      signatureCounter,
      transports
    });
    const proof = createFlowStepUpProof(
      input.accountId,
      input.sessionId,
      "webauthn_register",
      payloadDigest
    );

    return this.repository.registerCredential({
      accountId: input.accountId,
      sessionId: input.sessionId,
      registrationId: input.registrationId,
      credentialId,
      publicKeyCose,
      signatureCounter,
      transports,
      payloadDigest,
      proof
    });
  }
}
