import "server-only";

import type { VerificationDelivery } from "./verification-core.ts";

export type VerificationFetch = (input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;

export class HttpVerificationDelivery implements VerificationDelivery {
 private readonly endpoint:URL;
 private readonly token:string;
 private readonly fetcher:VerificationFetch;
 constructor(endpoint:string,token:string,fetcher:VerificationFetch=fetch){
  let parsed:URL;
  try{parsed=new URL(endpoint);}catch{throw new Error("A valid verification delivery URL is required.");}
  const localHost=["localhost","127.0.0.1","::1"].includes(parsed.hostname);
  if(parsed.protocol!=="https:" && !(process.env.NODE_ENV!=="production"&&parsed.protocol==="http:"&&localHost)){
   throw new Error("Verification delivery must use HTTPS outside local development.");
  }
  if(!token.trim()) throw new Error("Verification delivery credential is not configured.");
  this.endpoint=parsed;this.token=token;this.fetcher=fetcher;
 }

 async deliver(input:Parameters<VerificationDelivery["deliver"]>[0]):Promise<void>{
  let response:Response;
  try{
   response=await this.fetcher(this.endpoint,{
    method:"POST",
    headers:{
     "authorization":"Bearer "+this.token,
     "content-type":"application/json",
     "idempotency-key":input.challengeId
    },
    body:JSON.stringify({
     challengeId:input.challengeId,
     channel:input.channel,
     destination:input.destination,
     code:input.code,
     purpose:input.purpose,
     expiresAt:input.expiresAt
    }),
    signal:AbortSignal.timeout(8000),
    cache:"no-store"
   });
  }catch{
   throw new Error("Verification delivery service could not be reached.");
  }
  if(!response.ok) throw new Error("Verification delivery service rejected the request.");
 }
}

export function createVerificationDeliveryFromEnvironment():HttpVerificationDelivery {
 const endpoint=process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim()??"";
 const token=process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim()??"";
 return new HttpVerificationDelivery(endpoint,token);
}
