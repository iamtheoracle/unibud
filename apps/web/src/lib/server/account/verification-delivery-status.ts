export type VerificationDeliveryConfigurationState =
  | "not_configured"
  | "partially_configured"
  | "configured_unverified"
  | "misconfigured";

export interface VerificationDeliveryStatus {
  integrationKey: "verification_delivery_gateway";
  state: VerificationDeliveryConfigurationState;
  endpointConfigured: boolean;
  credentialConfigured: boolean;
  providerIdentity: null;
  connectivity: "not_tested";
  readOnlyHealthCheck: "not_defined";
  productionTransport: "https_required";
  explanation: string;
  limitations: string[];
}

type Environment = Readonly<Record<string, string | undefined>>;

/**
 * The current gateway contract only defines POST delivery. It does not define
 * a read-only health or provider-identification operation. This function
 * deliberately performs no network request and never returns endpoint/token.
 */
export function buildVerificationDeliveryStatus(
  env: Environment,
  nodeEnv: string | undefined = "production"
): VerificationDeliveryStatus {
  const endpoint = env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim() ?? "";
  const token = env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim() ?? "";
  const endpointConfigured = endpoint.length > 0;
  const credentialConfigured = token.length > 0;
  const limitations = [
    "The repository defines only an authenticated POST delivery operation; it does not define a read-only health or vendor-identification endpoint.",
    "The gateway provider and its downstream email/SMS vendors cannot be established from this contract.",
    "No delivery request, test message, recipient identifier, or verification code is sent during this diagnostic."
  ];

  if (!endpointConfigured && !credentialConfigured) {
    return {
      integrationKey: "verification_delivery_gateway",
      state: "not_configured",
      endpointConfigured,
      credentialConfigured,
      providerIdentity: null,
      connectivity: "not_tested",
      readOnlyHealthCheck: "not_defined",
      productionTransport: "https_required",
      explanation: "The verification gateway is not configured. Provider identity and connectivity remain unknown.",
      limitations
    };
  }

  if (!endpointConfigured || !credentialConfigured) {
    return {
      integrationKey: "verification_delivery_gateway",
      state: "partially_configured",
      endpointConfigured,
      credentialConfigured,
      providerIdentity: null,
      connectivity: "not_tested",
      readOnlyHealthCheck: "not_defined",
      productionTransport: "https_required",
      explanation: "Only part of the verification gateway configuration is present. Connectivity cannot be tested.",
      limitations
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return {
      integrationKey: "verification_delivery_gateway",
      state: "misconfigured",
      endpointConfigured,
      credentialConfigured,
      providerIdentity: null,
      connectivity: "not_tested",
      readOnlyHealthCheck: "not_defined",
      productionTransport: "https_required",
      explanation: "The configured verification gateway endpoint is not a valid URL.",
      limitations
    };
  }

  const isLoopback =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1";
  const invalidTransport = !["https:", "http:"].includes(parsed.protocol)
    || !parsed.hostname
    || Boolean(parsed.username || parsed.password || parsed.search || parsed.hash)
    || (parsed.protocol === "http:" && (nodeEnv === "production" || !isLoopback));
  if (invalidTransport || token.length < 32) {
    return {
      integrationKey: "verification_delivery_gateway",
      state: "misconfigured",
      endpointConfigured,
      credentialConfigured,
      providerIdentity: null,
      connectivity: "not_tested",
      readOnlyHealthCheck: "not_defined",
      productionTransport: "https_required",
      explanation: "The verification gateway settings do not meet the endpoint transport or credential requirements.",
      limitations
    };
  }

  return {
    integrationKey: "verification_delivery_gateway",
    state: "configured_unverified",
    endpointConfigured,
    credentialConfigured,
    providerIdentity: null,
    connectivity: "not_tested",
    readOnlyHealthCheck: "not_defined",
    productionTransport: "https_required",
    explanation: "Configuration is present, but the gateway's identity and connectivity remain unverified because no read-only health contract exists.",
    limitations
  };
}
