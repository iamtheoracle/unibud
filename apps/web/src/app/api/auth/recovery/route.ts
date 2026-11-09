import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,routeError } from "../../../../lib/server/identity/http";

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if((body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"){
  return NextResponse.json({ok:false,error:"Invalid recovery request."},{status:400});
 }
 try{
  const {authentication}=createConfiguredIdentityServices();
  const result=await authentication.requestRecovery({channel:body.channel,identifier:body.identifier});
  return NextResponse.json(result,{status:202});
 }catch(error){return routeError(error);}
}
