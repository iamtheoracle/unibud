import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const modulePath=process.env.PLAYWRIGHT_MODULE;
if(!modulePath)throw new Error("PLAYWRIGHT_MODULE required");
const {chromium}=await import(pathToFileURL(modulePath).href);
const baseURL=process.env.UNIBUD_E2E_BASE_URL??"http://127.0.0.1:3100";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const viewer="b1000000-0000-4000-8000-000000000001";
const requester="b1000000-0000-4000-8000-000000000002";
const target="b1000000-0000-4000-8000-000000000003";
const approverTarget="b1000000-0000-4000-8000-000000000004";
const now=Date.now();
let requests=[
 {request_id:"b2000000-0000-4000-8000-000000000001",requested_action:"grant",target_account_id:target,target_grant_id:null,requested_role:"support_readonly",requested_permissions:["operations.audit.read"],requested_expires_at:new Date(now+86400000).toISOString(),state:"pending",requester_account_id:requester,approver_account_id:null,reason_code:"support_access",created_at:new Date(now-60000).toISOString(),expires_at:new Date(now+25*60000).toISOString()},
 {request_id:"b2000000-0000-4000-8000-000000000002",requested_action:"grant",target_account_id:approverTarget,target_grant_id:null,requested_role:"support_readonly",requested_permissions:["operations.audit.read"],requested_expires_at:new Date(now+86400000).toISOString(),state:"pending",requester_account_id:viewer,approver_account_id:null,reason_code:"support_access",created_at:new Date(now-30000).toISOString(),expires_at:new Date(now+25*60000).toISOString()}
];
let notifications=[
 {notification_id:"b3000000-0000-4000-8000-000000000001",request_id:requests[0].request_id,event_type:"request_submitted",requested_action:"grant",created_at:new Date(now-50000).toISOString(),read_at:null},
 {notification_id:"b3000000-0000-4000-8000-000000000002",request_id:requests[1].request_id,event_type:"request_submitted",requested_action:"grant",created_at:new Date(now-20000).toISOString(),read_at:null}
];
const mutations=[];
async function json(route,status,body){await route.fulfill({status,contentType:"application/json",headers:{"Cache-Control":"no-store"},body:JSON.stringify(body)});}
try{
 const page=await browser.newPage();
 await page.route("**/api/internal/operations/grants**",async route=>{
  const url=new URL(route.request().url()),path=url.pathname,method=route.request().method();
  if(path.endsWith("/notifications")){
   if(method==="GET")return json(route,200,{ok:true,notifications,unreadCount:notifications.filter(x=>x.read_at===null).length});
   if(method==="PATCH"){
    const body=route.request().postDataJSON();mutations.push({path,body});
    const item=notifications.find(x=>x.notification_id===body.notificationId);
    if(item)item.read_at=new Date().toISOString();
    return json(route,200,{ok:true,marked:Boolean(item)});
   }
  }
  if(path==="/api/internal/operations/grants"&&method==="GET"){
   if(url.searchParams.get("view")==="active-grants")return json(route,200,{ok:true,viewerAccountId:viewer,grants:[]});
   return json(route,200,{ok:true,viewerAccountId:viewer,requests:requests.filter(x=>x.state==="pending")});
  }
  if(path==="/api/internal/operations/grants"&&method==="POST"){
   const body=route.request().postDataJSON();mutations.push({path,body});
   const item={request_id:"b2000000-0000-4000-8000-000000000003",requested_action:body.action,target_account_id:body.targetAccountId,target_grant_id:body.targetGrantId??null,requested_role:body.role??null,requested_permissions:body.permissions??null,requested_expires_at:body.expiresAt??null,state:"pending",requester_account_id:viewer,approver_account_id:null,reason_code:body.reasonCode,created_at:new Date().toISOString(),expires_at:new Date(now+30*60000).toISOString()};
   requests=[...requests,item];
   notifications=[...notifications,{notification_id:"b3000000-0000-4000-8000-000000000003",request_id:item.request_id,event_type:"request_submitted",requested_action:"grant",created_at:new Date().toISOString(),read_at:null}];
   return json(route,201,{ok:true,requestId:item.request_id,state:"pending"});
  }
  if(path.endsWith("/decision")&&method==="POST"){
   const body=route.request().postDataJSON();mutations.push({path,body});
   const id=path.split("/").at(-2),item=requests.find(x=>x.request_id===id);
   if(item)item.state=body.decision==="approve"?"approved":"rejected";
   notifications=[...notifications,{notification_id:"b3000000-0000-4000-8000-000000000004",request_id:id,event_type:body.decision==="approve"?"request_approved":"request_rejected",requested_action:item?.requested_action??"grant",created_at:new Date().toISOString(),read_at:null}];
   return json(route,200,{ok:true,state:item?.state});
  }
  if(path.endsWith("/cancel")&&method==="POST"){
   const body=route.request().postDataJSON();mutations.push({path,body});
   const id=path.split("/").at(-2),item=requests.find(x=>x.request_id===id);
   if(item)item.state="cancelled";
   notifications=[...notifications,{notification_id:"b3000000-0000-4000-8000-000000000005",request_id:id,event_type:"request_cancelled",requested_action:item?.requested_action??"grant",created_at:new Date().toISOString(),read_at:null}];
   return json(route,200,{ok:true,state:"cancelled"});
  }
  return json(route,404,{ok:false,error:"Not found"});
 });
 await page.goto(baseURL+"/e2e/operations-grants");
 await page.getByRole("heading",{name:"Operator grants"}).waitFor();
 await page.getByRole("heading",{name:"Grant notifications"}).waitFor();
 await page.getByText("2 unread",{exact:true}).waitFor();
 const firstNotice=page.locator(".mfa-notification-list li").first();
 await firstNotice.getByRole("button",{name:"Mark as read"}).click();
 await page.getByText("1 unread",{exact:true}).waitFor();

 const pendingOther=page.locator("tr").filter({hasText:requester});
 await pendingOther.getByRole("button",{name:"Approve"}).click();
 await page.getByLabel("Decision reason code").fill("reviewed_access");
 await page.getByLabel("Sign-in identifier").fill("operator@example.com");
 await page.getByLabel("Password").fill("fresh-password");
 await pendingOther.getByRole("button",{name:"Approve"}).click();
 await page.getByText("Request approved.",{exact:true}).waitFor();

 const ownRequest=page.locator("tr").filter({hasText:viewer});
 await ownRequest.getByRole("button",{name:"Cancel my request"}).click();
 await page.getByText("Your request was cancelled from this session.",{exact:true}).waitFor();

 await page.getByLabel("Target account UUID").fill("b1000000-0000-4000-8000-000000000005");
 await page.getByLabel("Reason code").fill("staff_access");
 await page.getByLabel("Sign-in identifier").fill("operator@example.com");
 await page.getByLabel("Password").fill("fresh-password");
 await page.getByRole("button",{name:"Submit for independent approval"}).click();
 await page.getByText("Request submitted for independent approval.",{exact:true}).waitFor();

 assert.equal(mutations.filter(x=>x.path.endsWith("/decision")).length,1);
 assert.equal(mutations.filter(x=>x.path.endsWith("/cancel")).length,1);
 assert.equal(mutations.filter(x=>x.path==="/api/internal/operations/grants"&&x.body.action==="grant").length,1);
 assert.equal(mutations.some(x=>x.path.endsWith("/notifications")&&x.body.notificationId==="b3000000-0000-4000-8000-000000000001"),true);
 assert.equal(mutations.some(x=>x.path.endsWith("/decision")&&x.body.password==="fresh-password"),true);
 await browser.close();
 process.stdout.write("PASS: operator grants browser coverage for account-scoped notifications, mark-read, independent approval, requester cancellation and grant request submission.\\n");
}catch(error){
 await browser.close();
 throw error;
}
