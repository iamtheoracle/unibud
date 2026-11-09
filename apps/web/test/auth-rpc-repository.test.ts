import test from "node:test";
import assert from "node:assert/strict";
import { IdentifierProtector } from "../src/lib/server/auth/auth-rpc-repository-core.ts";

test("identifier protection encrypts raw identifiers and produces stable keyed lookup digests",()=>{
 const protector=new IdentifierProtector(Buffer.alloc(32,0x11),Buffer.alloc(32,0x22));
 const first=protector.protect("person@example.com","email");
 const second=protector.protect("person@example.com","email");
 assert.notDeepEqual(first.ciphertext,second.ciphertext);
 assert.equal(first.lookupDigest.length,32);
 assert.deepEqual(first.lookupDigest,second.lookupDigest);
 assert.equal(first.ciphertext.includes(Buffer.from("person@example.com")),false);
 assert.notDeepEqual(first.lookupDigest,protector.digest("other@example.com","email"));
 assert.notDeepEqual(first.lookupDigest,protector.digest("person@example.com","phone"));
});
test("identifier protection rejects weak encryption or lookup keys",()=>{
 assert.throws(()=>new IdentifierProtector(Buffer.alloc(31),Buffer.alloc(32)));
 assert.throws(()=>new IdentifierProtector(Buffer.alloc(32),Buffer.alloc(31)));
});
