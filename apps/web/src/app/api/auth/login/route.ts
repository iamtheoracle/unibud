import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError,setSessionCookie } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if((body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"||typeof body.password!=="string"){
  return NextResponse.json({ok:false,error:"Invalid sign-in request."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.login({channel:body.channel,identifier:body.identifier,password:body.password});
  if(result.state!=="authenticated") return NextResponse.json({ok:false,error:"The sign-in details were not accepted."},{status:401});
  const response=NextResponse.json({ok:true,accountId:result.accountId});
  setSessionCookie(response,result.token,result.expiresAt);
  return response;
 }catch(error){
  if(error instanceof Error && /email address|E\.164/.test(error.message)){
   return NextResponse.json({ok:false,error:"The sign-in details were not accepted."},{status:401});
  }
  return routeError(error);
 }
}
