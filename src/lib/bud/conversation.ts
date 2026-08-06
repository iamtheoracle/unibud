import type { BudSparkPort } from "./adapters/sparkPort";
import type { MemoryRecord } from "../spark/memory/interface";
import type { ConversationTurn, BudMessage } from "./types";

/**
 * Bud keeps no conversation store of its own. This module only reads
 * back what Spark already has in episodic memory and reshapes it into
 * a transcript. If Spark's memory is cleared, the transcript is gone —
 * there is no separate copy living in Bud.
 */
export function getTranscript(
  spark: BudSparkPort,
  sessionId: string,
  limit = 50
): ConversationTurn[] {
  const records = spark.memory
    .recall({ sessionId, kind: "episodic", limit: limit * 2 })
    .slice()
    .reverse(); // recall() returns newest-first; transcripts read oldest-first
  const turns: ConversationTurn[] = [];
  let pendingUser: BudMessage | null = null;
  for (const record of records) {
    const message = toMessage(record);
    if (message.role === "user") {
      pendingUser = message;
    } else if (pendingUser) {
      turns.push({ user: pendingUser, bud: message });
      pendingUser = null;
    }
  }
  return turns;
}

function toMessage(record: MemoryRecord): BudMessage {
  const isUser = record.tags?.includes("user");
  const content = record.content.replace(/^(User|Bud):\s*/, "");
  return {
    role: isUser ? "user" : "bud",
    content,
    timestamp: record.createdAt,
  };
}
