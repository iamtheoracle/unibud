import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../../lib/server/identity/http";
import { getWorkforceSessionGate } from "../../../../lib/server/workforce/workforce-session-gate";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body||typeof body.profileId!=="string") return NextResponse.json({ok:false,error:"A profile ID is required."},{status:400});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const workforceGate=await getWorkforceSessionGate(validation.account.id,validation.session.id);
  if(workforceGate!=="not_workforce") return NextResponse.json({ok:false,error:"Workforce identities cannot switch personal profiles."},{status:403});
  const result=await profiles.switchProfile(validation.account.id,validation.session.id,body.profileId);
  return NextResponse.json({ok:true,...result});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  return routeError(error);
 }
}
