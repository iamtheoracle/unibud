import test from "node:test";
import assert from "node:assert/strict";
import {
  SessionService,
  type PersistedSession,
  type SessionAccount,
  type SessionRepository
} from "../src/lib/server/auth/session-core.ts";

class MemorySessions implements SessionRepository {
  rows = new Map<string, PersistedSession>();
  account: SessionAccount = { id: "10000000-0000-4000-8000-000000000001", status: "active" };
  async create(s: PersistedSession) { this.rows.set(s.id, s); }
  async findByCredentialDigest(d: Buffer) {
    const s = [...this.rows.values()].find(x => x.credentialDigest.equals(d));
    return s ? { session: s, account: this.account } : null;
  }
  async touch(digest: Buffer, last: string, idle: string) {
    const s=[...this.rows.values()].find(x=>x.credentialDigest.equals(digest)); if (!s || s.status!=="active") return false;
    s.lastSeenAt=last; s.idleExpiresAt=idle; return true;
  }
  async revoke(digest: Buffer, at: string) {
    const s=[...this.rows.values()].find(x=>x.credentialDigest.equals(digest)); if(s){s.status="revoked";s.revokedAt=at;}
  }
  async revokeAll(accountId: string, at: string) {
    for(const s of this.rows.values()) if(s.accountId===accountId && s.status==="active"){s.status="revoked";s.revokedAt=at;}
  }
  async rotate(oldDigest: Buffer, replacement: PersistedSession, at: string) {
    const old=[...this.rows.values()].find(x=>x.credentialDigest.equals(oldDigest)); if(!old || old.status!=="active") return false;
    old.status="revoked"; old.revokedAt=at; this.rows.set(replacement.id,replacement); return true;
  }
}

const fixed = new Date("2026-11-09T06:00:00.000Z");

test("issues opaque high-entropy session tokens and persists only SHA-256 digests", async () => {
  const repo=new MemorySessions(), service=new SessionService(repo);
  const {token,session}=await service.issue(repo.account,fixed);
  assert.ok(token.length>=40);
  assert.equal(session.credentialDigest.length,32);
  assert.equal(JSON.stringify(session).includes(token),false);
  assert.equal((await service.validate(token,fixed)).valid,true);
});

test("refuses pending and suspended accounts", async () => {
  const repo=new MemorySessions(), service=new SessionService(repo);
  await assert.rejects(()=>service.issue({...repo.account,status:"pending_verification"},fixed));
  await assert.rejects(()=>service.issue({...repo.account,status:"suspended"},fixed));
});

test("rotation revokes old credential and issues replacement within absolute lifetime", async () => {
  const repo=new MemorySessions(), service=new SessionService(repo);
  const first=await service.issue(repo.account,fixed);
  const second=await service.rotate(first.token,new Date(fixed.getTime()+1000));
  assert.ok(second);
  assert.equal((await service.validate(first.token,new Date(fixed.getTime()+1000))).valid,false);
  assert.equal((await service.validate(second.token,new Date(fixed.getTime()+1000))).valid,true);
  assert.equal(second.session.rotatedFromSessionId,first.session.id);
  assert.equal(second.session.absoluteExpiresAt,first.session.absoluteExpiresAt);
});

test("logout revokes a session and account-wide revocation closes every active session", async () => {
  const repo=new MemorySessions(), service=new SessionService(repo);
  const a=await service.issue(repo.account,fixed), b=await service.issue(repo.account,fixed);
  assert.equal(await service.revoke(a.token,fixed),true);
  await service.revokeAll(repo.account.id,fixed);
  assert.equal((await service.validate(a.token,fixed)).valid,false);
  assert.equal((await service.validate(b.token,fixed)).valid,false);
});

test("absolute expiry and idle expiry are hard limits", async () => {
  const repo=new MemorySessions(), service=new SessionService(repo,{idleLifetimeSeconds:60,absoluteLifetimeSeconds:120});
  const {token}=await service.issue(repo.account,fixed);
  assert.equal((await service.validate(token,new Date(fixed.getTime()+60_000))).valid,false);
  const other=await service.issue(repo.account,fixed);
  assert.equal((await service.validate(other.token,new Date(fixed.getTime()+120_000))).valid,false);
});
