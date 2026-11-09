import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false},{status:401});
 try{
  const {sessions}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false},{status:401});
  return NextResponse.json({
   ok:true,
   accountId:validation.account.id,
   sessionId:validation.session.id,
   activeProfileId:validation.session.activeProfileId,
   profileContextVersion:validation.session.profileContextVersion
  });
 }catch(error){return routeError(error);}
}
