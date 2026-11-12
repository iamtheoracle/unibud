"use client";

import { useCallback,useEffect,useState } from "react";

type EventType="request_submitted"|"request_approved"|"request_rejected"|"request_cancelled"|"request_expired";
type Notification={
 notification_id:string;request_id:string;event_type:EventType;
 requested_action:"grant"|"revoke";created_at:string;read_at:string|null;
};
type Result={ok?:boolean;error?:string;notifications?:Notification[]};

const LABELS:Record<EventType,string>={
 request_submitted:"A grant change was submitted for review",
 request_approved:"A grant change was approved",
 request_rejected:"A grant change was rejected",
 request_cancelled:"A grant change request was cancelled",
 request_expired:"A grant change request expired"
};

export default function OperationsGrantNotifications(){
 const [items,setItems]=useState<Notification[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const refresh=useCallback(async()=>{
  const response=await fetch("/api/internal/operations/grants/notifications?limit=50",{
   credentials:"same-origin",cache:"no-store"
  });
  const data=await response.json() as Result;
  if(!response.ok||!data.ok||!Array.isArray(data.notifications)){
   throw new Error(data.error||"Grant notifications are temporarily unavailable.");
  }
  setItems(data.notifications);
 },[]);
 useEffect(()=>{
  let active=true;
  refresh().catch(reason=>{
   if(active)setError(reason instanceof Error?reason.message:"Grant notifications are unavailable.");
  }).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[refresh]);
 async function markRead(notificationId:string){
  setBusy(notificationId);setError("");
  try{
   const response=await fetch("/api/internal/operations/grants/notifications",{
    method:"PATCH",credentials:"same-origin",cache:"no-store",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({notificationId})
   });
   const data=await response.json() as Result&{marked?:boolean};
   if(!response.ok||!data.ok||data.marked!==true){
    throw new Error(data.error||"This notification could not be updated.");
   }
   await refresh();
  }catch(reason){
   setError(reason instanceof Error?reason.message:"This notification could not be updated.");
  }finally{setBusy("");}
 }
 const unread=items.filter(item=>item.read_at===null).length;
 return <section className="mfa-card" aria-labelledby="grant-notifications-title">
  <div className="mfa-card-head">
   <div><p className="eyebrow">Access governance</p><h2 id="grant-notifications-title">Grant notifications</h2></div>
   <span className="mfa-state">{unread} unread</span>
  </div>
  <p className="mfa-muted">In-app updates for grant requests involving this account. These notices do not indicate external email or SMS delivery.</p>
  {error&&<p className="mfa-alert mfa-error" role="alert">{error}</p>}
  {loading?<p className="mfa-small" role="status">Loading grant notifications…</p>
   :items.length===0?<p className="mfa-small">No grant notifications yet.</p>
   :<ul className="mfa-notification-list">
    {items.map(item=><li key={item.notification_id} className={item.read_at===null?"is-unread":""}>
     <div>
      <strong>{LABELS[item.event_type]}</strong>
      <span className="mfa-small">{item.requested_action==="grant"?"Access grant":"Access revocation"} · Request {item.request_id}</span>
      <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
     </div>
     {item.read_at===null&&<button className="mfa-button mfa-notification-action" type="button"
      disabled={busy===item.notification_id} onClick={()=>void markRead(item.notification_id)}>
      {busy===item.notification_id?"Saving…":"Mark as read"}
     </button>}
    </li>)}
   </ul>}
 </section>;
}
