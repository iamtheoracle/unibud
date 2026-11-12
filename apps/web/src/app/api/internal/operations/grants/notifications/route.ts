import { NextRequest,NextResponse } from "next/server";
import { createSignedSessionContextFromEnvironment,withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin,readJsonObject,readSessionCookie,routeError } from "@/lib/server/identity/http";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function response(body:Record<string,unknown>,status=200):NextResponse{
 return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store",Pragma:"no-cache"}});
}
type GrantNotificationRow={
 notification_id:string;request_id:string;
 event_type:"request_submitted"|"request_approved"|"request_rejected"|"request_cancelled"|"request_expired";
 requested_action:"grant"|"revoke";created_at:Date|string;read_at:Date|string|null;
};

export async function GET(request:NextRequest){
 const origin=request.headers.get("origin");
 if(origin&&!hasSameOrigin(request))return response({ok:false,error:"Forbidden."},403);
 const token=readSessionCookie(request);
 if(!token)return response({ok:false,error:"Authentication is required."},401);
 const raw=request.nextUrl.searchParams.get("limit");
 const limit=raw===null?50:Number(raw);
 if(!Number.isInteger(limit)||limit<1||limit>50)return response({ok:false,error:"Invalid notification page size."},400);
 try{
  const {sessions}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid)return response({ok:false,error:"Authentication is required."},401);
  const context=createSignedSessionContextFromEnvironment(validation.account.id,validation.session.id);
  const notifications=await withSignedSessionTransaction(getAppDatabasePool(),context,async client=>{
   const result=await client.query<GrantNotificationRow>(
    "SELECT * FROM public.unibud_operator_list_grant_notifications($1)",[limit]
   );
   return result.rows;
  });
  return response({ok:true,notifications,unreadCount:notifications.filter(item=>item.read_at===null).length});
 }catch(error){
  const result=routeError(error);
  result.headers.set("Cache-Control","no-store");result.headers.set("Pragma","no-cache");
  return result;
 }
}

export async function PATCH(request:NextRequest){
 if(!hasSameOrigin(request))return response({ok:false,error:"Forbidden."},403);
 const body=await readJsonObject(request);
 if(!body||typeof body.notificationId!=="string"||!UUID.test(body.notificationId)){
  return response({ok:false,error:"A valid notification ID is required."},400);
 }
 const token=readSessionCookie(request);
 if(!token)return response({ok:false,error:"Authentication is required."},401);
 try{
  const {sessions}=createConfiguredIdentityServices();
  const validation=await sessions.validate(token);
  if(!validation.valid)return response({ok:false,error:"Authentication is required."},401);
  const context=createSignedSessionContextFromEnvironment(validation.account.id,validation.session.id);
  const marked=await withSignedSessionTransaction(getAppDatabasePool(),context,async client=>{
   const result=await client.query<{marked:boolean}>(
    "SELECT public.unibud_operator_mark_grant_notification_read($1) AS marked",[body.notificationId]
   );
   return result.rows[0]?.marked===true;
  });
  return response({ok:true,marked});
 }catch(error){
  const result=routeError(error);
  result.headers.set("Cache-Control","no-store");result.headers.set("Pragma","no-cache");
  return result;
 }
}
