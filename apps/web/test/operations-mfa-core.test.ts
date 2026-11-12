import test from "node:test";
import assert from "node:assert/strict";
import {calculateTotpCode,createOperationsMfaCryptographyFromEnvironment,OperationsMfaCryptography,verifyTotpCode} from "../src/lib/server/operations/operations-mfa-core.ts";
const encryptionKey=Buffer.alloc(32,0x31),recoveryKey=Buffer.alloc(32,0x72);
const accountId="10000000-0000-4000-8000-000000000001";

test("TOTP calculation matches RFC 6238 SHA-1 vectors",()=>{
 const secret=Buffer.from("12345678901234567890","ascii");
 assert.equal(calculateTotpCode(secret,59_000,8),"94287082");
 assert.equal(calculateTotpCode(secret,1_111_111_109_000,8),"07081804");
 assert.equal(calculateTotpCode(secret,1_234_567_890_000,8),"89005924");
});
test("TOTP allows adjacent clock step and rejects replay",()=>{
 const secret=Buffer.alloc(20,0x45),now=1_800_000_000_000;
 const code=calculateTotpCode(secret,now),step=Math.floor(now/30_000);
 assert.deepEqual(verifyTotpCode(secret,code,now),{acceptedStep:step});
 const previous=calculateTotpCode(secret,now-30_000),next=calculateTotpCode(secret,now+30_000);
 assert.deepEqual(verifyTotpCode(secret,previous,now),{acceptedStep:step-1});
 assert.deepEqual(verifyTotpCode(secret,next,now),{acceptedStep:step+1});
 assert.equal(verifyTotpCode(secret,code,now,step),null);
 assert.equal(verifyTotpCode(secret,"bad-code",now),null);
 assert.equal(verifyTotpCode(secret,"123456",now+600_000),null);
});
test("TOTP seed is encrypted with account-bound AES-GCM",()=>{
 const crypto=new OperationsMfaCryptography(encryptionKey,recoveryKey),secret=crypto.generateSecret();
 const encoded=crypto.encodeSecret(secret),encrypted=crypto.encryptSecret(accountId,secret);
 assert.equal(crypto.decodeSecret(encoded).equals(secret),true);
 assert.equal(encrypted.ciphertext.includes(encoded),false);
 assert.equal(crypto.decryptSecret(accountId,encrypted).equals(secret),true);
 assert.throws(()=>crypto.decryptSecret("20000000-0000-4000-8000-000000000002",encrypted));
 assert.throws(()=>crypto.decryptSecret(accountId,{ciphertext:encrypted.ciphertext.slice(0,-2)+"aa"}));
});
test("provisioning URI sets issuer and TOTP parameters",()=>{
 const crypto=new OperationsMfaCryptography(encryptionKey,recoveryKey);
 const uri=new URL(crypto.provisioningUri(accountId,crypto.encodeSecret(crypto.generateSecret())));
 assert.equal(uri.protocol,"otpauth:");assert.equal(uri.hostname,"totp");
 assert.equal(uri.searchParams.get("issuer"),"UNIBUD Operations");
 assert.equal(uri.searchParams.get("algorithm"),"SHA1");
 assert.equal(uri.searchParams.get("digits"),"6");assert.equal(uri.searchParams.get("period"),"30");
});
test("recovery codes are unique, account-bound and digest-verifiable",()=>{
 const crypto=new OperationsMfaCryptography(encryptionKey,recoveryKey),codes=crypto.generateRecoveryCodes();
 assert.equal(codes.length,10);assert.equal(new Set(codes).size,10);
 const digest=crypto.digestRecoveryCode(accountId,codes[0]);
 assert.equal(crypto.recoveryCodeMatches(digest,accountId,codes[0]),true);
 assert.equal(crypto.recoveryCodeMatches(digest,accountId,codes[1]),false);
 assert.equal(crypto.recoveryCodeMatches(digest,"20000000-0000-4000-8000-000000000002",codes[0]),false);
 assert.equal(crypto.recoveryCodeMatches(digest,accountId,"invalid"),false);
});
test("weak keys and malformed enrollment parameters are rejected",()=>{
 assert.throws(()=>new OperationsMfaCryptography(Buffer.alloc(16),recoveryKey));
 const crypto=new OperationsMfaCryptography(encryptionKey,recoveryKey);
 assert.throws(()=>crypto.decodeSecret("not-a-secret"));
 assert.throws(()=>crypto.generateRecoveryCodes(3));
 assert.throws(()=>crypto.provisioningUri(accountId,"bad"));
});

test("configured MFA cryptography requires distinct exact-length encryption and recovery keys",()=>{
 const previousEncryption=process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY;
 const previousRecovery=process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY;
 try{
  process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY=encryptionKey.toString("hex");
  process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY=recoveryKey.toString("hex");
  const crypto=createOperationsMfaCryptographyFromEnvironment();
  const secret=crypto.generateSecret();
  assert.equal(crypto.decryptSecret(accountId,crypto.encryptSecret(accountId,secret)).equals(secret),true);
  delete process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY;
  assert.throws(()=>createOperationsMfaCryptographyFromEnvironment());
 }finally{
  if(previousEncryption===undefined) delete process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY;
  else process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY=previousEncryption;
  if(previousRecovery===undefined) delete process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY;
  else process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY=previousRecovery;
 }
});


test("encryption key rotation reads legacy v1 and overlapping v2 keys while writing only with the active key",()=>{
 const legacy=Buffer.alloc(32,0x11),oldKey=Buffer.alloc(32,0x22),newKey=Buffer.alloc(32,0x33),recovery=Buffer.alloc(32,0x44);
 const original=new OperationsMfaCryptography(legacy,recovery);
 const secret=original.generateSecret();
 const legacyEnvelope=original.encryptSecret(accountId,secret);
 const rotating=new OperationsMfaCryptography(legacy,recovery,{
  activeKeyId:"2026-11-new",
  keys:[{id:"2026-11-old",key:oldKey},{id:"2026-11-new",key:newKey}]
 });
 assert.equal(rotating.decryptSecret(accountId,legacyEnvelope).equals(secret),true);
 const rotatedEnvelope=rotating.encryptSecret(accountId,secret);
 assert.match(rotatedEnvelope.ciphertext,/^v2\.2026-11-new\./);
 assert.equal(rotating.decryptSecret(accountId,rotatedEnvelope).equals(secret),true);
 const oldWriter=new OperationsMfaCryptography(legacy,recovery,{
  activeKeyId:"2026-11-old",keys:[{id:"2026-11-old",key:oldKey},{id:"2026-11-new",key:newKey}]
 });
 const oldEnvelope=oldWriter.encryptSecret(accountId,secret);
 assert.equal(rotating.decryptSecret(accountId,oldEnvelope).equals(secret),true);
 assert.throws(()=>new OperationsMfaCryptography(legacy,recovery,{
  activeKeyId:"2026-11-new",keys:[{id:"2026-11-new",key:newKey}]
 }).decryptSecret(accountId,oldEnvelope));
});

test("configured encryption keyring validates key IDs, uniqueness, active key and overlap bound",()=>{
 const legacy=Buffer.alloc(32,0x11),recovery=Buffer.alloc(32,0x44),a=Buffer.alloc(32,0x22),b=Buffer.alloc(32,0x33),c=Buffer.alloc(32,0x55);
 assert.throws(()=>new OperationsMfaCryptography(legacy,recovery,{activeKeyId:"missing",keys:[{id:"known",key:a}]}));
 assert.throws(()=>new OperationsMfaCryptography(legacy,recovery,{activeKeyId:"same",keys:[{id:"same",key:a},{id:"same",key:b}]}));
 assert.throws(()=>new OperationsMfaCryptography(legacy,recovery,{activeKeyId:"a",keys:[{id:"a",key:a},{id:"b",key:b},{id:"c",key:c}]}));
 assert.throws(()=>new OperationsMfaCryptography(legacy,recovery,{activeKeyId:"bad/id",keys:[{id:"bad/id",key:a}]}));
});

test("environment keyring enables versioned encryption without losing legacy v1 decryption",()=>{
 const names=["UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY","UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY","UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON"];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try{
  const legacy=Buffer.alloc(32,0x11),recovery=Buffer.alloc(32,0x44),active=Buffer.alloc(32,0x33),old=Buffer.alloc(32,0x22);
  process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY=legacy.toString("hex");
  process.env.UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY=recovery.toString("hex");
  process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON=JSON.stringify({
   activeKeyId:"rotation-2026-11",keys:[
    {id:"legacy-overlap",keyHex:old.toString("hex")},
    {id:"rotation-2026-11",keyHex:active.toString("hex")}
   ]
  });
  const configured=createOperationsMfaCryptographyFromEnvironment();
  const secret=configured.generateSecret();
  assert.match(configured.encryptSecret(accountId,secret).ciphertext,/^v2\.rotation-2026-11\./);
  delete process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON;
  const legacyConfigured=createOperationsMfaCryptographyFromEnvironment();
  const legacyEnvelope=legacyConfigured.encryptSecret(accountId,secret);
  assert.equal(configured.decryptSecret(accountId,legacyEnvelope).equals(secret),true);
  process.env.UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON=JSON.stringify({
   activeKeyId:"missing",keys:[{id:"known",keyHex:active.toString("hex")}]
  });
  assert.throws(()=>createOperationsMfaCryptographyFromEnvironment());
 }finally{
  for(const name of names){const value=previous[name];if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});
