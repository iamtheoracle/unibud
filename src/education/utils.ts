// Simple ID generator for in-memory storage
let counter = 0;
export function generateId(prefix: string): string {
  counter++;
  return `${prefix}_${Date.now()}_${counter}`;
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
