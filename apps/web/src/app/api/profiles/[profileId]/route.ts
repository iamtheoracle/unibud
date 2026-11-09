import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../../lib/server/identity/http";

type Context = { params: Promise<{ profileId: string }> };

export async function PATCH(request:NextRequest,context:Context){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body||typeof body.displayName!=="string"||typeof body.handle!=="string"||
   typeof body.visibility!=="string"||!["private","limited","public"].includes(body.visibility)){
  return NextResponse.json({ok:false,error:"Invalid profile details."},{status:400});
 }
 try{
  const {profileId}=await context.params;
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const profile=await profiles.updateOwnedProfile(validation.account.id,{
   profileId,displayName:body.displayName,handle:body.handle,
   visibility:body.visibility as "private"|"limited"|"public"
  });
  return NextResponse.json({ok:true,profile});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});
  if(error instanceof Error&&/handle|display name|visibility/i.test(error.message))
   return NextResponse.json({ok:false,error:error.message},{status:400});
  return routeError(error);
 }
}
