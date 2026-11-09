import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthRateLimitExceededError } from "./auth/auth-rpc-repository-core.ts";

export const SESSION_COOKIE_NAME = process.env.NODE_ENV === "production"
  ? "__Host-unibud_session"
  : "unibud_session";

export async function readSessionToken():Promise<string|null>{
 const store=await cookies();
 return store.get(SESSION_COOKIE_NAME)?.value??null;
}

export function attachSessionCookie(response:NextResponse,token:string):NextResponse{
 response.cookies.set(SESSION_COOKIE_NAME,token,{
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
  sameSite:"lax",
  path:"/",
  maxAge:60*60*24*30
 });
 return response;
}

export function clearSessionCookie(response:NextResponse):NextResponse{
 response.cookies.set(SESSION_COOKIE_NAME,"",{
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
  sameSite:"lax",
  path:"/",
  maxAge:0
 });
 return response;
}

export function authErrorResponse(error:unknown):NextResponse{
 if(error instanceof AuthRateLimitExceededError){
  return NextResponse.json({error:"Too many attempts. Please wait before trying again."},{status:429});
 }
 if(error instanceof TypeError || (error instanceof Error && /invalid|must be|requires|valid/i.test(error.message))){
  return NextResponse.json({error:"The submitted information is invalid."},{status:400});
 }
 // Never return SQL, provider, credential, or recipient details to the client.
 return NextResponse.json({error:"Authentication service is temporarily unavailable."},{status:503});
}

export function isObject(value:unknown):value is Record<string,unknown>{
 return typeof value==="object"&&value!==null&&!Array.isArray(value);
}
