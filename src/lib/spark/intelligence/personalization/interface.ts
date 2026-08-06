export interface UserPreference {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface PersonalizationService {
  setPreference(userId: string, key: string, value: unknown): UserPreference;
  getPreference(userId: string, key: string): UserPreference | undefined;
  getAllPreferences(userId: string): UserPreference[];
}
