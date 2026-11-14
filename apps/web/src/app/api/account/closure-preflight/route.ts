import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const workforceGate=await getWorkforceSessionGate(validation.account.id,validation.session.id);
  if(workforceGate!=="not_workforce") return NextResponse.json({ok:false,error:"Workforce identities cannot access personal account closure records."},{status:403});
  return NextResponse.json({ok:true,preflight:await profiles.getAccountClosurePreflight(validation.account.id)});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Account access denied."},{status:403});
  return routeError(error);
 }
}
