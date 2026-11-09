import {NextRequest,NextResponse} from "next/server";
import {createConfiguredIdentityServices} from "../../../../../lib/server/identity/identity-runtime";
import {ProfileAccessDeniedError} from "../../../../../lib/server/profiles/profile-service-core";
import {hasSameOrigin,readJsonObject,readSessionCookie,routeError} from "../../../../../lib/server/identity/http";
type Context={params:Promise<{profileId:string}>};

export async function GET(request:NextRequest,context:Context){
 const token=readSessionCookie(request);if(!token)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {profileId}=await context.params;const {sessions,profiles}=createConfiguredIdentityServices();
  const session=await sessions.validate(token);if(!session.valid)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  return NextResponse.json({ok:true,preflight:await profiles.getOwnershipTransferPreflight(session.account.id,profileId)});
 }catch(error){if(error instanceof ProfileAccessDeniedError)return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});return routeError(error);}
}

export async function POST(request:NextRequest,context:Context){
 if(!hasSameOrigin(request))return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body||typeof body.recipientHandle!=="string"||(body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"||typeof body.password!=="string")
  return NextResponse.json({ok:false,error:"A recipient UNIBUD handle and fresh account verification are required."},{status:400});
 const token=readSessionCookie(request);if(!token)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {profileId}=await context.params;const {sessions,authentication,profiles}=createConfiguredIdentityServices();
  const session=await sessions.validate(token);if(!session.valid)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const verified=await authentication.verifyCredentialsForAccount({accountId:session.account.id,channel:body.channel,identifier:body.identifier,password:body.password});
  if(!verified)return NextResponse.json({ok:false,error:"Fresh account verification was not accepted."},{status:401});
  const transfer=await profiles.requestOwnershipTransfer(session.account.id,profileId,body.recipientHandle);
  return NextResponse.json({ok:true,transfer},{status:201});
 }catch(error){if(error instanceof ProfileAccessDeniedError)return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});return routeError(error);}
}

export async function DELETE(request:NextRequest,context:Context){
 if(!hasSameOrigin(request))return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body||typeof body.transferId!=="string"||(body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"||typeof body.password!=="string")
  return NextResponse.json({ok:false,error:"Transfer ID and fresh account verification are required."},{status:400});
 const token=readSessionCookie(request);if(!token)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  await context.params;const {sessions,authentication,profiles}=createConfiguredIdentityServices();
  const session=await sessions.validate(token);if(!session.valid)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const verified=await authentication.verifyCredentialsForAccount({accountId:session.account.id,channel:body.channel,identifier:body.identifier,password:body.password});
  if(!verified)return NextResponse.json({ok:false,error:"Fresh account verification was not accepted."},{status:401});
  const cancelled=await profiles.cancelOwnershipTransfer(session.account.id,body.transferId);
  return NextResponse.json({ok:cancelled},{status:cancelled?200:404});
 }catch(error){if(error instanceof ProfileAccessDeniedError)return NextResponse.json({ok:false,error:"Profile access denied."},{status:403});return routeError(error);}
}
