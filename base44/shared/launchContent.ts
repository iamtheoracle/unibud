/* ── Launch Content Engine — NEUTRALIZED ──
   No seed content generation. Real content comes from real users only.
   All generators return null/empty. Function signatures preserved for
   backward compatibility with seedCampusFeed and launchSimulation. */

export const SIM_AUTHORS: Record<string, any> = {};
export const POST_TEMPLATES: any[] = [];
export const COMMENT_TEMPLATES: any[] = [];
export const NOTIFICATION_TEMPLATES: any[] = [];
export const STORY_TEMPLATES: any[] = [];
export const STORY_IMAGES: string[] = [];

export function distributeReactions(_total: number): Record<string, number> { return {}; }

export function authorFields(_key: string): any {
  return { author_name: '', author_handle: '', author_role: 'student', is_verified: false, author_image: '' };
}

export function generatePost(): any { return null; }
export function generateComment(_post: any): any { return null; }
export function generateStory(): any { return null; }
export function generateNotification(): any { return null; }