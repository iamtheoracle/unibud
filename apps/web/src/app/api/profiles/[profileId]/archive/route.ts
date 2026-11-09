import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readSessionCookie,routeError } from "../../../../../lib/server/identity/http";

type Context = { params: Promise<{ profileId: string }> };

export async function POST(request:NextRequest,context:Context){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {profileId}=await context.params;
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const result=await profiles.archiveOwnedProfile(validation.account.id,profileId);
  return NextResponse.json({ok:true,profileLifecycleUpdated:result});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  if(error instanceof Error && /active owned profile|personal identity|cannot be archived|cannot be restored/i.test(error.message)) return NextResponse.json({ok:false,error:error.message},{status:409});
  return routeError(error);
 }
}
