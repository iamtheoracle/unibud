import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 if(!process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim()||!process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim()) return NextResponse.json({ok:false,error:"Verification delivery is temporarily unavailable."},{status:503});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if((body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string" ||
   (body.deliveryMethod!==undefined && !["email","sms","whatsapp","rcs"].includes(String(body.deliveryMethod))) ||
   (body.channel==="email" && body.deliveryMethod!==undefined && body.deliveryMethod!=="email") ||
   (body.channel==="phone" && body.deliveryMethod==="email")){
  return NextResponse.json({ok:false,error:"Invalid recovery request."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.requestRecovery({channel:body.channel,deliveryMethod:body.deliveryMethod as "email"|"sms"|"whatsapp"|"rcs"|undefined,identifier:body.identifier});
  return NextResponse.json(result,{status:202});
 }catch(error){
  if(error instanceof Error&&/email address|E\\.164/.test(error.message)) return NextResponse.json({ok:false,error:"Enter a valid email address or E.164 phone number."},{status:400});
  return routeError(error);
 }
}
