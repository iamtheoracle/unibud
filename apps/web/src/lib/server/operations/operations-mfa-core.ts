import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIOD = 30;
const VERSION = "v1";

function encodeBase32(bytes: Uint8Array): string {
  let bits=0, buffer=0, output="";
  for (const byte of bytes) {
    buffer=(buffer<<8)|byte; bits+=8;
    while(bits>=5){bits-=5;output+=ALPHABET[(buffer>>>bits)&31];}
  }
  if(bits) output+=ALPHABET[(buffer<<(5-bits))&31];
  return output;
}
function decodeBase32(value:string):Buffer {
  const normalized=value.replace(/=+$/g,"").toUpperCase();
  if(!/^[A-Z2-7]+$/.test(normalized)) throw new Error("Invalid authenticator secret.");
  let bits=0,buffer=0;const bytes:number[]=[];
  for(const char of normalized){
    buffer=(buffer<<5)|ALPHABET.indexOf(char);bits+=5;
    if(bits>=8){bits-=8;bytes.push((buffer>>>bits)&255);}
  }
  return Buffer.from(bytes);
}
function validAccount(id:string):boolean{return /^[0-9a-f-]{36}$/i.test(id);}
function counterAt(ms:number):number {
  if(!Number.isFinite(ms)||ms<0) throw new Error("Invalid authenticator time.");
  return Math.floor(ms/1000/PERIOD);
}
export function calculateTotpCode(secret:Uint8Array,timestampMs:number,digits=6):string {
  if(secret.byteLength<16||![6,8].includes(digits)) throw new Error("Invalid authenticator parameters.");
  const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(counterAt(timestampMs)));
  const digest=createHmac("sha1",secret).update(counter).digest();
  const offset=digest[digest.length-1]&15;
  const binary=((digest[offset]&127)<<24)|((digest[offset+1]&255)<<16)|((digest[offset+2]&255)<<8)|(digest[offset+3]&255);
  return String(binary%(10**digits)).padStart(digits,"0");
}
export function verifyTotpCode(secret:Uint8Array,code:string,timestampMs:number,lastAcceptedStep:number|null=null):{acceptedStep:number}|null {
  if(!/^\d{6}$/.test(code)) return null;
  const current=counterAt(timestampMs),supplied=Buffer.from(code,"ascii");
  for(let offset=-1;offset<=1;offset++){
    const step=current+offset;
    if(step<0||(lastAcceptedStep!==null&&step<=lastAcceptedStep)) continue;
    const candidate=Buffer.from(calculateTotpCode(secret,step*PERIOD*1000),"ascii");
    if(candidate.length===supplied.length&&timingSafeEqual(candidate,supplied)) return {acceptedStep:step};
  }
  return null;
}
export interface OperationsMfaEncryptionKey { id: string; key: Uint8Array; }
export interface OperationsMfaRecoveryKeyring {
  activeKeyId: string;
  keys: OperationsMfaEncryptionKey[];
}

export function createOperationsMfaCryptographyFromEnvironment(): OperationsMfaCryptography {
  const readKey = (name: string): Buffer => {
    const value = process.env[name]?.trim() ?? "";
    if (!/^(?:[0-9a-f]{2}){32}$/i.test(value)) {
      throw new Error(name + " must be exactly 32 random bytes encoded as hex.");
    }
    return Buffer.from(value, "hex");
  };
  const legacyEncryptionKey = readKey("UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY");
  const recoveryKey = readKey("UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY");
  const recoveryKeyringRaw = process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEYRING_JSON?.trim();
  let recoveryKeyring: OperationsMfaRecoveryKeyring | undefined;
  if (recoveryKeyringRaw) {
    let parsedRecovery: unknown;
    try { parsedRecovery = JSON.parse(recoveryKeyringRaw); } catch { throw new Error("Operations MFA recovery keyring must be valid JSON."); }
    if (!parsedRecovery || typeof parsedRecovery !== "object" || Array.isArray(parsedRecovery)) {
      throw new Error("Operations MFA recovery keyring has an invalid shape.");
    }
    const config = parsedRecovery as { activeKeyId?: unknown; keys?: unknown };
    if (typeof config.activeKeyId !== "string" || !Array.isArray(config.keys)
        || config.keys.length < 1 || config.keys.length > 2) {
      throw new Error("Operations MFA recovery keyring must contain one or two keys and an active key ID.");
    }
    const keys: OperationsMfaEncryptionKey[] = config.keys.map((item: unknown) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Operations MFA recovery keyring entry is invalid.");
      const entry = item as { id?: unknown; keyHex?: unknown };
      if (typeof entry.id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(entry.id)
          || typeof entry.keyHex !== "string" || !/^(?:[0-9a-f]{2}){32}$/i.test(entry.keyHex)) {
        throw new Error("Operations MFA recovery keyring entry must contain a valid ID and 32-byte hex key.");
      }
      return { id: entry.id, key: Buffer.from(entry.keyHex, "hex") };
    });
    if (new Set(keys.map(key => key.id)).size !== keys.length || !keys.some(key => key.id === config.activeKeyId)) {
      throw new Error("Operations MFA recovery keyring IDs must be unique and include the active key.");
    }
    recoveryKeyring = { activeKeyId: config.activeKeyId, keys };
  }
  const keyringRaw = process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON?.trim();
  if (!keyringRaw) return new OperationsMfaCryptography(legacyEncryptionKey, recoveryKey, undefined, recoveryKeyring);

  let parsed: unknown;
  try { parsed = JSON.parse(keyringRaw); } catch { throw new Error("Operations MFA encryption keyring must be valid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Operations MFA encryption keyring has an invalid shape.");
  }
  const config = parsed as { activeKeyId?: unknown; keys?: unknown };
  if (typeof config.activeKeyId !== "string" || !Array.isArray(config.keys)
      || config.keys.length < 1 || config.keys.length > 2) {
    throw new Error("Operations MFA encryption keyring must contain one or two keys and an active key ID.");
  }
  const keys: OperationsMfaEncryptionKey[] = config.keys.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Operations MFA encryption keyring entry is invalid.");
    }
    const entry = item as { id?: unknown; keyHex?: unknown };
    if (typeof entry.id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(entry.id)
        || typeof entry.keyHex !== "string" || !/^(?:[0-9a-f]{2}){32}$/i.test(entry.keyHex)) {
      throw new Error("Operations MFA encryption keyring entry must contain a valid ID and 32-byte hex key.");
    }
    return { id: entry.id, key: Buffer.from(entry.keyHex, "hex") };
  });
  if (new Set(keys.map(key => key.id)).size !== keys.length
      || !keys.some(key => key.id === config.activeKeyId)) {
    throw new Error("Operations MFA encryption keyring IDs must be unique and include the active key.");
  }
  return new OperationsMfaCryptography(legacyEncryptionKey, recoveryKey, {
    activeKeyId: config.activeKeyId, keys
  }, recoveryKeyring);
}

export interface EncryptedTotpSecret {ciphertext:string;}
export interface OperationsMfaEncryptionKeyring {
  activeKeyId: string;
  keys: OperationsMfaEncryptionKey[];
}
export class OperationsMfaCryptography {
  private readonly legacyEncryptionKey:Buffer;
  private readonly encryptionKeys:Map<string,Buffer>;
  private readonly activeEncryptionKeyId:string|null;
  private readonly legacyRecoveryKey:Buffer;
  private readonly recoveryKeys:Map<string,Buffer>;
  private readonly activeRecoveryKeyId:string|null;
  constructor(encryptionKey:Uint8Array,recoveryKey:Uint8Array,keyring?:OperationsMfaEncryptionKeyring,recoveryKeyring?:OperationsMfaRecoveryKeyring){
    if(encryptionKey.byteLength!==32||recoveryKey.byteLength!==32) throw new Error("Operations MFA keys must each be exactly 32 bytes.");
    this.legacyEncryptionKey=Buffer.from(encryptionKey);
    this.legacyRecoveryKey=Buffer.from(recoveryKey);
    this.recoveryKeys=new Map();this.activeRecoveryKeyId=null;
    if(recoveryKeyring){
      if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(recoveryKeyring.activeKeyId)
          ||recoveryKeyring.keys.length<1||recoveryKeyring.keys.length>2
          ||new Set(recoveryKeyring.keys.map(item=>item.id)).size!==recoveryKeyring.keys.length
          ||!recoveryKeyring.keys.some(item=>item.id===recoveryKeyring.activeKeyId)
          ||recoveryKeyring.keys.some(item=>!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(item.id)||item.key.byteLength!==32)){
        throw new Error("Invalid Operations MFA recovery keyring.");
      }
      for(const item of recoveryKeyring.keys)this.recoveryKeys.set(item.id,Buffer.from(item.key));
      this.activeRecoveryKeyId=recoveryKeyring.activeKeyId;
    }
    this.encryptionKeys=new Map();
    this.activeEncryptionKeyId=null;
    if(keyring){
      if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(keyring.activeKeyId)
          ||keyring.keys.length<1||keyring.keys.length>2
          ||new Set(keyring.keys.map(item=>item.id)).size!==keyring.keys.length
          ||!keyring.keys.some(item=>item.id===keyring.activeKeyId)
          ||keyring.keys.some(item=>!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(item.id)||item.key.byteLength!==32)){
        throw new Error("Invalid Operations MFA encryption keyring.");
      }
      for(const item of keyring.keys)this.encryptionKeys.set(item.id,Buffer.from(item.key));
      this.activeEncryptionKeyId=keyring.activeKeyId;
    }
  }
  generateSecret():Buffer{return randomBytes(20);}
  encodeSecret(secret:Uint8Array):string{
    if(secret.byteLength!==20) throw new Error("Authenticator secret must contain 160 bits.");
    return encodeBase32(secret);
  }
  decodeSecret(value:string):Buffer{
    const decoded=decodeBase32(value);
    if(decoded.length!==20) throw new Error("Authenticator secret must contain 160 bits.");
    return decoded;
  }
  encryptSecret(accountId:string,secret:Uint8Array):EncryptedTotpSecret{
    if(!validAccount(accountId)||secret.byteLength!==20) throw new Error("Invalid Operations MFA enrollment.");
    const keyId=this.activeEncryptionKeyId;
    const key=keyId?this.encryptionKeys.get(keyId):this.legacyEncryptionKey;
    if(!key) throw new Error("Operations MFA encryption key is unavailable.");
    const version=keyId?"v2":"v1";
    const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);
    cipher.setAAD(Buffer.from(keyId
      ?"unibud:operations-mfa:v2:"+accountId+":"+keyId
      :"unibud:operations-mfa:v1:"+accountId));
    const ciphertext=Buffer.concat([cipher.update(secret),cipher.final()]);
    return {ciphertext:(keyId
      ?["v2",keyId,iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),ciphertext.toString("base64url")]
      :["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),ciphertext.toString("base64url")]).join(".")};
  }
  decryptSecret(accountId:string,envelope:EncryptedTotpSecret):Buffer{
    if(!validAccount(accountId)) throw new Error("Invalid Operations MFA account.");
    const parts=envelope.ciphertext.split(".");
    const isLegacy=parts.length===4&&parts[0]==="v1";
    const isRotated=parts.length===5&&parts[0]==="v2"
      &&/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(parts[1]);
    if(!isLegacy&&!isRotated) throw new Error("Invalid Operations MFA secret envelope.");
    const key=isLegacy?this.legacyEncryptionKey:this.encryptionKeys.get(parts[1]);
    if(!key) throw new Error("Operations MFA encryption key is unavailable.");
    try{
      const offset=isLegacy?1:2;
      const iv=Buffer.from(parts[offset],"base64url"),tag=Buffer.from(parts[offset+1],"base64url"),data=Buffer.from(parts[offset+2],"base64url");
      if(iv.length!==12||tag.length!==16||data.length!==20) throw new Error("Invalid envelope.");
      const decipher=createDecipheriv("aes-256-gcm",key,iv);
      decipher.setAAD(Buffer.from(isLegacy
        ?"unibud:operations-mfa:v1:"+accountId
        :"unibud:operations-mfa:v2:"+accountId+":"+parts[1]));
      decipher.setAuthTag(tag);
      const secret=Buffer.concat([decipher.update(data),decipher.final()]);
      if(secret.length!==20) throw new Error("Invalid secret.");
      return secret;
    }catch{throw new Error("Operations MFA secret could not be authenticated.");}
  }
  provisioningUri(accountId:string,secretBase32:string,issuer="UNIBUD Operations"):string{
    if(!validAccount(accountId)||!/^[A-Z2-7]{32}$/.test(secretBase32)||!issuer.trim()||issuer.length>64) throw new Error("Invalid authenticator provisioning details.");
    const query=new URLSearchParams({secret:secretBase32,issuer,algorithm:"SHA1",digits:"6",period:String(PERIOD)});
    return "otpauth://totp/"+encodeURIComponent(issuer+":"+accountId)+"?"+query.toString();
  }
  generateRecoveryCodes(count=10):string[]{
    if(!Number.isInteger(count)||count<8||count>16) throw new Error("Recovery-code count must be between 8 and 16.");
    return Array.from({length:count},()=>randomBytes(10).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-"));
  }
  private normalizedRecoveryCode(accountId:string,code:string):string{
    if(!validAccount(accountId)||!/^[A-F0-9]{5}(?:-[A-F0-9]{5}){3}$/i.test(code)) throw new Error("Invalid Operations recovery code.");
    return code.replace(/-/g,"").toUpperCase();
  }
  digestRecoveryCode(accountId:string,code:string):Buffer{
    const normalized=this.normalizedRecoveryCode(accountId,code);
    const keyId=this.activeRecoveryKeyId;
    const key=keyId?this.recoveryKeys.get(keyId):this.legacyRecoveryKey;
    if(!key) throw new Error("Operations MFA recovery key is unavailable.");
    const version=keyId?"v2:"+keyId:"v1";
    return createHmac("sha256",key).update("unibud:operations-recovery:"+version+":"+accountId+":"+normalized).digest();
  }
  digestRecoveryCodeCandidates(accountId:string,code:string):Buffer[]{
    const normalized=this.normalizedRecoveryCode(accountId,code);
    const candidates=[createHmac("sha256",this.legacyRecoveryKey)
      .update("unibud:operations-recovery:v1:"+accountId+":"+normalized).digest()];
    for(const [keyId,key] of this.recoveryKeys){
      candidates.push(createHmac("sha256",key)
        .update("unibud:operations-recovery:v2:"+keyId+":"+accountId+":"+normalized).digest());
    }
    return candidates;
  }
  recoveryCodeMatches(expected:Uint8Array,accountId:string,code:string):boolean{
    if(expected.byteLength!==32)return false;
    try{
      let matched=0;
      for(const candidate of this.digestRecoveryCodeCandidates(accountId,code)){
        matched|=Number(timingSafeEqual(Buffer.from(expected),candidate));
      }
      return matched===1;
    }catch{return false;}
  }
}
