import {NextRequest,NextResponse} from "next/server";
import {createConfiguredIdentityServices} from "../../../lib/server/identity/identity-runtime";
import {ProfileAccessDeniedError} from "../../../lib/server/profiles/profile-service-core";
import {hasSameOrigin,readJsonObject,readSessionCookie,routeError} from "../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);if(!token)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{const {sessions,profiles}=createConfiguredIdentityServices();const session=await sessions.validate(token);
  if(!session.valid)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  return NextResponse.json({ok:true,transfers:await profiles.listIncomingOwnershipTransfers(session.account.id)});
 }catch(error){if(error instanceof ProfileAccessDeniedError)return NextResponse.json({ok:false,error:"Transfer inbox access denied."},{status:403});return routeError(error);}
}

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request))return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const body=await readJsonObject(request);
 if(!body||typeof body.transferId!=="string"||typeof body.accept!=="boolean"||(body.channel!=="email"&&body.channel!=="phone")||typeof body.identifier!=="string"||typeof body.password!=="string")
  return NextResponse.json({ok:false,error:"Transfer response and fresh account verification are required."},{status:400});
 const token=readSessionCookie(request);if(!token)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{const {sessions,authentication,profiles}=createConfiguredIdentityServices();const session=await sessions.validate(token);
  if(!session.valid)return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const verified=await authentication.verifyCredentialsForAccount({accountId:session.account.id,channel:body.channel,identifier:body.identifier,password:body.password});
  if(!verified)return NextResponse.json({ok:false,error:"Fresh account verification was not accepted."},{status:401});
  const responded=await profiles.respondToOwnershipTransfer(session.account.id,body.transferId,body.accept);
  return responded?NextResponse.json({ok:true}):NextResponse.json({ok:false,error:"This transfer request is no longer open or has expired."},{status:409});
 }catch(error){if(error instanceof ProfileAccessDeniedError)return NextResponse.json({ok:false,error:"Transfer access denied."},{status:403});return routeError(error);}
}
