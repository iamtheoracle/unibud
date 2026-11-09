import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 const profileId=new URL(request.url).searchParams.get("profileId");
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 if(!profileId) return NextResponse.json({ok:false,error:"A profile ID is required."},{status:400});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const access=await profiles.listDelegatedAccess(validation.account.id,profileId);
  return NextResponse.json({ok:true,delegatedAccess:access});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  return routeError(error);
 }
}

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body||typeof body.profileId!=="string"||typeof body.delegateAccountId!=="string"||
   typeof body.role!=="string"||!["admin","moderator","editor","member","seller","provider","professional","student","staff","operator","viewer"].includes(body.role)||typeof body.canSwitchToProfile!=="boolean"){
  return NextResponse.json({ok:false,error:"Invalid delegated access request."},{status:400});
 }
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const access=await profiles.grantDelegatedAccess(validation.account.id,{
   profileId:body.profileId,delegateAccountId:body.delegateAccountId,
   role:body.role as "admin"|"moderator"|"editor"|"member"|"seller"|"provider"|"professional"|"student"|"staff"|"operator"|"viewer",
   canSwitchToProfile:body.canSwitchToProfile
  });
  return NextResponse.json({ok:true,access},{status:201});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  return routeError(error);
 }
}

export async function DELETE(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body||typeof body.profileId!=="string"||typeof body.delegateAccountId!=="string"){
  return NextResponse.json({ok:false,error:"Invalid delegated access request."},{status:400});
 }
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const revoked=await profiles.revokeDelegatedAccess(validation.account.id,body.profileId,body.delegateAccountId);
  return NextResponse.json({ok:revoked},{status:revoked?200:404});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  return routeError(error);
 }
}
