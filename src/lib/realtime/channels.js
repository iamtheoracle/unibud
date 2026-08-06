/**
 * UNIBUD OS v4 — Realtime Channel Definitions
 *
 * Maps every entity to a channel (Academic, Social, Identity, Services, System).
 * The Realtime Engine uses these to organize subscriptions, apply context priority,
 * and route events to the correct integrations (Spark, Orbit, Bud).
 *
 * References: OS Constitution, Layered Architecture, AI Constitution.
 */

export const CHANNELS = {
  academic: {
    id: "academic",
    label: "Academic",
    entities: [
      "Assignment", "Exam", "Course", "TimetableEntry", "Grade",
      "CalendarEvent", "Note", "TaskManagement", "StudyGroup",
      "StudyGroupResource", "Flashcard", "AcademicFile", "StudentGoal",
      "StudySession", "Project", "TutorProfile", "TutorBooking",
    ],
    contextPriority: {
      academic: "high",
      social: "low",
      hybrid: "medium",
    },
  },

  social: {
    id: "social",
    label: "Social",
    entities: [
      "QuadPost", "ShortVideo", "Story", "Podcast", "PodcastEpisode",
      "Highlight", "Community", "Club", "ClubDiscussion", "ClubElection",
      "ClubFinance", "ClubAttendance", "LostFoundItem",
    ],
    contextPriority: {
      academic: "low",
      social: "high",
      hybrid: "medium",
    },
  },

  identity: {
    id: "identity",
    label: "Identity",
    entities: [
      "StudentAchievement", "WellnessEntry", "PortfolioItem",
    ],
    contextPriority: {
      academic: "medium",
      social: "medium",
      hybrid: "medium",
    },
  },

  communication: {
    id: "communication",
    label: "Communication",
    entities: [
      "Message", "Conversation", "Follow", "FriendRequest",
    ],
    contextPriority: {
      academic: "medium",
      social: "high",
      hybrid: "high",
    },
  },

  services: {
    id: "services",
    label: "Services",
    entities: [
      "MarketplaceListing", "Opportunity", "ApplicationTracker",
      "Mentor", "MentorshipRequest",
    ],
    contextPriority: {
      academic: "low",
      social: "medium",
      hybrid: "medium",
    },
  },

  system: {
    id: "system",
    label: "System",
    entities: [
      "Notification", "StaffAnnouncement", "EmergencyNotice",
      "AcademicCalendarEvent", "ExamSchedule", "Faculty",
      "Department", "CourseCatalogEntry", "ExternalContent",
      "CampusEvent", "CampusLocation",
    ],
    contextPriority: {
      academic: "high",
      social: "high",
      hybrid: "high",
    },
  },
};

/**
 * Get the channel ID for a given entity name.
 */
export function getChannelForEntity(entityName) {
  for (const channel of Object.values(CHANNELS)) {
    if (channel.entities.includes(entityName)) return channel.id;
  }
  return null;
}

/**
 * Get all entities in a channel.
 */
export function getChannelEntities(channelId) {
  return CHANNELS[channelId]?.entities || [];
}

/**
 * Get the context priority for a channel under a given context.
 */
export function getChannelPriority(channelId, contextId) {
  return CHANNELS[channelId]?.contextPriority?.[contextId] || "medium";
}

/**
 * Check if an entity belongs to a channel that is high-priority under the current context.
 */
export function isHighPriorityEntity(entityName, contextId) {
  const channelId = getChannelForEntity(entityName);
  if (!channelId) return false;
  return getChannelPriority(channelId, contextId) === "high";
}