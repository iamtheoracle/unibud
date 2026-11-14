import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../lib/server/identity/http";
import { getWorkforceSessionGate } from "../../../lib/server/workforce/workforce-session-gate";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false},{status:401});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false},{status:401});
  const workforceGate=await getWorkforceSessionGate(validation.account.id,validation.session.id);
  if(workforceGate!=="not_workforce") return NextResponse.json({ok:false,error:"Workforce identities cannot access personal profile records."},{status:403});
  return NextResponse.json({ok:true,profiles:await profiles.listAccessibleProfiles(validation.account.id)});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  if(error instanceof Error&&/handle|display name/i.test(error.message)) return NextResponse.json({ok:false,error:error.message},{status:400});
  return routeError(error);
 }
}

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if(!["creator","page_community"].includes(String(body.kind))||
   typeof body.handle!=="string"||typeof body.displayName!=="string"||
   (body.visibility!==undefined&&!["private","limited","public"].includes(String(body.visibility)))){
  return NextResponse.json({ok:false,error:"Invalid profile details."},{status:400});
 }
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const workforceGate=await getWorkforceSessionGate(validation.account.id,validation.session.id);
  if(workforceGate!=="not_workforce") return NextResponse.json({ok:false,error:"Workforce identities cannot create personal profiles."},{status:403});
  const profile=await profiles.createOwnedProfile(validation.account.id,{
   kind:body.kind as "creator"|"page_community",
   handle:body.handle,displayName:body.displayName,
   visibility:(body.visibility??"private") as "private"|"limited"|"public"
  });
  return NextResponse.json({ok:true,profile},{status:201});
 }catch(error){return routeError(error);}
}
