import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingForm from "../../components/onboarding-form";
import { createConfiguredIdentityServices } from "../../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../../lib/server/identity/http";

export default async function OnboardingPage(){
 const token=(await cookies()).get(sessionCookieName())?.value;
 if(!token) redirect("/login?next=/onboarding");
 let valid=false,hasProfile=false;
 try{
  const {sessions}=createConfiguredIdentityServices();
  const result=await sessions.validate(token);
  valid=result.valid;
  hasProfile=result.valid&&Boolean(result.session.activeProfileId);
 }catch{
  redirect("/login?next=/onboarding");
 }
 if(!valid) redirect("/login?next=/onboarding");
 if(hasProfile) redirect("/home");
 return <OnboardingForm/>;
}
