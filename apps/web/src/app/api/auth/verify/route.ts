import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if(typeof body.challengeId!=="string"||typeof body.code!=="string"||
   (body.purpose!=="email_verification"&&body.purpose!=="phone_verification")){
  return NextResponse.json({ok:false,error:"Invalid verification request."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.completeVerification({
   challengeId:body.challengeId,purpose:body.purpose,code:body.code
  });
  return NextResponse.json(result,{status:result.ok?200:400});
 }catch(error){return routeError(error);}
}
