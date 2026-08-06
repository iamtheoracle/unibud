import { describe, it, expect } from "vitest";
import {
  inQuietHours,
  isMuted,
  scoreNotification,
  prioritize,
  PRIORITY_WEIGHT,
} from "@/lib/notifications/priorityEngine";

describe("priorityEngine", () => {
  describe("inQuietHours", () => {
    it("returns false when no quiet window is set", () => {
      expect(inQuietHours(new Date("2026-07-27T03:00:00"), {})).toBe(false);
    });

    it("detects a same-day window", () => {
      const prefs = { quiet_hours_start: "22:00", quiet_hours_end: "07:00" };
      expect(inQuietHours(new Date("2026-07-27T23:30:00"), prefs)).toBe(true);
      expect(inQuietHours(new Date("2026-07-27T08:00:00"), prefs)).toBe(false);
    });

    it("treats equal start/end as no quiet hours", () => {
      const prefs = { quiet_hours_start: "12:00", quiet_hours_end: "12:00" };
      expect(inQuietHours(new Date("2026-07-27T12:00:00"), prefs)).toBe(false);
    });
  });

  describe("isMuted", () => {
    it("returns true when the category is muted", () => {
      expect(isMuted({ type: "social", category: "social" }, { muted_categories: ["social"] })).toBe(true);
    });
    it("returns false when nothing is muted", () => {
      expect(isMuted({ type: "academic" }, {}), false).toBe(false);
    });
  });

  describe("scoreNotification", () => {
    it("silences muted notifications", () => {
      const r = scoreNotification(
        { priority: "critical", type: "social", created_date: new Date().toISOString() },
        { prefs: { muted_categories: ["social"] } }
      );
      expect(r.action).toBe("mute");
      expect(r.bucket).toBe("silent");
      expect(r.score).toBe(0);
    });

    it("scores a critical academic notification highly", () => {
      const r = scoreNotification(
        { priority: "critical", type: "academic", is_read: false, created_date: new Date().toISOString() },
        {}
      );
      expect(r.score).toBeGreaterThanOrEqual(85);
      expect(r.bucket).toBe("critical");
    });

    it("delays non-critical notifications during quiet hours", () => {
      const r = scoreNotification(
        { priority: "normal", type: "social", created_date: new Date().toISOString() },
        { now: new Date("2026-07-27T23:30:00"), prefs: { quiet_hours_start: "22:00", quiet_hours_end: "07:00" } }
      );
      expect(r.action).toBe("delay");
    });

    it("groups low/normal notifications into a digest when digest mode is on", () => {
      const r = scoreNotification(
        { priority: "low", type: "social", created_date: new Date().toISOString() },
        { prefs: { digest_mode: true } }
      );
      expect(r.action).toBe("group");
    });

    it("respects the PRIORITY_WEIGHT ordering (critical > high > normal > low)", () => {
      expect(PRIORITY_WEIGHT.critical).toBeGreaterThan(PRIORITY_WEIGHT.high);
      expect(PRIORITY_WEIGHT.high).toBeGreaterThan(PRIORITY_WEIGHT.normal);
      expect(PRIORITY_WEIGHT.normal).toBeGreaterThan(PRIORITY_WEIGHT.low);
    });
  });

  describe("prioritize", () => {
    it("buckets a mixed list into show/digest/delayed/muted", () => {
      const now = new Date();
      const list = [
        { priority: "critical", type: "academic", created_date: now.toISOString() },
        { priority: "low", type: "social", created_date: now.toISOString() },
        { priority: "normal", type: "marketplace", created_date: now.toISOString() },
      ];
      const out = prioritize(list, {
        now,
        prefs: { digest_mode: true, muted_categories: [] },
      });
      expect(Array.isArray(out.show)).toBe(true);
      expect(typeof out.digestCount).toBe("number");
      expect(out.muted.length).toBe(0);
    });

    it("mutes notifications whose category is muted", () => {
      const now = new Date();
      const out = prioritize(
        [{ priority: "high", type: "marketplace", created_date: now.toISOString() }],
        { now, prefs: { muted_categories: ["marketplace"] } }
      );
      expect(out.muted.length).toBe(1);
    });
  });
});