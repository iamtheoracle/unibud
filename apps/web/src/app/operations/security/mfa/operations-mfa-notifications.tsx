"use client";

import { useCallback,useEffect,useState } from "react";

type NotificationType=
 | "enrollment_confirmed"
 | "locked_out"
 | "recovery_code_redeemed"
 | "recovery_codes_regenerated"
 | "security_reset_requested"
 | "security_reset_approved"
 | "security_reset_rejected"
 | "security_credential_disabled"
 | "security_reset_cancelled"
 | "security_reset_expired";

type Notification={
 notification_id:string;
 event_type:NotificationType;
 created_at:string;
 read_at:string|null;
 security_request_id:string|null;
};

type ApiResult={
 ok?:boolean;
 error?:string;
 notifications?:Notification[];
 unreadCount?:number;
 marked?:boolean;
};

const LABELS:Record<NotificationType,string>={
 enrollment_confirmed:"Operations authenticator enabled",
 locked_out:"Operations authenticator temporarily locked",
 recovery_code_redeemed:"An Operations recovery code was used",
 recovery_codes_regenerated:"Operations recovery codes regenerated",
 security_reset_requested:"An Operations security change was requested",
 security_reset_approved:"An Operations security change was approved",
 security_reset_rejected:"An Operations security change was rejected",
 security_credential_disabled:"Operations authenticator disabled",
 security_reset_cancelled:"An Operations security request was cancelled",
 security_reset_expired:"An Operations security request expired"
};

export default function OperationsMfaNotifications(){
 const [items,setItems]=useState<Notification[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [busyId,setBusyId]=useState("");

 const refresh=useCallback(async()=>{
  const response=await fetch("/api/internal/operations/mfa/notifications?limit=50",{
   method:"GET",credentials:"same-origin",cache:"no-store"
  });
  const data=await response.json() as ApiResult;
  if(!response.ok||!data.ok||!Array.isArray(data.notifications)){
   throw new Error(data.error||"Security notifications are temporarily unavailable.");
  }
  setItems(data.notifications);
 },[]);

 useEffect(()=>{
  let active=true;
  fetch("/api/internal/operations/mfa/notifications?limit=50",{
   method:"GET",credentials:"same-origin",cache:"no-store"
  }).then(async response=>{
   const data=await response.json() as ApiResult;
   if(!response.ok||!data.ok||!Array.isArray(data.notifications)){
    throw new Error(data.error||"Security notifications are temporarily unavailable.");
   }
   if(active)setItems(data.notifications);
  }).catch(reason=>{
   if(active)setError(reason instanceof Error?reason.message:"Security notifications are unavailable.");
  }).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);

 async function markRead(notificationId:string){
  setBusyId(notificationId);setError("");
  try{
   const response=await fetch("/api/internal/operations/mfa/notifications",{
    method:"PATCH",credentials:"same-origin",cache:"no-store",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({notificationId})
   });
   const data=await response.json() as ApiResult;
   if(!response.ok||!data.ok||data.marked!==true){
    throw new Error(data.error||"This notification could not be updated.");
   }
   await refresh();
  }catch(reason){
   setError(reason instanceof Error?reason.message:"This notification could not be updated.");
  }finally{setBusyId("");}
 }

 const unread=items.filter(item=>item.read_at===null).length;
 return <section className="mfa-card" aria-labelledby="mfa-notifications-title">
  <div className="mfa-card-head">
   <div><p className="eyebrow">Security activity</p><h2 id="mfa-notifications-title">Security notifications</h2></div>
   <span className="mfa-state">{unread} unread</span>
  </div>
  <p className="mfa-muted">Important authenticator and dual-control events for this account. These are in-app notices; external email or SMS delivery is not represented here.</p>
  {error&&<p className="mfa-alert mfa-error" role="alert">{error}</p>}
  {loading?<p className="mfa-small" role="status">Loading security notifications…</p>
   :items.length===0?<p className="mfa-small">No security notifications yet.</p>
   :<ul className="mfa-notification-list">
    {items.map(item=><li key={item.notification_id} className={item.read_at===null?"is-unread":""}>
     <div>
      <strong>{LABELS[item.event_type]||"Operations security event"}</strong>
      <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
     </div>
     {item.read_at===null&&<button className="mfa-button mfa-notification-action" type="button"
       disabled={busyId===item.notification_id}
       onClick={()=>void markRead(item.notification_id)}>
       {busyId===item.notification_id?"Saving…":"Mark as read"}
     </button>}
    </li>)}
   </ul>}
 </section>;
}
