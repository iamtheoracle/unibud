import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { hasSameOrigin,readSessionCookie,routeError } from "../../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  return NextResponse.json({ok:true,notifications:await profiles.listLifecycleNotifications(validation.account.id)});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Notification access denied."},{status:403});
  return routeError(error);
 }
}

export async function PATCH(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 try{
  const body=await request.json() as {notificationId?:string};
  if(typeof body.notificationId!=="string") return NextResponse.json({ok:false,error:"Notification ID is required."},{status:400});
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const marked=await profiles.markLifecycleNotificationRead(validation.account.id,body.notificationId);
  return NextResponse.json({ok:true,marked});
 }catch(error){
  if(error instanceof ProfileAccessDeniedError) return NextResponse.json({ok:false,error:"Notification access denied."},{status:403});
  return routeError(error);
 }
}
