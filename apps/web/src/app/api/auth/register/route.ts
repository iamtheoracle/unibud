import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 if(!process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim()||!process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim()) return NextResponse.json({ok:false,error:"Verification delivery is temporarily unavailable."},{status:503});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 const channel=body.channel;
 const identifier=body.identifier;
 const password=body.password;
 if((channel!=="email"&&channel!=="phone")||typeof identifier!=="string"||typeof password!=="string"){
  return NextResponse.json({ok:false,error:"Provide an email or E.164 phone number and password."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.register({channel,identifier,password});
  return NextResponse.json(result,{status:202});
 }catch(error){
  if(error instanceof Error && /password length policy|email address|E\.164/.test(error.message)){
   return NextResponse.json({ok:false,error:error.message},{status:400});
  }
  return routeError(error);
 }
}
