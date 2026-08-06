/**
 * Card Ranker — Bud's context-driven card prioritization.
 *
 * Bud decides:
 *   - Which cards should appear first.
 *   - Which cards need attention.
 *   - Which cards should be highlighted.
 *
 * Context signals:
 *   - Assignments due today/tomorrow → boost AssignmentsCard
 *   - Exams upcoming → boost ExamsCard
 *   - New campus announcements → boost FeedCard
 *   - Upcoming events → boost EventsCard
 *   - Time of day (morning → schedule; evening → assignments/exams)
 *   - User memory preferences (from BudMemory)
 *
 * The ranker returns cards sorted by final priority, with boosted cards
 * moved up. Base priority is preserved as a tiebreaker.
 */

/**
 * Rank cards for a workspace based on context signals.
 *
 * @param {array} cards — card definitions from the registry
 * @param {object} context — { assignmentsDue, examsUpcoming, eventsToday, newAnnouncements, hour, userPrefs }
 * @returns {array} — cards sorted by final priority (most important first)
 */
export function rankCards(cards, context = {}) {
  const {
    assignmentsDue = 0,
    examsUpcoming = 0,
    eventsToday = 0,
    newAnnouncements = 0,
    hour = new Date().getHours(),
  } = context;

  return cards
    .map((card) => {
      let boost = 0;
      let attention = false;

      // Assignment due today → boost assignments card to top
      if (card.id === "assignments" && assignmentsDue > 0) {
        boost -= Math.min(assignmentsDue * 2, 6);
        attention = true;
      }

      // Exam tomorrow → boost exams card
      if (card.id === "exams" && examsUpcoming > 0) {
        boost -= Math.min(examsUpcoming * 3, 6);
        attention = true;
      }

      // New announcements → boost feed
      if (card.id === "feed" && newAnnouncements > 0) {
        boost -= 2;
        attention = true;
      }

      // Events today → boost events card
      if (card.id === "events" && eventsToday > 0) {
        boost -= 1;
      }

      // Time-of-day awareness
      // Morning (6-11): schedule is most relevant
      if (card.id === "today_schedule" && hour >= 6 && hour < 12) {
        boost -= 1;
      }
      // Evening (17-22): assignments & exams are more relevant
      if ((card.id === "assignments" || card.id === "exams") && hour >= 17 && hour < 23) {
        boost -= 1;
      }

      return {
        ...card,
        finalPriority: card.priority + boost,
        attention,
      };
    })
    .sort((a, b) => a.finalPriority - b.finalPriority);
}

/**
 * Build context signals from data queries (called by the workspace renderer).
 * Returns a context object the ranker can use.
 */
export function buildContext({
  assignments = [],
  exams = [],
  events = [],
  announcements = [],
} = {}) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.toDateString() === now.toDateString();
  };

  const isTomorrow = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.toDateString() === tomorrow.toDateString();
  };

  const assignmentsDue = (assignments || []).filter(
    (a) => (a.status === "pending" || a.status === "in_progress") && (isToday(a.due_date) || isTomorrow(a.due_date))
  ).length;

  const examsUpcoming = (exams || []).filter(
    (e) => {
      const d = new Date(e.date || e.start_time || "");
      const diff = (d - now) / (1000 * 60 * 60 * 24);
      return diff >= -1 && diff <= 2; // within 2 days
    }
  ).length;

  const eventsToday = (events || []).filter(
    (e) => isToday(e.date || e.start_time)
  ).length;

  const newAnnouncements = (announcements || []).filter(
    (a) => {
      if (!a.created_date) return false;
      const d = new Date(a.created_date);
      return (now - d) / (1000 * 60 * 60) < 24; // within 24 hours
    }
  ).length;

  return {
    assignmentsDue,
    examsUpcoming,
    eventsToday,
    newAnnouncements,
    hour: now.getHours(),
  };
}