import React from "react";
import { motion } from "framer-motion";
import WorkspaceCard from "./WorkspaceCard";

const EASE = [0.16, 1, 0.3, 1];

/**
 * WorkspaceRenderer — renders cards in priority order.
 *
 * Pipeline:
 *   Load User Context → Load Available Cards → Bud ranks cards → Render cards
 *
 * The renderer accepts pre-ranked cards (from the card ranker) and renders
 * each one inside a WorkspaceCard shell with its lazy-loaded component.
 *
 * Props:
 *   - cards: array of ranked card definitions (with `attention` flag)
 *   - cardProps: object mapping card id → extra props to pass to the card component
 *   - onRefreshCard: function(cardId) → optional refresh handler
 */
export default function WorkspaceRenderer({ cards, cardProps = {}, onRefreshCard }) {
  return (
    <div className="space-y-3">
      {cards.map((card, i) => {
        const CardComponent = card.component;
        const extraProps = cardProps[card.id] || {};
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
          >
            <WorkspaceCard
              card={card}
              attention={card.attention}
              defaultExpanded={i < 2}
              onRefresh={onRefreshCard ? () => onRefreshCard(card.id) : undefined}
            >
              <CardComponent {...extraProps} />
            </WorkspaceCard>
          </motion.div>
        );
      })}
    </div>
  );
}