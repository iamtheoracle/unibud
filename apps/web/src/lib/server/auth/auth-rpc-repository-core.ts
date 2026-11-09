import { createCipheriv, createHmac, randomBytes } from "node:crypto";
import type { SqlClient, SqlPool } from "../database/account-context-core.ts";
import type { AuthRepository, AuthAccountRecord, RecoveryTarget, AuthRateLimiter } from "./authentication-core.ts";
import type { NewVerificationChallenge, VerificationChallengeRepository, ChallengeVerificationResult, VerificationRateLimiter } from "./verification-core.ts";
import type { PersistedSession, SessionAccount, SessionRepository } from "./session-core.ts";

interface Row { [key: string]: unknown }
function asString(value:unknown):string { if(typeof value!=="string") throw new Error("Unexpected database result."); return value; }
function asNullableString(value:unknown):string|null { return value===null||value===undefined?null:asString(value); }
function asDateString(value:unknown):string { return value instanceof Date?value.toISOString():asString(value); }
function asNullableDateString(value:unknown):string|null { return value===null||value===undefined?null:asDateString(value); }
function readKey(name:string):Buffer {
 const raw=process.env[name]?.trim()??"";
 if(!/^(?:[0-9a-f]{2}){32,}$/i.test(raw)) throw new Error(name+" must be at least 32 random bytes encoded as hex.");
 return Buffer.from(raw,"hex");
}

/** Encrypts identifier material and creates a keyed lookup digest. */
export class IdentifierProtector {
 private readonly encryptionKey:Uint8Array;
 private readonly lookupKey:Uint8Array;
 constructor(encryptionKey:Uint8Array,lookupKey:Uint8Array){
  if(encryptionKey.byteLength!==32||lookupKey.byteLength<32) throw new Error("Invalid identifier protection key material.");
  this.encryptionKey=encryptionKey;this.lookupKey=lookupKey;
 }
 protect(identifier:string,method:"email"|"phone"):{ciphertext:Buffer;lookupDigest:Buffer}{
  const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",this.encryptionKey,iv);
  cipher.setAAD(Buffer.from("unibud:identity:v1:"+method,"utf8"));
  const encrypted=Buffer.concat([cipher.update(identifier,"utf8"),cipher.final()]);
  return {ciphertext:Buffer.concat([Buffer.from([1]),iv,cipher.getAuthTag(),encrypted]),
   lookupDigest:this.digest(identifier,method)};
 }
 digest(identifier:string,method:"email"|"phone"):Buffer {
  return createHmac("sha256",this.lookupKey).update("identifier:"+method+":"+identifier,"utf8").digest();
 }
}

/**
 * Uses only reviewed SECURITY DEFINER procedures. The supplied pool must connect
 * as a dedicated LOGIN principal granted unibud_auth, never as a table owner,
 * superuser, BYPASSRLS role, or unibud_app.
 */
export class AuthRateLimitExceededError extends Error {
 constructor(){super("Too many attempts. Please wait before trying again.");this.name="AuthRateLimitExceededError";}
}

export class AuthRpcRepository implements AuthRepository,VerificationChallengeRepository,SessionRepository,AuthRateLimiter,VerificationRateLimiter {
 private readonly pool:SqlPool;
 private readonly identifiers:IdentifierProtector;
 private readonly rateLimitKey:Uint8Array;
 constructor(pool:SqlPool,identifiers:IdentifierProtector,rateLimitKey:Uint8Array){
  if(rateLimitKey.byteLength<32) throw new Error("Rate-limit HMAC key must contain at least 32 bytes.");
  this.pool=pool;this.identifiers=identifiers;this.rateLimitKey=rateLimitKey;
 }

 private async consumeRateLimit(action:"register"|"login"|"recovery"|"verification",digest:Uint8Array,now:string,maxAttempts:number):Promise<void>{
  if(digest.byteLength!==32) throw new Error("Invalid rate-limit digest.");
  const rows=await this.query<{allowed:boolean}>(
   "SELECT public.auth_consume_rate_limit($1,$2,$3,$4,$5,$6) AS allowed",
   [action,digest,now,900,maxAttempts,1800]
  );
  if(rows[0]?.allowed!==true) throw new AuthRateLimitExceededError();
 }

 async assertAllowed(input:Parameters<AuthRateLimiter["assertAllowed"]>[0]):Promise<void>;
 async assertAllowed(input:Parameters<VerificationRateLimiter["assertAllowed"]>[0]):Promise<void>;
 async assertAllowed(input:Parameters<AuthRateLimiter["assertAllowed"]>[0]|Parameters<VerificationRateLimiter["assertAllowed"]>[0]):Promise<void>{
  if("identifierDigest" in input){
   if(!/^[0-9a-f]{64}$/i.test(input.identifierDigest)) throw new Error("Invalid identifier rate-limit digest.");
   const limit=input.action==="login"?10:3;
   await this.consumeRateLimit(input.action,Buffer.from(input.identifierDigest,"hex"),input.now,limit);
   return;
  }
  const digest=createHmac("sha256",this.rateLimitKey)
   .update("verification:"+input.accountId+":"+input.channel+":"+input.purpose+":","utf8")
   .update(input.targetDigest).digest();
  await this.consumeRateLimit("verification",digest,input.now,3);
 }

 private async query<T=Row>(sql:string,values:readonly unknown[]=[]):Promise<T[]>{
  const client:SqlClient=await this.pool.connect();
  try{return (await client.query<T>(sql,values)).rows;}
  finally{client.release();}
 }

 async registerPending(input:Parameters<AuthRepository["registerPending"]>[0]):Promise<boolean>{
  const protectedValue=this.identifiers.protect(input.normalizedIdentifier,input.method);
  try{
   await this.query("SELECT * FROM public.auth_create_pending_account($1,$2,$3,$4,$5,$6,$7)",[
    input.accountId,input.identityId,input.subject,input.method,protectedValue.ciphertext,
    protectedValue.lookupDigest,input.passwordHash
   ]);
   return true;
  }catch(error){
   if(typeof error==="object"&&error!==null&&"code" in error&&(error as {code?:unknown}).code==="23505") return false;
   throw error;
  }
 }

 async findLoginAccount(identifier:string,channel:"email"|"phone"):Promise<AuthAccountRecord|null>{
  const rows=await this.query("SELECT * FROM public.auth_lookup_identity($1,$2)",[channel,this.identifiers.digest(identifier,channel)]);
  const row=rows[0];if(!row)return null;
  return {id:asString(row.account_id),identityId:asString(row.identity_id),
   status:asString(row.account_status) as AuthAccountRecord["status"],
   identityVerifiedAt:asNullableDateString(row.verified_at),credentialHash:asNullableString(row.credential_hash)??""};
 }

 async findRecoveryTarget(identifier:string,channel:"email"|"phone"):Promise<RecoveryTarget|null>{
  const rows=await this.query("SELECT * FROM public.auth_lookup_identity($1,$2)",[channel,this.identifiers.digest(identifier,channel)]);
  const row=rows[0];if(!row)return null;
  if(asString(row.account_status)!=="active" || !asNullableDateString(row.verified_at)) return null;
  return {accountId:asString(row.account_id),identityId:asString(row.identity_id),channel,destination:identifier};
 }

 async findChallengeAccount(challengeId:string):Promise<string|null>{
  const rows=await this.query("SELECT * FROM public.auth_lookup_challenge_account($1)",[challengeId]);
  return rows[0]?asString(rows[0].account_id):null;
 }

 async completePasswordReset(challengeId:string,passwordHash:string,now:string):Promise<boolean>{
  const rows=await this.query<{auth_reset_password:boolean}>(
   "SELECT public.auth_reset_password($1,$2,$3) AS auth_reset_password",[challengeId,passwordHash,now]);
  return rows[0]?.auth_reset_password===true;
 }

 async create(input:NewVerificationChallenge|PersistedSession):Promise<void>{
  if("credentialDigest" in input){
   await this.query("SELECT public.auth_create_session($1,$2,$3,$4,$5,$6)",[
    input.id,input.accountId,input.credentialDigest,input.issuedAt,input.idleExpiresAt,input.absoluteExpiresAt
   ]);
   return;
  }
  await this.query("SELECT public.auth_create_verification_challenge($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[
   input.id,input.accountId,input.identityId,input.channel,input.purpose,input.targetDigest,
   input.codeDigest,input.createdAt,input.expiresAt,input.maxAttempts
  ]);
 }

 async revoke(target:string|Buffer,revokedAt:string,reason?:string):Promise<void>{
  if(Buffer.isBuffer(target)){
   await this.query("SELECT public.auth_revoke_session($1,$2,$3)",[target,revokedAt,reason??"revoked"]);
  }else{
   await this.query("SELECT public.auth_revoke_verification_challenge($1,$2)",[target,revokedAt]);
  }
 }

 async verifyAndConsume(input:{challengeId:string;codeDigest:Buffer;now:string}):Promise<ChallengeVerificationResult>{
  const rows=await this.query<{auth_verify_challenge:string}>(
   "SELECT public.auth_verify_challenge($1,$2,$3) AS auth_verify_challenge",
   [input.challengeId,input.codeDigest,input.now]);
  const result=rows[0]?.auth_verify_challenge;
  return ["verified","invalid","expired","locked","consumed","not_found"].includes(String(result))
   ? result as ChallengeVerificationResult : "not_found";
 }

 async findByCredentialDigest(digest:Buffer):Promise<{session:PersistedSession;account:SessionAccount}|null>{
  const rows=await this.query("SELECT * FROM public.auth_lookup_session($1)",[digest]);
  const row=rows[0];if(!row)return null;
  const session:PersistedSession={
   id:asString(row.session_id),accountId:asString(row.account_id),credentialDigest:digest,
   status:asString(row.session_status) as PersistedSession["status"],
   issuedAt:asDateString(row.issued_at),lastSeenAt:asNullableDateString(row.last_seen_at),
   idleExpiresAt:asDateString(row.idle_expires_at),absoluteExpiresAt:asDateString(row.absolute_expires_at),
   revokedAt:asNullableDateString(row.revoked_at),rotatedFromSessionId:asNullableString(row.rotated_from_session_id),
   activeProfileId:asNullableString(row.active_profile_id),
   profileContextVersion:asNullableString(row.profile_context_version)
  };
  return {session,account:{id:session.accountId,status:asString(row.account_status) as SessionAccount["status"]}};
 }

 async touch(digest:Buffer,lastSeenAt:string,idleExpiresAt:string):Promise<boolean>{
  const rows=await this.query<{auth_touch_session:boolean}>(
   "SELECT public.auth_touch_session($1,$2,$3) AS auth_touch_session",[digest,lastSeenAt,idleExpiresAt]);
  return rows[0]?.auth_touch_session===true;
 }

 async revokeAll(accountId:string,revokedAt:string,reason:string):Promise<void>{
  await this.query("SELECT public.auth_revoke_all_sessions($1,$2,$3)",[accountId,revokedAt,reason]);
 }

 async rotate(oldDigest:Buffer,replacement:PersistedSession,now:string):Promise<boolean>{
  const rows=await this.query("SELECT * FROM public.auth_rotate_session($1,$2,$3,$4,$5,$6)",[
   oldDigest,replacement.id,replacement.credentialDigest,now,replacement.idleExpiresAt,replacement.absoluteExpiresAt
  ]);
  return rows.length===1;
 }
}

export function createAuthRpcRepository(pool:SqlPool):AuthRpcRepository {
 return new AuthRpcRepository(pool,new IdentifierProtector(
  readKey("UNIBUD_IDENTITY_ENCRYPTION_KEY"),readKey("UNIBUD_IDENTITY_LOOKUP_HMAC_KEY")
 ),readKey("UNIBUD_RATE_LIMIT_HMAC_KEY"));
}
