import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  return NextResponse.json({ok:true,invitations:await profiles.listIncomingInvitations(validation.account.id)});
 }catch(error){return routeError(error);}
}

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body||typeof body.invitationId!=="string"||typeof body.accept!=="boolean")
  return NextResponse.json({ok:false,error:"Invalid invitation response."},{status:400});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const responded=await profiles.respondToInvitation(validation.account.id,body.invitationId,body.accept);
  return NextResponse.json({ok:responded},{status:responded?200:404});
 }catch(error){return routeError(error);}
}
