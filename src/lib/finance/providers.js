// Milestone 26 → 27 bridge: the financial services now resolve the active
// provider through the Provider Registry instead of a hardcoded mock.
// Business logic still calls PaymentProvider.get() etc. — the registry is
// the single switchboard. Swapping a provider (Oracle / Architect) changes
// the active adapter here, with zero changes to business logic.
import * as Registry from "@/lib/providers";

export const PROVIDERS = Registry.metadata("banking");
export const PaymentProvider = { get: () => Registry.getActive("banking"), set: (k) => Registry.setActive("banking", k), list: () => Registry.metadata("banking") };
export const CardProvider = { get: () => Registry.getActive("wallet_card"), set: (k) => Registry.setActive("wallet_card", k), list: () => Registry.metadata("wallet_card") };
export const KycProvider = { get: () => Registry.getActive("kyc"), set: (k) => Registry.setActive("kyc", k), list: () => Registry.metadata("kyc") };
export const NotificationProvider = { get: () => Registry.getActive("notification"), set: (k) => Registry.setActive("notification", k), list: () => Registry.metadata("notification") };
export const StorageProvider = { get: () => Registry.getActive("storage"), set: (k) => Registry.setActive("storage", k), list: () => Registry.metadata("storage") };
export const AIProvider = { get: () => Registry.getActive("ai"), set: (k) => Registry.setActive("ai", k), list: () => Registry.metadata("ai") };