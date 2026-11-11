import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const modulePath=process.env.PLAYWRIGHT_MODULE;
if(!modulePath) throw new Error("PLAYWRIGHT_MODULE required");
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const page=await browser.newPage();
let state={operator:true,credentialState:"none",locked:false,stepUpExpiresAt:null};
const codes=["ABCDE-00001-FGHIJ-KLMNO","ABCDE-00002-FGHIJ-KLMNO","ABCDE-00003-FGHIJ-KLMNO","ABCDE-00004-FGHIJ-KLMNO","ABCDE-00005-FGHIJ-KLMNO","ABCDE-00006-FGHIJ-KLMNO","ABCDE-00007-FGHIJ-KLMNO","ABCDE-00008-FGHIJ-KLMNO"];
const uri="otpauth://totp/UNIBUD?secret=JBSWY3DPEHPK3PXP&issuer=UNIBUD";
const calls=[];
async function reply(route,status,body){await route.fulfill({status,contentType:"application/json",headers:{"Cache-Control":"no-store"},body:JSON.stringify(body)});}
await page.route("**/api/internal/operations/mfa/**",async route=>{
 const path=new URL(route.request().url()).pathname,method=route.request().method();
 if(path.endsWith("/status")&&method==="GET") return reply(route,200,{ok:true,status:state});
 const body=route.request().postDataJSON(); calls.push({path,body});
 if(path.endsWith("/enrollment/start")){state={...state,credentialState:"pending"};return reply(route,200,{ok:true,provisioningUri:uri});}
 if(path.endsWith("/enrollment/resume")) return reply(route,200,{ok:true,provisioningUri:uri});
 if(path.endsWith("/enrollment/confirm")){state={...state,credentialState:"active"};return reply(route,200,{ok:true,recoveryCodes:codes,recoveryCodesShownOnce:true});}
 if(path.endsWith("/challenge")){state={...state,stepUpExpiresAt:new Date(Date.now()+300000).toISOString()};return reply(route,200,{ok:true});}
 if(path.endsWith("/recovery/regenerate"))return reply(route,200,{ok:true,recoveryCodes:codes,recoveryCodesShownOnce:true});
 if(path.endsWith("/recovery/redeem")){state={operator:true,credentialState:"none",locked:false,stepUpExpiresAt:null};return reply(route,200,{ok:true});}
 return reply(route,404,{ok:false});
});
try{
 await page.goto(process.env.UNIBUD_E2E_BASE_URL+"/e2e/operations-mfa");
 await page.getByRole("heading",{name:"Set up an authenticator"}).waitFor();
 await page.getByLabel("Email address").fill("operator@example.com");
 await page.getByLabel("Current password").fill("test-password");
 await page.getByRole("button",{name:"Begin authenticator setup"}).click();
 await page.getByRole("heading",{name:"Add the authenticator"}).waitFor();
 await page.getByRole("img",{name:"Authenticator setup QR code"}).waitFor();
 await page.reload();
 await page.getByRole("heading",{name:"Continue your pending enrollment"}).waitFor();
 await page.getByLabel("Email address").fill("operator@example.com");
 await page.getByLabel("Current password").fill("test-password");
 await page.getByRole("button",{name:"Resume pending setup"}).click();
 await page.getByLabel("Six-digit authenticator code").fill("123456");
 await page.getByRole("button",{name:"Confirm and activate"}).click();
 await page.getByRole("heading",{name:"Your recovery codes"}).waitFor();
 await page.getByLabel("I have saved these recovery codes somewhere secure.").check();
 await page.getByRole("button",{name:"I have saved my codes"}).click();
 await page.getByLabel("Six-digit authenticator code").fill("654321");
 await page.getByRole("button",{name:"Verify this session"}).click();
 await page.getByRole("heading",{name:"Regenerate recovery codes"}).waitFor();
 await page.getByLabel("Email address").fill("operator@example.com");
 await page.getByLabel("Current password").fill("test-password");
 await page.getByRole("button",{name:"Replace recovery codes"}).click();
 await page.getByRole("heading",{name:"Your recovery codes"}).waitFor();
 await page.getByLabel("I have saved these recovery codes somewhere secure.").check();
 await page.getByRole("button",{name:"I have saved my codes"}).click();
 await page.getByLabel("Recovery code").fill("ABCDE-ABCDE-ABCDE-ABCDE");
 await page.getByRole("button",{name:"Redeem recovery code"}).click();
 await page.getByRole("heading",{name:"Set up an authenticator"}).waitFor();
 assert.equal(calls.length,6);
 process.stdout.write("PASS: MFA enrollment, resume, challenge, recovery regeneration and redemption UI workflow.\n");
}finally{await browser.close();}
