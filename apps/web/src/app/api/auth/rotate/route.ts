import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { clearSessionCookie,hasSameOrigin,readSessionCookie,routeError,setSessionCookie } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {sessions}=createConfiguredIdentityServices();
  const rotated=await sessions.rotate(token);
  if(!rotated){
   const response=NextResponse.json({ok:false,error:"Session expired. Sign in again."},{status:401});
   clearSessionCookie(response);
   return response;
  }
  const response=NextResponse.json({
   ok:true,sessionId:rotated.session.id,
   activeProfileId:rotated.session.activeProfileId,
   profileContextVersion:rotated.session.profileContextVersion
  });
  setSessionCookie(response,rotated.token,rotated.session.absoluteExpiresAt);
  return response;
 }catch(error){return routeError(error);}
}
