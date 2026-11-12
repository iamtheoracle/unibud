import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 if(!process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim()||!process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim()){
  return NextResponse.json({ok:false,error:"Verification delivery is temporarily unavailable."},{status:503});
 }
 const body=await readJsonObject(request);
 if(!body||(body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"){
  return NextResponse.json({ok:false,error:"Invalid verification request."},{status:400});
 }
 try{
  const deliveryMethod=body.deliveryMethod;
  if((deliveryMethod!==undefined && !["email","sms","whatsapp","rcs"].includes(String(deliveryMethod))) ||
     (body.channel==="email" && deliveryMethod!==undefined && deliveryMethod!=="email") ||
     (body.channel==="phone" && deliveryMethod==="email")) {
   return NextResponse.json({ok:false,error:"Choose a delivery method compatible with your identity."},{status:400});
  }
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.resendVerification({channel:body.channel,deliveryMethod:deliveryMethod as "email"|"sms"|"whatsapp"|"rcs"|undefined,identifier:body.identifier});
  return NextResponse.json(result,{status:202});
 }catch(error){
  if(error instanceof Error&&/email address|E\\.164/.test(error.message)) return NextResponse.json({ok:false,error:"Enter a valid email address or E.164 phone number."},{status:400});
  return routeError(error);
 }
}
