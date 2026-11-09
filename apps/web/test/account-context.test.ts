import test from "node:test";
import assert from "node:assert/strict";
import {
  createSignedAccountContext,
  signaturesMatch,
  withSignedAccountTransaction,
  type SqlClient,
  type SqlPool
} from "../src/lib/server/database/account-context.ts";

const key = Buffer.alloc(32, 0x5a);
const accountA = "10000000-0000-4000-8000-000000000001";

test("creates a short-lived signed context bound to account, expiry and nonce", () => {
  const context = createSignedAccountContext(accountA, key, 1_800_000_000, 60,
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  assert.equal(context.expiryEpoch, "1800000060");
  assert.equal(context.signature.length, 64);
  assert.ok(signaturesMatch(context.signature, createSignedAccountContext(
    accountA, key, 1_800_000_000, 60,
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
  ).signature));
});

test("rejects invalid account IDs, weak keys and excessive context lifetimes", () => {
  assert.throws(() => createSignedAccountContext("account-a", key));
  assert.throws(() => createSignedAccountContext(accountA, Buffer.alloc(31)));
  assert.throws(() => createSignedAccountContext(accountA, key, 1_800_000_000, 121));
});

test("signature changes when account or nonce changes", () => {
  const a = createSignedAccountContext(accountA, key, 1_800_000_000, 60,
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  const b = createSignedAccountContext("10000000-0000-4000-8000-000000000002", key,
    1_800_000_000, 60, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  const c = createSignedAccountContext(accountA, key, 1_800_000_000, 60,
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
  assert.equal(signaturesMatch(a.signature, b.signature), false);
  assert.equal(signaturesMatch(a.signature, c.signature), false);
});

test("transaction context is local, commits on success and releases the client", async () => {
  const calls: Array<{ sql: string; values?: readonly unknown[] }> = [];
  let released = false;
  const client: SqlClient = {
    async query(sql, values) { calls.push({ sql, values }); return { rows: [] }; },
    release() { released = true; }
  };
  const pool: SqlPool = { async connect() { return client; } };
  const context = createSignedAccountContext(accountA, key, 1_800_000_000, 60,
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  const result = await withSignedAccountTransaction(pool, context, async () => "ok");
  assert.equal(result, "ok");
  assert.equal(calls[0].sql, "BEGIN");
  assert.match(calls[1].sql, /set_config\('unibud\.account_id', \$1, true\)/);
  assert.deepEqual(calls[1].values, [context.accountId, context.expiryEpoch, context.nonce, context.signature]);
  assert.equal(calls[2].sql, "COMMIT");
  assert.equal(released, true);
});

test("transaction rolls back and releases on operation failure", async () => {
  const calls: string[] = [];
  let released = false;
  const client: SqlClient = {
    async query(sql) { calls.push(sql); return { rows: [] }; },
    release() { released = true; }
  };
  const pool: SqlPool = { async connect() { return client; } };
  const context = createSignedAccountContext(accountA, key, 1_800_000_000, 60,
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  await assert.rejects(() => withSignedAccountTransaction(pool, context, async () => {
    throw new Error("synthetic failure");
  }), /synthetic failure/);
  assert.deepEqual(calls, ["BEGIN", "SELECT\n        set_config('unibud.account_id', $1, true),\n        set_config('unibud.context_expiry', $2, true),\n        set_config('unibud.context_nonce', $3, true),\n        set_config('unibud.context_signature', $4, true)", "ROLLBACK"]);
  assert.equal(released, true);
});
