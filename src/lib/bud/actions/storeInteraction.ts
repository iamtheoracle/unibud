import type { BudSparkPort } from "../adapters/sparkPort";

/**
 * Stores both sides of the exchange as episodic memory through Spark.
 * Bud holds no memory of its own — this is the only place a turn is
 * persisted, and it goes straight into Spark.
 */
export function storeInteraction(
  spark: BudSparkPort,
  input: {
    sessionId: string;
    userId: string;
    userMessage: string;
    budMessage: string;
  }
): void {
  spark.memory.remember({
    kind: "episodic",
    content: `User: ${input.userMessage}`,
    sessionId: input.sessionId,
    userId: input.userId,
    tags: ["conversation", "user"],
  });
  spark.memory.remember({
    kind: "episodic",
    content: `Bud: ${input.budMessage}`,
    sessionId: input.sessionId,
    userId: input.userId,
    tags: ["conversation", "bud"],
  });
}
