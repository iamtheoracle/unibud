import Link from "next/link";

export default function TermsPage(){
 return <main className="legal-page"><Link href="/signup" className="wordmark">unibud<span>.</span></Link>
  <p className="eyebrow">Legal · Draft</p><h1>Terms of Service</h1>
  <p className="legal-warning">Draft for product and legal review. This is not an approved legal agreement and must not be used as the production Terms until reviewed and adopted by UNIBUD.</p>
  <h2>Using UNIBUD</h2><p>UNIBUD is designed as a connected ecosystem with distinct spaces. You are responsible for keeping your account credentials secure and for activity carried out through your account.</p>
  <h2>Accurate account information</h2><p>Provide information you are authorised to use. Do not impersonate another person, misrepresent an organisation, bypass age restrictions, or access another person's account or private space.</p>
  <h2>Content and conduct</h2><p>Respect other people, communities, institutions and creators. Do not publish unlawful, deceptive, abusive, exploitative, or non-consensual material. Additional rules may apply to individual spaces and services.</p>
  <h2>Transactions and services</h2><p>Marketplace orders, delivery, financial products, bookings, paid experiences, professional services and other transactions may have separate terms. A listing or AI suggestion is not a completed booking, payment or financial transaction.</p>
  <h2>Safety and enforcement</h2><p>UNIBUD may review reports, restrict harmful activity, protect users, and enforce published policies. Consequential decisions and regulated services require appropriate human oversight and lawful processes.</p>
  <h2>Changes and contact</h2><p>The final Terms must identify the operating legal entity, applicable law, dispute process, service limitations, user rights, and official contact details before production approval.</p>
  <p><Link href="/legal/privacy">Read the Privacy Notice</Link></p>
 </main>;
}
