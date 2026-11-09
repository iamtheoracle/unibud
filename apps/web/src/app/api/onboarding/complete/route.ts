import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if(typeof body.handle!=="string"||typeof body.displayName!=="string"||
   body.acceptTerms!==true||body.acceptPrivacy!==true){
  return NextResponse.json({ok:false,error:"Complete the required profile and policy steps."},{status:400});
 }
 const termsVersion=process.env.UNIBUD_TERMS_VERSION?.trim()??"terms-draft-2026-11";
 const privacyVersion=process.env.UNIBUD_PRIVACY_VERSION?.trim()??"privacy-draft-2026-11";
 if(process.env.NODE_ENV==="production"&&(/draft/i.test(termsVersion)||/draft/i.test(privacyVersion)||
   !process.env.UNIBUD_TERMS_VERSION?.trim()||!process.env.UNIBUD_PRIVACY_VERSION?.trim())){
  return NextResponse.json({ok:false,error:"Account setup is temporarily unavailable while the final legal policies are reviewed."},{status:503});
 }
 try{
  const {onboarding}=createConfiguredIdentityServices();
  const result=await onboarding.complete({
   sessionToken:token,handle:body.handle,displayName:body.displayName,
   termsVersion,privacyVersion,
   acceptTerms:true,acceptPrivacy:true
  });
  return NextResponse.json(result,{status:result.ok?201:401});
 }catch(error){
  if(error instanceof Error&&/handle|display name|profile/i.test(error.message)) return NextResponse.json({ok:false,error:error.message},{status:400});
  return routeError(error);
 }
}
