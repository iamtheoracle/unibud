import Link from "next/link";

export default function PrivacyPage(){
 return <main className="legal-page"><Link href="/signup" className="wordmark">unibud<span>.</span></Link>
  <p className="eyebrow">Legal · Draft</p><h1>Privacy Notice</h1>
  <p className="legal-warning">Draft for product and legal review. This is not an approved privacy notice. The final notice must be reviewed against actual data flows, providers, retention and applicable law before production onboarding.</p>
  <h2>Information categories</h2><p>Depending on the spaces and features you use, UNIBUD may process account and authentication data, profile information, content and communications, service requests, transaction records, device and security signals, and information you choose to provide.</p>
  <h2>How information is used</h2><p>Information may be used to create and secure accounts, operate requested features, connect people and services, fulfil transactions, prevent abuse, provide support, and meet legal obligations. Optional AI features must follow their own access, consent and data-use controls.</p>
  <h2>Sharing and service providers</h2><p>Information should be shared only where needed to provide a requested service, protect users, or meet a lawful obligation. The final notice must name or describe relevant processors, delivery providers, financial partners, analytics services and international transfers accurately.</p>
  <h2>Security and retention</h2><p>UNIBUD is designed to minimise access, separate account data, protect credentials and restrict staff and service permissions. The final notice must describe actual safeguards, retention periods, deletion exceptions, backups and incident procedures.</p>
  <h2>Your choices and rights</h2><p>The final notice must explain how users can access, correct, export or delete information, manage privacy settings, withdraw optional consent, and contact the responsible privacy team.</p>
  <h2>Children and age-restricted spaces</h2><p>Age requirements and additional safeguards apply to certain spaces. Adults-only features must remain separately gated and must not be available to underage users.</p>
  <h2>Contact and legal details</h2><p>The final notice must identify the data controller, applicable privacy laws, responsible contact, complaint channels, and any required representative before production use.</p>
  <p><Link href="/legal/terms">Read the Terms of Service</Link></p>
 </main>;
}
