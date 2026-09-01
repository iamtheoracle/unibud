# UNIBUD COMMUNICATION PLATFORM SPECIFICATION

> One unified communication platform that feels premium, effortless, and trusted.
> Messaging, Communities, Channels, Study Groups, and Campus communication are one connected experience.
> Inspired by the smoothness of leading messaging applications — without copying their branding, layouts, or identity.

---

## 1. CORE PRINCIPLES

| Principle | Rule |
|---|---|
| Unified | All communication types share one consistent messaging experience. |
| Fast & Responsive | Smooth scrolling, instant message delivery, background uploads. |
| Original | UNIBUD communication identity — never copies another app's design. |
| Connected | Every message feels connected to the broader university experience. |
| Private | Privacy protected by design. |
| Safe | Intelligent moderation protects the academic environment. |
| Offline-aware | Graceful offline handling with sync-on-reconnect. |

---

## 2. CONVERSATION TYPES

All conversation types share one consistent messaging experience.

| Type | Description |
|---|---|
| **One-to-One** | Direct message between two users. |
| **Group** | Multi-person conversation. |
| **Course Discussion** | Course-scoped discussion (students + lecturer). |
| **Study Group** | Collaborative study space. |
| **Project Team** | Project-scoped collaboration. |
| **Club / Society** | Community conversation. |
| **Organization** | Organization-scoped communication. |
| **Alumni Group** | Alumni networking. |
| **University Announcements** | University-wide broadcast channel. |
| **Faculty Announcements** | Faculty-scoped broadcast. |
| **Department Announcements** | Department-scoped broadcast. |
| **Verified Institutional Channels** | Official verified communication. |

---

## 3. MESSAGE TYPES

| Type | Support |
|---|---|
| **Text** | Rich text with formatting. |
| **Voice Messages** | Recorded voice notes. |
| **Voice Notes** | Short audio clips. |
| **Voice Calls** | Audio calls (where supported). |
| **Video Calls** | Video calls (where supported). |
| **Images** | Photos and images. |
| **Videos** | Video files. |
| **PDFs** | Document sharing. |
| **Word Documents** | .docx files. |
| **PowerPoint** | .pptx files. |
| **Spreadsheets** | .xlsx/.csv files. |
| **Compressed Files** | .zip/.rar archives. |
| **Code Snippets** | Syntax-highlighted code. |
| **Mathematical Formulas** | Equation rendering. |
| **Locations** | Map locations. |
| **Contacts** | Contact card sharing. |
| **Links** | Rich link previews. |
| **Future File Types** | Extensible to new formats. |

### Large Uploads
- Continue safely in the background while users continue using the app.
- Progress indication without blocking the interface.
- Resume on reconnect if interrupted.

---

## 4. MESSAGE REQUESTS

Intelligent Message Requests protect students from unwanted contact.

### 4.1 Flow
1. Unknown users never directly enter a student's inbox.
2. New conversations from unknown users appear in **Message Requests**.
3. Student can: **Accept**, **Ignore**, **Delete**, **Block**, or **Report**.
4. Once accepted, the conversation becomes a normal chat.
5. Spam and abusive messages are filtered before reaching users whenever possible.

### 4.2 Rules
- Message Requests are separate from the main inbox.
- No read receipts sent for messages in requests.
- Student's online status is not visible to users in requests.
- Blocking prevents all future contact.

---

## 5. MESSAGE FEATURES

| Feature | Description |
|---|---|
| **Replies** | Reply to a specific message (threaded). |
| **Forwarding** | Forward messages to other conversations. |
| **Editing** | Edit sent messages (with edit history indicator). |
| **Deleting** | Delete messages (for self or for everyone, within time limits). |
| **Copying** | Copy message text. |
| **Starring** | Star important messages for later reference. |
| **Pinning** | Pin important messages in a conversation. |
| **Bookmarking** | Bookmark messages for personal reference. |
| **Searching** | Search within conversations and across all conversations. |
| **Archiving** | Archive conversations without deleting. |
| **Muting** | Mute notifications for a conversation. |
| **Blocking** | Block users from all contact. |
| **Reporting** | Report messages for moderation. |
| **Reactions** | React to messages with emojis. |
| **Mentions** | @mention users in group conversations. |
| **Hashtags** | #hashtags for topic organization. |
| **Polls** | Create polls in conversations. |
| **Announcements** | Broadcast announcements in channels. |
| **Scheduled Messages** | Schedule messages for future delivery. |
| **Draft Saving** | Unsent messages saved as drafts (cross-device sync). |
| **Typing Indicators** | Show when someone is typing (privacy-controlled). |
| **Read Receipts** | Show when messages are read (privacy-controlled). |
| **Online Status** | Show online presence (privacy-controlled). |
| **Last Seen** | Show last active time (privacy-controlled). |
| **Sync** | Conversations synchronize across every device. |

---

## 6. DISAPPEARING MESSAGES & PRIVACY

### 6.1 Disappearing Messages
- Users can enable disappearing messages per conversation.
- Configurable duration (1 hour, 24 hours, 7 days, 30 days, etc.).
- Both parties are notified when disappearing messages are enabled.
- Messages are permanently deleted after the duration.

### 6.2 Privacy Controls
Users control:
- Read receipts (on/off globally or per conversation).
- Typing indicators (on/off).
- Online visibility (who can see when they're online).
- Last seen (who can see last active time).
- Profile visibility (who can see profile photo and info).
- Message permissions (who can message them).

---

## 7. COMMUNITIES

Premium communities focused on real education and student life. Never fake.

### 7.1 Community Types

| Type | Description |
|---|---|
| **University Communities** | University-wide communities |
| **Faculty Communities** | Faculty-scoped |
| **Department Communities** | Department-scoped |
| **Programme Communities** | Programme/cohort-specific |
| **Course Communities** | Course-specific discussions |
| **Study Groups** | Collaborative study |
| **Project Groups** | Project collaboration |
| **Clubs** | Student clubs |
| **Societies** | Academic and interest societies |
| **Alumni Communities** | Alumni networking |
| **International Student Communities** | International student support |
| **Research Groups** | Research collaboration |
| **Verified Organizations** | Organization-led communities |

### 7.2 Community Features

| Feature | Description |
|---|---|
| **Rich Posts** | Text, images, videos, voice notes, documents, PDFs |
| **Announcements** | Pinned community announcements |
| **Articles** | Long-form posts |
| **Polls** | Community polls and surveys |
| **Events** | Community events and meetups |
| **Assignments** | Community-shared assignments (study groups) |
| **Shared Notes** | Collaborative note-taking |
| **Shared Files** | File repository |
| **Comments** | Threaded discussions |
| **Reactions** | Post and comment reactions |
| **Bookmarks** | Save important community content |
| **Hashtags** | Topic organization |
| **Mentions** | Member mentions |
| **Moderation Tools** | For community admins and moderators |
| **Search** | Search within community |
| **Pinned Content** | Important posts pinned to top |

### 7.3 Community Rules
- Clear ownership and moderation.
- Privacy controls (public, university-only, invite-only, request-to-join).
- Only real users or verified institutions can create communities.
- No fake communities or fake activity.
- If no communities exist, show premium onboarding encouraging discovery or creation.

### 7.4 Collaborative Study Spaces
- Share notes, solve problems together.
- Organize revision sessions.
- Schedule meetings.
- Assign project tasks.
- Prepare for examinations.
- StudyBuddy assists naturally when invited — without dominating conversations.

---

## 8. CHANNELS

Official communication channels for broadcasting.

### 8.1 Channel Types
- University channels.
- Faculty channels.
- Department channels.
- Lecturer channels.
- Verified organization channels.

### 8.2 Channel Rules
- Broadcast announcements without unnecessary discussion (when appropriate).
- Students can follow or mute channels individually.
- Channels are one-way (broadcast) but can optionally allow Q&A.
- Verified channels have a verification badge.
- Channel content is searchable.

---

## 9. MODERATION SYSTEM

One intelligent moderation system across all communication.

### 9.1 Detected Content
| Type | Action |
|---|---|
| **Spam** | Filtered before delivery. Repeat offenders restricted. |
| **Harmful Content** | Detected and flagged for review. |
| **Duplicate Posts** | Detected and collapsed. |
| **Impersonation Attempts** | Blocked and reported. |
| **Malicious Links** | Scanned and blocked. |
| **Abusive Behaviour** | Flagged, user restricted, reviewed by moderators. |

### 9.2 Moderation Principles
- Protect freedom of discussion while maintaining a safe academic environment.
- Moderation decisions are transparent and reviewable.
- Users can appeal moderation decisions.
- Moderation actions are audit-logged.
- Community moderators have scoped tools (their communities only).
- Platform moderators handle cross-community issues.

---

## 10. NOTIFICATIONS

Unified notification experience across messages, communities, and channels.

### 10.1 Features
- Intelligently group similar events (e.g., "3 new messages from CSC 301 group").
- Prioritize important updates.
- Reduce unnecessary interruptions.
- Users control every notification category independently.

### 10.2 Notification Categories
| Category | Examples |
|---|---|
| **Direct Messages** | New message, reaction, reply |
| **Community** | New post, mention, comment on your post |
| **Channel** | New announcement |
| **Mentions** | @mention in any conversation |
| **Reactions** | Someone reacted to your message |

---

## 11. MULTILINGUAL SUPPORT

- Multilingual conversations where available.
- Translate supported messages without modifying original content.
- Preserve formatting, attachments, and conversation context during translation.
- Translation indicator on translated messages.
- Original text accessible by tapping.

---

## 12. PRIVACY & SECURITY

### 12.1 Communication Privacy
- Secure communication methods where supported.
- Private conversations never exposed to administrators.
- Exception: lawful processes, user reporting, or explicit authorization.
- Audit trails for administrative actions without compromising user privacy.

### 12.2 Search Privacy
- Intelligent search across every conversation, community, attachment, and shared resource.
- Search is private to the user.
- No cross-user search of private conversations.

---

## 13. INTEGRATION WITH PLATFORM

Messages, communities, and channels integrate naturally with:

| Module | Integration |
|---|---|
| **Courses** | Course discussions linked to course pages |
| **Calendar** | Events from conversations sync to calendar |
| **Assignments** | Assignment discussions and submissions |
| **Events** | Event RSVPs and reminders |
| **Marketplace** | Listing inquiries and transactions |
| **Career Centre** | Job and opportunity discussions |
| **Scholarships** | Scholarship discussions and Q&A |
| **StudyBuddy** | Bud assists in collaborative spaces when invited |
| **Future Modules** | Extensible integration framework |

Every message feels connected to the broader university experience — never existing in isolation.

---

## 14. ADAPTIVE LAYOUT

| Device | Messaging Layout |
|---|---|
| **Mobile** | Full-screen conversation, swipe back to list, swipe actions, bottom input bar |
| **Tablet** | Split view: conversation list + active conversation |
| **Desktop** | Three-pane: conversation list + active conversation + context panel (shared files, pinned messages, member list) |
| **Large** | Expanded three-pane with additional context panels |

---

## 15. PERFORMANCE & OFFLINE

### 15.1 Performance
- Smooth scrolling (virtualized message lists).
- Instant message delivery with optimistic UI.
- Background uploads for large files.
- Message pagination (load older messages on scroll up).
- Image and video compression on upload.
- Lazy loading of media.

### 15.2 Offline Handling
- Queue messages for sending when offline.
- Show pending status for queued messages.
- Sync sent messages when reconnected.
- Cache recent conversations for offline reading.
- Draft messages saved locally and synced across devices.
- Graceful error handling with retry options.

---

> **UNIBUD Communication — one connected, premium, trusted experience that makes every conversation feel effortless and connected to university life.**