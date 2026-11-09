"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ClosureReadinessSnapshot } from "../../../lib/account/closure-readiness";
import type { AccountDependencyDomain } from "../../../lib/account/dependency-inventory";
import type { AccountExternalDependencyDiscovery } from "../../../lib/server/account/account-external-dependency-repository";
import type { ConcreteIntegrationInventory } from "../../../lib/server/account/concrete-integration-inventory";
import { buildExternalDependencyReadiness } from "../../../lib/account/external-dependency-readiness";

type ResponseBody = { ok: true; readiness: {
  status: "blocked" | "eligible_for_policy_review";
  canClose: false;
  items: Array<{ id: string; title: string; description: string; action: string; href: string; blocking: boolean }>;
  blockers: { ownedProfiles: number; activeOwnedProfiles: number; archivedOwnedProfiles: number; delegatedRelationships: number; incomingTransfers: number; outgoingTransfers: number };
  policyGate: { status: "not_approved"; message: string };
  explanation: string;
}; snapshot: ClosureReadinessSnapshot; dependencies: { version: string; domains: AccountDependencyDomain[]; summary: { totalDomains: number; registeredDomains: number; unimplementedDomains: number; unclassifiedRegisteredDomains: number; unregisteredDomainsBlockClosure: number }; policy: { status: "not_approved"; canClose: false; reason: string } }; dependencyDiscovery: { version: string; generatedAt: string; counts: Record<string, number>; sharedOwnership: Record<string, number>; foreignKeys: Array<{ constraint: string; fromTable: string; toTable: string; definition: string }>; coverage: { registeredTables: string[]; notImplementedDomains: string[]; unknownExternalDependenciesBlockClosure: true }; policy: { status: "not_approved"; missingPolicyDomains: string[]; canClose: false } }; externalDependencyDiscovery: AccountExternalDependencyDiscovery; concreteIntegrationInventory: ConcreteIntegrationInventory } | { ok: false; error: string };

export default function AccountClosureReadinessPage() {
  const [data, setData] = useState<Extract<ResponseBody, { ok: true }> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/account/closure-readiness", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as ResponseBody;
        if (!response.ok || !body.ok) throw new Error(body.ok ? "Could not load account closure readiness." : body.error);
        if (active) setData(body);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load account closure readiness.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <main className="mx-auto max-w-3xl px-5 py-12" aria-busy="true"><p role="status">Checking account obligations…</p></main>;
  if (error) return <main className="mx-auto max-w-3xl px-5 py-12"><h1 className="text-2xl font-semibold">Account closure readiness</h1><p role="alert" className="mt-4">{error}</p><button className="mt-5 rounded-lg border px-4 py-2" onClick={() => window.location.reload()}>Try again</button></main>;
  if (!data) return null;

  const { readiness } = data;
  const counts = readiness.blockers;
  const externalReadiness = buildExternalDependencyReadiness(data.externalDependencyDiscovery);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link href="/profiles" className="underline">Profiles</Link><span aria-hidden="true"> / </span><span>Account closure</span></nav>
      <header>
        <p className="text-sm font-medium text-slate-600">ACCOUNT &amp; SECURITY</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account closure readiness</h1>
        <p className="mt-3 text-slate-600">{readiness.explanation}</p>
      </header>

      <section aria-labelledby="status-heading" className="mt-8 rounded-2xl border p-5">
        <h2 id="status-heading" className="text-lg font-semibold">Current status</h2>
        <p className="mt-2 font-medium">{readiness.status === "blocked" ? "Not ready — outstanding obligations" : "Profile checks clear — policy review still required"}</p>
        <p className="mt-2 text-sm text-slate-600">Permanent account closure is not available from this page. No data or profile has been deleted or transferred.</p>
      </section>

      <section aria-labelledby="counts-heading" className="mt-8">
        <h2 id="counts-heading" className="text-xl font-semibold">What is attached to this account</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Owned profiles", counts.ownedProfiles],
            ["Active profiles", counts.activeOwnedProfiles],
            ["Archived profiles", counts.archivedOwnedProfiles],
            ["Delegated relationships", counts.delegatedRelationships],
            ["Incoming transfers", counts.incomingTransfers],
            ["Outgoing transfers", counts.outgoingTransfers]
          ].map(([label, value]) => <div key={label} className="rounded-xl border p-4"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd></div>)}
        </dl>
      </section>

      <section aria-labelledby="actions-heading" className="mt-8">
        <h2 id="actions-heading" className="text-xl font-semibold">Items to review</h2>
        {readiness.items.length === 0 ? <p className="mt-3 text-sm text-slate-600">No profile or delegated-access items were returned by the current checks.</p> : (
          <ul className="mt-4 space-y-3">
            {readiness.items.map((item) => <li key={item.id} className="rounded-xl border p-4">
              <h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <Link href={item.href} className="mt-3 inline-block text-sm font-medium underline underline-offset-4">{item.action}</Link>
            </li>)}
          </ul>
        )}
      </section>

      <section aria-labelledby="dependencies-heading" className="mt-8">
        <h2 id="dependencies-heading" className="text-xl font-semibold">Account data and dependencies</h2>
        <p className="mt-2 text-sm text-slate-600">This inventory distinguishes database records that exist from product areas that are planned but do not yet have persisted schemas. It is not a count of every record.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border p-3"><dt className="text-xs text-slate-600">Domains reviewed</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{data.dependencies.summary.totalDomains}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-slate-600">Schema registered</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{data.dependencies.summary.registeredDomains}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-slate-600">Not implemented</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{data.dependencies.summary.unimplementedDomains}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-slate-600">Policy unapproved</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{data.dependencies.summary.unclassifiedRegisteredDomains}</dd></div>
        </dl>
        <ul className="mt-4 space-y-3">
          {data.dependencies.domains.map((domain) => <li key={domain.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{domain.label}</h3>
              <span className="rounded-full border px-2 py-1 text-xs">{domain.status === "registered_unclassified" ? "Schema registered · policy unapproved" : "Not implemented · blocks closure"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{domain.explanation}</p>
            <p className="mt-2 text-xs text-slate-500">{domain.sourceTables.length ? `Registered tables: ${domain.sourceTables.join(", ")}` : "No persisted domain tables registered in migrations 0001–0019."}</p>
          </li>)}
        </ul>
        <p className="mt-4 text-sm font-medium" role="status">{data.dependencies.policy.reason}</p>
      </section>

      <section aria-labelledby="discovery-heading" className="mt-8">
        <h2 id="discovery-heading" className="text-xl font-semibold">Live account dependency discovery</h2>
        <p className="mt-2 text-sm text-slate-600">Aggregate counts are queried from PostgreSQL inside a short-lived, signed account transaction. No record contents or credential values are returned.</p>
        <p className="mt-2 text-xs text-slate-500">Generated: {new Date(data.dependencyDiscovery.generatedAt).toLocaleString()}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(data.dependencyDiscovery.counts).map(([key, value]) => <div key={key} className="rounded-xl border p-3"><dt className="text-xs text-slate-600">{key.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`)}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd></div>)}
        </dl>
        <h3 className="mt-6 font-semibold">Shared ownership and open relationships</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(data.dependencyDiscovery.sharedOwnership).map(([key, value]) => <div key={key} className="rounded-xl border p-3"><dt className="text-xs text-slate-600">{key.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`)}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd></div>)}
        </dl>
        <h3 className="mt-6 font-semibold">Database relationship map</h3>
        <p className="mt-1 text-sm text-slate-600">Foreign-key definitions among the registered account and profile tables.</p>
        {data.dependencyDiscovery.foreignKeys.length === 0 ? <p className="mt-3 text-sm" role="status">No foreign-key relationships were returned. This is a discovery failure or an incomplete schema, not proof that dependencies do not exist.</p> : (
          <ul className="mt-3 space-y-2">
            {data.dependencyDiscovery.foreignKeys.map((edge) => <li key={edge.constraint} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{edge.fromTable} → {edge.toTable}</p>
              <p className="mt-1 text-xs text-slate-500">{edge.definition}</p>
            </li>)}
          </ul>
        )}
        <h3 className="mt-6 font-semibold">Unapproved policy domains</h3>
        <p className="mt-1 text-sm text-slate-600">{data.dependencyDiscovery.policy.missingPolicyDomains.join(", ")}</p>
        <p className="mt-2 text-sm font-medium" role="status">Permanent closure remains blocked. Unknown external dependencies are also blockers.</p>
      </section>


      <section aria-labelledby="external-dependencies-heading" className="mt-8">
        <h2 id="external-dependencies-heading" className="text-xl font-semibold">External services and shared data</h2>
        <p className="mt-2 text-sm text-slate-600">This view reports only dependencies registered and evidenced by UNIBUD; it does not claim that every external copy has been discovered. Integration verification state is platform-wide, while reference counts below are scoped to your signed-in account. No live provider check is performed by this screen yet. Export and deletion are unavailable.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Verified integrations", externalReadiness.counts.verified],
            ["Unknown integrations", externalReadiness.counts.unknown],
            ["Unavailable integrations", externalReadiness.counts.unavailable],
            ["Unclassified integrations", externalReadiness.counts.unclassified],
            ["Policy gaps", externalReadiness.counts.policyGaps]
          ].map(([label, value]) => <div key={label} className="rounded-xl border p-3"><dt className="text-xs text-slate-600">{label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd></div>)}
        </dl>
        <h3 className="mt-6 font-semibold">External references associated with this account</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["References", externalReadiness.references.total],
            ["Not provider-verified", externalReadiness.references.unverified],
            ["Unknown disposition", externalReadiness.references.unknownDisposition],
            ["Unavailable references", externalReadiness.references.unavailable],
            ["Stale evidence", externalReadiness.references.stale],
            ["Shared relationships", externalReadiness.references.shared]
          ].map(([label, value]) => <div key={label} className="rounded-xl border p-3"><dt className="text-xs text-slate-600">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd></div>)}
        </dl>
        <h3 className="mt-6 font-semibold">Registered integrations</h3>
        {externalReadiness.integrations.length === 0 ? (
          <p className="mt-3 rounded-xl border p-4 text-sm" role="status">No external integration has been registered. This is unclassified coverage, not proof that no external dependencies exist.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {externalReadiness.integrations.map((integration) => (
              <li key={integration.integrationKey} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold">{integration.provider ?? integration.integrationKey}</h4>
                  <span className="rounded-full border px-2 py-1 text-xs" data-state={integration.state}>{integration.state === "verified" ? "Verified" : integration.state === "unknown" ? "Unknown" : integration.state === "unavailable" ? "Unavailable" : "Unclassified"}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{integration.explanation}</p>
                <p className="mt-2 text-xs text-slate-500">Domain: {integration.domain} · Lookup: {integration.lookupAvailable ? "available by verified contract" : "not available"}</p>
                {integration.lastVerifiedAt ? <p className="mt-1 text-xs text-slate-500">Last verified: {new Date(integration.lastVerifiedAt).toLocaleString()}</p> : null}
                <p className="mt-2 text-xs font-medium">Export: unavailable · Deletion: unavailable</p>
              </li>
            ))}
          </ul>
        )}
        <h3 className="mt-6 font-semibold">Unapproved policy domains</h3>
        {externalReadiness.unclassifiedDomains.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No missing policy-domain labels were returned. This alone does not establish complete provider coverage.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {externalReadiness.unclassifiedDomains.map(domain => <li key={domain}>{domain}</li>)}
          </ul>
        )}
        <p className="mt-4 rounded-xl border p-4 text-sm" role="status">Export and deletion are disabled. Unknown, stale, unavailable and shared dependencies remain visible blockers. Permanent account closure remains disabled.</p>
      </section>

      <section aria-labelledby="concrete-integration-heading" className="mt-8">
        <h2 id="concrete-integration-heading" className="text-xl font-semibold">Concrete integration inventory</h2>
        <p className="mt-2 text-sm text-slate-600">This checks the presence of required server setting names for integrations wired into the repository. It never displays setting values or makes provider calls. “Configured” means configuration is present—not that a connection, provider identity, or external data inventory has been verified.</p>
        <ul className="mt-4 space-y-3">
          {data.concreteIntegrationInventory.integrations.map((integration) => (
            <li key={integration.integrationKey} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{integration.provider ?? integration.integrationKey}</h3>
                <span className="rounded-full border px-2 py-1 text-xs" data-state={integration.state}>
                  {integration.state === "configured_unverified" ? "Configured · unverified" : integration.state === "partially_configured" ? "Partially configured" : "Not configured"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{integration.purpose}</p>
              <p className="mt-2 text-xs text-slate-500">Domain: {integration.domain}</p>
              <p className="mt-2 text-sm">{integration.explanation}</p>
              <p className="mt-2 text-xs text-slate-500">Present setting names: {integration.configuredSettings.length ? integration.configuredSettings.join(", ") : "None"}</p>
              <p className="mt-1 text-xs text-slate-500">Missing setting names: {integration.missingSettings.length ? integration.missingSettings.join(", ") : "None"}</p>
              <details className="mt-3 text-xs text-slate-600">
                <summary className="cursor-pointer font-medium">Repository evidence</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">{integration.evidence.map(path => <li key={path}><code>{path}</code></li>)}</ul>
              </details>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 font-semibold">Inventory limits</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
          {data.concreteIntegrationInventory.limitations.map(item => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section aria-labelledby="policy-heading" className="mt-8 rounded-2xl border p-5">
        <h2 id="policy-heading" className="text-lg font-semibold">Before permanent closure can be offered</h2>
        <p className="mt-2 text-sm text-slate-600">{readiness.policyGate.message}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          <li>Retention periods and records that must legally remain available.</li>
          <li>Clear notice explaining what happens to profile content and account data.</li>
          <li>Ownership and transfer rules for dependent records, services and transactions.</li>
          <li>A defined recovery window, identity re-verification and support process.</li>
          <li>Audited deletion, export, backup-expiry and incident-recovery procedures.</li>
        </ul>
        <p className="mt-4 text-sm font-medium">Closure action: unavailable by design.</p>
      </section>

      <footer className="mt-10 border-t pt-5 text-sm text-slate-600">
        <p>Review profile and delegation settings before requesting account closure support.</p>
        <Link href="/profiles" className="mt-2 inline-block font-medium underline underline-offset-4">Open profile management</Link>
      </footer>
    </main>
  );
}
