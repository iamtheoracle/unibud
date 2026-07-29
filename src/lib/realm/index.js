import { base44 } from "@/api/base44Client";
import { authService } from "./auth";
import { emailService } from "./email";
import { notificationService } from "./notifications";
import { profileService } from "./profile";
import { aiService } from "./ai";
import { governanceService } from "./governance";
import { storageService } from "./storage";
import { mediaService } from "./media";
import { searchService } from "./search";
import { analyticsService } from "./analytics";
import { authzService } from "./authz";
import { realtimeService } from "./realtime";
import { jobsService } from "./jobs";
import { schedulingService } from "./scheduling";
import { crashService } from "./crash";
import { featureFlagsService } from "./featureFlags";
import { cacheService } from "./cache";
import { configService } from "./config";

/**
 * My Realm Services — the shared backend platform powering UNIBUD, SOULYNC,
 * and every future My Realm application.
 *
 * Every app consumes this single `Realm` gateway instead of talking to
 * individual backend services (or Base44) directly. Today each service
 * delegates to Base44-managed infrastructure; the provider seam is isolated
 * per service so providers can be swapped (custom auth, SendGrid, Twilio…)
 * without changing application code.
 *
 *   import { Realm } from "@/lib/realm";
 *   await Realm.auth.login(email, password);
 *   await Realm.email.send({ to, subject, body });
 *   Realm.analytics.screen("Home");
 *
 * Bud is the only AI users interact with. Spark (Realm.ai) and Oracle
 * (Realm.governance) are internal engines — never surfaced in navigation.
 */
export const Realm = {
  auth: authService(base44),
  email: emailService(base44),
  notifications: notificationService(base44),
  profile: profileService(base44),
  ai: aiService(base44),
  governance: governanceService(base44),
  storage: storageService(base44),
  media: mediaService(base44),
  search: searchService(base44),
  analytics: analyticsService(base44),
  authz: authzService(base44),
  realtime: realtimeService(base44),
  jobs: jobsService(base44),
  scheduling: schedulingService(base44),
  crash: crashService(base44),
  featureFlags: featureFlagsService(base44),
  cache: cacheService(base44),
  config: configService(base44),
};

export default Realm;