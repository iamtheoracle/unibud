import { createCipheriv, randomBytes } from "node:crypto";

export class AesGcmContactEncryptor {
  constructor(private readonly key: Uint8Array) {
    if (key.byteLength !== 32) {
      throw new Error("Contact encryption key must be exactly 32 bytes.");
    }
  }

  static fromEnvironment(): AesGcmContactEncryptor {
    const encoded = process.env.UNIBUD_CONTACT_ENCRYPTION_KEY?.trim() ?? "";
    if (!/^(?:[0-9a-f]{2}){32}$/i.test(encoded)) {
      throw new Error("UNIBUD_CONTACT_ENCRYPTION_KEY must be 32 random bytes encoded as hex.");
    }
    return new AesGcmContactEncryptor(Buffer.from(encoded, "hex"));
  }

  async encrypt(input: {
    method: "email" | "phone";
    normalizedIdentifier: string;
  }): Promise<Uint8Array> {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(Buffer.from(`unibud:contact:v1:${input.method}`, "utf8"));
    const ciphertext = Buffer.concat([
      cipher.update(input.normalizedIdentifier, "utf8"),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    // Version byte | 12-byte nonce | 16-byte authentication tag | ciphertext.
    return Buffer.concat([Buffer.from([1]), iv, tag, ciphertext]);
  }
}
