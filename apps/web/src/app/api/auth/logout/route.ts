import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { clearSessionCookie,hasSameOrigin,readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 try{
  if(token){
   const {sessions}=createConfiguredIdentityServices();
   await sessions.revoke(token);
  }
  const response=NextResponse.json({ok:true});
  clearSessionCookie(response);
  return response;
 }catch(error){return routeError(error);}
}
