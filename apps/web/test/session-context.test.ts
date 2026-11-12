import test from "node:test";
import assert from "node:assert/strict";
import {
  createSignedSessionContext,
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction,
  type SignedSessionContext
} from "../src/lib/server/database/session-context-core.ts";
import type { SqlClient, SqlPool } from "../src/lib/server/database/account-context-core.ts";

const accountKey = Buffer.alloc(32, 0x6b);
const sessionKey = Buffer.alloc(32, 0x7c);
const accountA = "10000000-0000-4000-8000-000000000001";
const accountB = "10000000-0000-4000-8000-000000000002";
const sessionA = "20000000-0000-4000-8000-000000000001";
const sessionB = "20000000-0000-4000-8000-000000000002";
const nonce = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

test("session context binds version, account, persisted session, expiry and nonce", () => {
  const context = createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_000, 60, nonce);
  assert.equal(context.expiryEpoch, "1800000060");
  assert.equal(context.signature.length, 64);
  assert.equal(context.sessionSignature.length, 64);
  assert.notEqual(context.signature, context.sessionSignature);
});

test("changing account, session, expiry or nonce changes the session assertion", () => {
  const base = createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_000, 60, nonce);
  const variants = [
    createSignedSessionContext(accountB, sessionA, accountKey, sessionKey, 1_800_000_000, 60, nonce),
    createSignedSessionContext(accountA, sessionB, accountKey, sessionKey, 1_800_000_000, 60, nonce),
    createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_001, 60, nonce),
    createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_000, 60, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")
  ];
  for (const variant of variants) assert.notEqual(variant.sessionSignature, base.sessionSignature);
});

test("rejects malformed account and session identifiers and weak keys", () => {
  assert.throws(() => createSignedSessionContext("account-a", sessionA, accountKey, sessionKey));
  assert.throws(() => createSignedSessionContext(accountA, "session-a", accountKey, sessionKey));
  assert.throws(() => createSignedSessionContext(accountA, sessionA, accountKey, Buffer.alloc(31)));
});

test("sets account and session claims transaction-locally and commits", async () => {
  const context = createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_000, 60, nonce);
  const calls: Array<{sql:string;values?:readonly unknown[]}> = [];
  let released = false;
  const client: SqlClient = {
    async query(sql, values) { calls.push({sql,values}); return {rows:[]}; },
    release() { released = true; }
  };
  const pool: SqlPool = { async connect() { return client; } };
  const result = await withSignedSessionTransaction(pool, context, async () => "ok");
  assert.equal(result, "ok");
  assert.equal(calls[0].sql, "BEGIN");
  assert.match(calls[1].sql, /set_config\('unibud\.session_id', \$5, true\)/);
  assert.match(calls[1].sql, /set_config\('unibud\.session_context_signature', \$6, true\)/);
  assert.deepEqual(calls[1].values, [
    accountA, context.expiryEpoch, nonce, context.signature, sessionA, context.sessionSignature
  ]);
  assert.equal(calls[2].sql, "COMMIT");
  assert.equal(released, true);
});

test("rolls back and releases the connection after a failed operation", async () => {
  const context: SignedSessionContext = createSignedSessionContext(accountA, sessionA, accountKey, sessionKey, 1_800_000_000, 60, nonce);
  const calls: string[] = [];
  let released = false;
  const client: SqlClient = {
    async query(sql) { calls.push(sql); return {rows:[]}; },
    release() { released = true; }
  };
  const pool: SqlPool = { async connect() { return client; } };
  await assert.rejects(() => withSignedSessionTransaction(pool, context, async () => {
    throw new Error("synthetic failure");
  }), /synthetic failure/);
  assert.equal(calls[0], "BEGIN");
  assert.equal(calls[2], "ROLLBACK");
  assert.equal(released, true);
});


test("environment signing requires distinct account and session secrets", () => {
  const previousAccount = process.env.UNIBUD_DB_CONTEXT_HMAC_KEY;
  const previousSession = process.env.UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY;
  try {
    process.env.UNIBUD_DB_CONTEXT_HMAC_KEY = Buffer.alloc(32, 0x11).toString("hex");
    process.env.UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY = Buffer.alloc(32, 0x22).toString("hex");
    const context = createSignedSessionContextFromEnvironment(accountA, sessionA, 1_800_000_000, 60);
    assert.equal(context.signature.length, 64);
    assert.equal(context.sessionSignature.length, 64);
    delete process.env.UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY;
    assert.throws(() => createSignedSessionContextFromEnvironment(accountA, sessionA));
  } finally {
    if (previousAccount === undefined) delete process.env.UNIBUD_DB_CONTEXT_HMAC_KEY;
    else process.env.UNIBUD_DB_CONTEXT_HMAC_KEY = previousAccount;
    if (previousSession === undefined) delete process.env.UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY;
    else process.env.UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY = previousSession;
  }
});
