import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64URL_32 = /^[A-Za-z0-9_-]{43}$/;

export interface FlowProtectedReference {
  ciphertext: Buffer;
  lookupDigest: Buffer;
}

export class FlowDataProtection {
  private readonly encryptionKey: Buffer;
  private readonly lookupKey: Buffer;

  constructor(encryptionKey: Uint8Array, lookupKey: Uint8Array) {
    if (encryptionKey.byteLength !== 32 || lookupKey.byteLength !== 32) {
      throw new Error("Flow data-protection keys must each contain exactly 32 bytes.");
    }
    this.encryptionKey = Buffer.from(encryptionKey);
    this.lookupKey = Buffer.from(lookupKey);
  }

  protectRecipientReference(
    accountId: string,
    flowAccountId: string,
    recipientReference: string
  ): FlowProtectedReference {
    if (!UUID.test(accountId) || !UUID.test(flowAccountId)) {
      throw new Error("Invalid Flow account context.");
    }
    if (typeof recipientReference !== "string" ||
        recipientReference.length < 1 ||
        Buffer.byteLength(recipientReference, "utf8") > 1024 ||
        recipientReference.trim() !== recipientReference) {
      throw new Error("Invalid recipient reference.");
    }

    const aad = Buffer.from(
      "unibud:flow:recipient:v1:" + accountId.toLowerCase() + ":" + flowAccountId.toLowerCase(),
      "utf8"
    );
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    cipher.setAAD(aad);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(recipientReference, "utf8")),
      cipher.final()
    ]);
    const ciphertext = Buffer.concat([
      Buffer.from([1]), iv, cipher.getAuthTag(), encrypted
    ]);
    const lookupDigest = createHmac("sha256", this.lookupKey)
      .update(aad)
      .update(Buffer.from([0]))
      .update(recipientReference, "utf8")
      .digest();
    return { ciphertext, lookupDigest };
  }

  unprotectRecipientReference(
    accountId: string,
    flowAccountId: string,
    ciphertext: Uint8Array,
    expectedLookupDigest: Uint8Array
  ): string {
    if (!UUID.test(accountId) || !UUID.test(flowAccountId) ||
        ciphertext.byteLength < 29 || ciphertext.byteLength > 1053 ||
        expectedLookupDigest.byteLength !== 32) {
      throw new Error("Recipient reference could not be verified.");
    }
    const packed = Buffer.from(ciphertext);
    if (packed[0] !== 1) throw new Error("Recipient reference could not be verified.");
    const aad = Buffer.from(
      "unibud:flow:recipient:v1:" + accountId.toLowerCase() + ":" + flowAccountId.toLowerCase(),
      "utf8"
    );
    try {
      const iv = packed.subarray(1, 13);
      const tag = packed.subarray(13, 29);
      const encrypted = packed.subarray(29);
      const decipher = createDecipheriv("aes-256-gcm", this.encryptionKey, iv);
      decipher.setAAD(aad);
      decipher.setAuthTag(tag);
      const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      if (plaintext.byteLength < 1 || plaintext.byteLength > 1024) {
        throw new Error("invalid length");
      }
      const lookupDigest = createHmac("sha256", this.lookupKey)
        .update(aad)
        .update(Buffer.from([0]))
        .update(plaintext)
        .digest();
      if (!timingSafeEqual(lookupDigest, Buffer.from(expectedLookupDigest))) {
        throw new Error("lookup mismatch");
      }
      const reference = plaintext.toString("utf8");
      if (!Buffer.from(reference, "utf8").equals(plaintext) ||
          reference.trim() !== reference) {
        throw new Error("invalid encoding");
      }
      return reference;
    } catch {
      throw new Error("Recipient reference could not be verified.");
    }
  }

  digestIdempotencyKey(value: string): Buffer {
    if (typeof value !== "string" || !BASE64URL_32.test(value)) {
      throw new Error("Idempotency key must be 32 random bytes encoded as base64url.");
    }
    const raw = Buffer.from(value, "base64url");
    if (raw.byteLength !== 32 || raw.toString("base64url") !== value) {
      throw new Error("Idempotency key encoding is invalid.");
    }
    return createHash("sha256").update(raw).digest();
  }
}

function readKey(name: string): Buffer {
  const value = process.env[name]?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32}$/i.test(value)) {
    throw new Error(name + " must be exactly 32 random bytes encoded as hex.");
  }
  return Buffer.from(value, "hex");
}

export function createFlowDataProtectionFromEnvironment(): FlowDataProtection {
  return new FlowDataProtection(
    readKey("UNIBUD_FLOW_DATA_ENCRYPTION_KEY"),
    readKey("UNIBUD_FLOW_LOOKUP_HMAC_KEY")
  );
}
