import "server-only";

import { createHash } from "node:crypto";
import type { SqlClient, SqlPool } from "../database/account-context-core.ts";
import type { AuthRateLimiter } from "./authentication-core.ts";
import type { VerificationRateLimiter } from "./verification-core.ts";

export class AuthenticationRateLimitError extends Error {
 constructor(){super("Too many attempts. Please wait before trying again.");this.name="AuthenticationRateLimitError";}
}
export class PostgresAuthRateLimiter implements AuthRateLimiter,VerificationRateLimiter {
 private readonly pool:SqlPool;
 constructor(pool:SqlPool){this.pool=pool;}

 private async consume(digest:Buffer,limit:number,windowSeconds:number,now:string):Promise<boolean>{
  const client:SqlClient=await this.pool.connect();
  try{
   const result=await client.query<{auth_consume_rate_limit:boolean}>(
    "SELECT public.auth_consume_rate_limit($1,$2,$3,$4) AS auth_consume_rate_limit",
    [digest,limit,windowSeconds,now]
   );
   return result.rows[0]?.auth_consume_rate_limit===true;
  }finally{client.release();}
 }

 async assertAllowed(input:{action:"register"|"login"|"recovery";identifierDigest:string;now:string}):Promise<void>{
  if(!/^[0-9a-f]{64}$/i.test(input.identifierDigest)) throw new Error("Invalid rate-limit identifier digest.");
  const limits={
   register:{count:5,window:3600},
   login:{count:10,window:900},
   recovery:{count:5,window:3600}
  } as const;
  const policy=limits[input.action];
  const bucket=createHash("sha256").update("auth:"+input.action+":"+input.identifierDigest,"utf8").digest();
  if(!await this.consume(bucket,policy.count,policy.window,input.now)) throw new AuthenticationRateLimitError();
 }

 async assertVerificationAllowed(input:{
  accountId:string;channel:"email"|"phone";purpose:"email_verification"|"phone_verification"|"password_reset";
  targetDigest:Buffer;now:string;
 }):Promise<void>{
  const bucket=createHash("sha256")
   .update("verification:"+input.accountId+":"+input.channel+":"+input.purpose+":","utf8")
   .update(input.targetDigest).digest();
  if(!await this.consume(bucket,5,900,input.now)) throw new AuthenticationRateLimitError();
 }

 // The verification service uses the same method name but a distinct input contract.
 async assertAllowedVerification(input:{
  accountId:string;channel:"email"|"phone";purpose:"email_verification"|"phone_verification"|"password_reset";
  targetDigest:Buffer;now:string;
 }):Promise<void>{
  return this.assertVerificationAllowed(input);
 }
}
