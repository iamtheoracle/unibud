/**
 * Bootstrap — wires the Spark Notification Engine to the Base44 SDK and the
 * Spark EventBus, and registers the default rule catalog. Call once at app
 * startup. Safe to call multiple times (idempotent).
 */
import { getSparkKernel } from "../namespace";
import { createBase44DeliveryAdapter } from "./delivery";
import { registerDefaultRules } from "./rules";

let bootstrapped = false;

export function initNotificationEngine(sdk: any): void {
  if (bootstrapped) return;
  bootstrapped = true;
  const kernel = getSparkKernel();
  const engine = kernel.notifications;
  engine.setDeliveryAdapter(createBase44DeliveryAdapter(sdk));
  engine.setEventBus(kernel.events);
  registerDefaultRules(engine);
}