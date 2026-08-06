import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import GoogleIcon from "@/components/GoogleIcon";
import { Apple } from "lucide-react";
import { Loader2 } from "lucide-react";

/**
 * SocialAuthButtons — Google, Apple, and Microsoft sign-in.
 * Providers are driven by an array so future providers can be added
 * without touching the component.
 *
 * loginWithProvider handles the OAuth redirect internally;
 * on failure it throws and we surface the error via onError.
 */
const PROVIDERS = [
  { id: "google", label: "Google", icon: "google" },
  { id: "apple", label: "Apple", icon: "apple" },
  { id: "microsoft", label: "Microsoft", icon: "microsoft" },
];

function ProviderIcon({ provider, className = "w-[18px] h-[18px]" }) {
  if (provider === "google") return <GoogleIcon className={className} />;
  if (provider === "apple") return <Apple className={className} strokeWidth={1.6} />;
  // Microsoft — four-square mark
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="1" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" rx="1" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" rx="1" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" rx="1" fill="#FFB900" />
    </svg>
  );
}

export default function SocialAuthButtons({ fromUrl = "/auth-router", onError, className = "" }) {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleProvider = async (provider) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    try {
      await base44.auth.loginWithProvider(provider, fromUrl);
      // loginWithProvider redirects — code below only runs if it doesn't
    } catch (err) {
      setLoadingProvider(null);
      if (onError) onError(err.message || `${provider} sign-in failed`);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handleProvider(p.id)}
          disabled={loadingProvider !== null}
          aria-label={`Continue with ${p.label}`}
          className="w-full h-[52px] rounded-2xl bg-muted/40 border border-border flex items-center justify-center gap-3 spring-tap disabled:opacity-50 hover:bg-muted/60 transition-colors"
        >
          {loadingProvider === p.id ? (
            <Loader2 className="w-[18px] h-[18px] animate-spin text-muted-foreground" />
          ) : (
            <ProviderIcon provider={p.icon} />
          )}
          <span className="text-[14px] font-semibold text-foreground">Continue with {p.label}</span>
        </button>
      ))}
    </div>
  );
}