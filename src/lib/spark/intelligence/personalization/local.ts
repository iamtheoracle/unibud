import type { PersonalizationService, UserPreference } from "./interface";

/** In-memory per-user preference store. */
export class LocalPersonalizationService implements PersonalizationService {
  private preferences = new Map<string, Map<string, UserPreference>>();

  setPreference(userId: string, key: string, value: unknown): UserPreference {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, new Map());
    }
    const pref: UserPreference = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };
    this.preferences.get(userId)!.set(key, pref);
    return pref;
  }

  getPreference(userId: string, key: string): UserPreference | undefined {
    return this.preferences.get(userId)?.get(key);
  }

  getAllPreferences(userId: string): UserPreference[] {
    return Array.from(this.preferences.get(userId)?.values() ?? []);
  }
}
