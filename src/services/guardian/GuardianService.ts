/**
 * Guardian Service: Safety, security, and policy enforcement boundary.
 * Performs pre-check and output-check on all requests.
 */

export interface GuardianPreCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface GuardianOutputCheckResult {
  safe: boolean;
  reason?: string;
}

export class GuardianService {
  /**
   * Pre-check: Validate request before processing.
   * Checks authentication, authorization, and request safety.
   */
  async preCheck(
    studentId: string | undefined,
    message: string,
    context: any
  ): Promise<GuardianPreCheckResult> {
    // Validate authentication
    if (!studentId) {
      return { allowed: false, reason: 'Unauthenticated request' };
    }

    // Validate message is present and non-empty
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return { allowed: false, reason: 'Empty message' };
    }

    // Validate message length (prevent abuse)
    if (message.length > 10000) {
      return { allowed: false, reason: 'Message too long' };
    }

    // Check for obvious harmful patterns (NOT a complete semantic safety system)
    // This is a baseline safeguard; production should use ML-based moderation
    const harmfulPatterns = [
      /\b(self-?harm|suicide|kill myself)\b/i,
      /\b(child abuse|exploitation|harm to children)\b/i,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(message)) {
        return { allowed: false, reason: 'Content violates safety policy' };
      }
    }

    return { allowed: true };
  }

  /**
   * Output-check: Validate response before returning to user.
   * Ensures output is safe, non-empty, and doesn't leak sensitive information.
   */
  async outputCheck(content: string): Promise<GuardianOutputCheckResult> {
    // Validate output is present and non-empty
    if (!content || content.trim().length === 0) {
      return { safe: false, reason: 'Empty output generated' };
    }

    // Check for accidental API key leaks (basic pattern)
    if (/(api[_-]?key|secret|token|password)\s*[:=]/i.test(content)) {
      return { safe: false, reason: 'Output contains sensitive information' };
    }

    // Check output length (prevent abuse)
    if (content.length > 50000) {
      return { safe: false, reason: 'Output too long' };
    }

    return { safe: true };
  }
}
