export interface SecurityCheckResult {
  safe: boolean;
  reasons: string[];
}

export interface SecurityService {
  /** Basic heuristic scan for common injection/scam patterns. */
  checkInput(text: string): SecurityCheckResult;
}
