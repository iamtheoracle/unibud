import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if(typeof body.challengeId!=="string"||typeof body.code!=="string"||typeof body.newPassword!=="string"){
  return NextResponse.json({ok:false,error:"Invalid password recovery request."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.completeRecovery({
   challengeId:body.challengeId,code:body.code,newPassword:body.newPassword
  });
  return NextResponse.json(result,{status:result.ok?200:400});
 }catch(error){
  if(error instanceof Error && /password length policy/.test(error.message)){
   return NextResponse.json({ok:false,error:error.message},{status:400});
  }
  return routeError(error);
 }
}
