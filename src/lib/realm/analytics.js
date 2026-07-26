/**
 * Analytics Service — screen usage, feature adoption, session length,
 * navigation flow, performance, errors. Respects user privacy (opt-out).
 */
const OPT_KEY = "realm.analytics.optIn";
const optedIn = () => { try { return localStorage.getItem(OPT_KEY) !== "0"; } catch { return true; } };

export function analyticsService(base44) {
  return {
    track: (eventName, properties) => {
      if (optedIn()) return base44.analytics.track({ eventName, properties });
    },
    screen: (name) => {
      if (optedIn()) base44.analytics.track({ eventName: "screen_view", properties: { name } });
    },
    feature: (name, properties) => {
      if (optedIn()) base44.analytics.track({ eventName: "feature_use", properties: { name, ...properties } });
    },
    isOptedIn: () => optedIn(),
    setOptIn: (v) => { try { localStorage.setItem(OPT_KEY, v ? "1" : "0"); } catch {} },
  };
}