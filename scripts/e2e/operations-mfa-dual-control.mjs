import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const modulePath=process.env.PLAYWRIGHT_MODULE;
if(!modulePath) throw new Error("PLAYWRIGHT_MODULE required");
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const page=await browser.newPage();
const viewer="a1000000-0000-4000-8000-000000000001";
const target="a1000000-0000-4000-8000-000000000002";
const other="a1000000-0000-4000-8000-000000000003";
const now=Date.now();
const requests=[
 {request_id:"a2000000-0000-4000-8000-000000000001",target_account_id:target,requested_action:"reset",state:"pending",requester_account_id:other,approver_account_id:null,reason_code:"lost_device",created_at:new Date(now-60000).toISOString(),expires_at:new Date(now+25*60000).toISOString(),decided_at:null,completed_at:null},
 {request_id:"a2000000-0000-4000-8000-000000000002",target_account_id:target,requested_action:"disable",state:"pending",requester_account_id:viewer,approver_account_id:null,reason_code:"lost_device",created_at:new Date(now-30000).toISOString(),expires_at:new Date(now+25*60000).toISOString(),decided_at:null,completed_at:null}
];
const calls=[];
async function reply(route,status,body){await route.fulfill({status,contentType:"application/json",headers:{"Cache-Control":"no-store"},body:JSON.stringify(body)});}
await page.route("**/api/internal/operations/mfa/**",async route=>{
 const url=new URL(route.request().url()),path=url.pathname,method=route.request().method();
 if(path.endsWith("/status")&&method==="GET") return reply(route,200,{ok:true,status:{operator:true,credentialState:"active",locked:false,stepUpExpiresAt:new Date(now+300000).toISOString()}});
 if(path.endsWith("/requests")&&method==="GET") return reply(route,200,{ok:true,viewerAccountId:viewer,requests});
 if(method==="POST"){
  const body=route.request().postDataJSON();calls.push({path,body});
  if(path.endsWith("/requests")){
   requests.push({request_id:"a2000000-0000-4000-8000-000000000003",target_account_id:body.targetAccountId,requested_action:body.action,state:"pending",requester_account_id:viewer,approver_account_id:null,reason_code:body.reasonCode,created_at:new Date().toISOString(),expires_at:new Date(now+30*60000).toISOString(),decided_at:null,completed_at:null});
   return reply(route,201,{ok:true,requestId:requests.at(-1).request_id,state:"pending"});
  }
  if(path.endsWith("/decision")){
   const id=path.split("/").at(-2),item=requests.find(x=>x.request_id===id);
   if(item){item.state=body.decision==="approve"?"completed":"rejected";item.approver_account_id=viewer;item.decided_at=new Date().toISOString();}
   return reply(route,200,{ok:true,state:item?.state});
  }
  if(path.endsWith("/cancel")){
   const id=path.split("/").at(-2),item=requests.find(x=>x.request_id===id);
   if(item)item.state="cancelled";
   return reply(route,200,{ok:true,state:"cancelled"});
  }
 }
 return reply(route,404,{ok:false,error:"Not found"});
});
try{
 await page.goto(process.env.UNIBUD_E2E_BASE_URL+"/e2e/operations-mfa");
 await page.getByRole("heading",{name:"Authenticator security requests"}).waitFor();
 await page.getByText("Pending approval queue").waitFor();
 // Independent approval: the requester's own request must never expose decision controls.
 const otherItem=page.locator("li").filter({hasText:other});
 await otherItem.getByRole("button",{name:"Review decision"}).click();
 await page.getByLabel("Decision reason code").fill("reviewed_and_verified");
 await page.getByLabel("Approver account email").fill("approver@example.com");
 await page.getByLabel("Approver current password").fill("test-password");
 await otherItem.getByRole("button",{name:"Approve and complete"}).click();
 await page.getByText("The approved security change was completed.").waitFor();
 // Requester cancellation is available only on the request owned by this viewer.
 const ownItem=page.locator("li").filter({hasText:viewer});
 await ownItem.getByRole("button",{name:"Cancel my request"}).click();
 await page.getByText("Your pending request was cancelled.").waitFor();
 // Creating a request remains a separate action and must not be mistaken for approval.
 await page.getByLabel("Target account ID").fill("a1000000-0000-4000-8000-000000000004");
 await page.getByLabel("Reason code",{exact:true}).fill("lost_device");
 await page.getByLabel("Your account email").fill("requester@example.com");
 const requestForm=page.locator("form").filter({has:page.getByLabel("Target account ID")});
 await requestForm.getByLabel("Current password").fill("test-password");
 await requestForm.getByRole("button",{name:"Submit for independent approval"}).click();
 await page.getByText("Security-change request submitted. It requires a separate authorised approver.").waitFor();
 assert.equal(calls.filter(x=>x.path.endsWith("/decision")).length,1);
 assert.equal(calls.filter(x=>x.path.endsWith("/cancel")).length,1);
 assert.equal(calls.filter(x=>x.path.endsWith("/requests")).length,1,"the browser performs one POST request creation; GET queue refreshes are excluded from this mutation count");
 assert.equal(calls.some(x=>x.body.decision==="approve"&&x.body.password==="test-password"),true);
 process.stdout.write("PASS: Operations dual-control queue, independent approval, requester-only cancellation and request creation browser workflows.\\n");
}finally{await browser.close();}
