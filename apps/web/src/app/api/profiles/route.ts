import { NextRequest,NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "../../../lib/server/identity/http";

export async function GET(request:NextRequest){
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false},{status:401});
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false},{status:401});
  return NextResponse.json({ok:true,profiles:await profiles.listAccessibleProfiles(validation.account.id)});
 }catch(error){return routeError(error);}
}

export async function POST(request:NextRequest){
 if(!hasSameOrigin(request)) return NextResponse.json({ok:false,error:"Forbidden."},{status:403});
 const token=readSessionCookie(request);
 if(!token) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
 const body=await readJsonObject(request);
 if(!body) return NextResponse.json({ok:false,error:"Invalid JSON request."},{status:400});
 if(!["personal","creator","page_community"].includes(String(body.kind))||
   typeof body.handle!=="string"||typeof body.displayName!=="string"||
   (body.visibility!==undefined&&!["private","public","unlisted"].includes(String(body.visibility)))){
  return NextResponse.json({ok:false,error:"Invalid profile details."},{status:400});
 }
 try{
  const {sessions,profiles}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid) return NextResponse.json({ok:false,error:"Authentication required."},{status:401});
  const profile=await profiles.createOwnedProfile(validation.account.id,{
   kind:body.kind as "personal"|"creator"|"page_community",
   handle:body.handle,displayName:body.displayName,
   visibility:(body.visibility??"private") as "private"|"public"|"unlisted"
  });
  return NextResponse.json({ok:true,profile},{status:201});
 }catch(error){return routeError(error);}
}
