# Product Requirements Document (PRD)
# Appinium Poker

**Version:** 1.0
**Date:** 2026-02-14
**Author:** Product Team
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
A custom Planning Poker web application for the Appinium team to conduct Scrum estimation sessions with team-specific humor, memes, and branding. The app provides real-time collaborative estimation using Fibonacci story points, with a unique team culture twist.

### 1.2 Problem Statement
Existing Planning Poker tools are either:
- Paid with unnecessary features
- Generic without team personalization
- Missing key features like Confidence Voting

### 1.3 Solution
Build a lightweight, free, self-hosted Planning Poker application that:
- Includes team memes and inside jokes throughout the experience
- Supports standard Scrum estimation workflows
- Adds Confidence Voting for sprint commitment
- Maintains session history for retrospectives

---

## 2. Target Audience

### 2.1 Primary Users
- **Scrum Master / PM**: Creates and moderates games, reveals cards, manages issues
- **Team Members**: Developers, QA, designers participating in estimation

### 2.2 Team Size
- Up to 10 participants per session
- Small, close-knit team with shared context and humor

### 2.3 User Context
- Non-developers who need simple, intuitive UX
- Remote team members joining via shared link
- Quick access without registration barriers

---

## 3. Core Features

### 3.1 Landing Page
| Requirement | Description |
|-------------|-------------|
| Hero Section | Bold headline, value proposition, team branding |
| Start Game CTA | Prominent button to begin game creation |
| Branding | Appinium colors and logo |
| Optional | Quick tutorial or feature highlights |

### 3.2 Game Creation & Configuration
Based on reference (Screenshot 1):

| Setting | Options | Default |
|---------|---------|---------|
| Game Name | Text input with emoji picker | Empty |
| Voting System | Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, coffee) | Fibonacci |
| Who Can Reveal | All players / Moderator only | All players |
| Who Can Manage Issues | All players / Moderator only | All players |
| Auto-reveal Cards | Toggle | Off |
| Enable Fun Features | Toggle (memes, reactions) | On |
| Show Average | Toggle | On |
| Countdown Animation | Toggle | On |

**Output:** Generate unique game URL for sharing

### 3.3 Player Join Flow
Based on reference (Screenshot 2):

| Element | Description |
|---------|-------------|
| Display Name Input | Text field with emoji picker |
| Spectator Mode Toggle | Join without voting |
| Continue Button | Enter game after name input |
| Avatar Selection | Custom team member avatars (meme-style) |

**No registration required** — anonymous play by design

### 3.4 Game Room (Main Poker Table)
Based on reference (Screenshot 3):

#### 3.4.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Game Name ▾        [User] ▾  [Invite]  [Issues]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    ┌─────────────┐                       │
│     [Player]       │             │       [Player]        │
│                    │   TABLE     │                       │
│     [Player]       │  [Reveal]   │       [Player]        │
│                    │             │                       │
│                    └─────────────┘                       │
│                       [Player]                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Choose your card: [0][1][2][3][5][8][13][21][34]...    │
└─────────────────────────────────────────────────────────┘
```

#### 3.4.2 Components

| Component | Functionality |
|-----------|---------------|
| Poker Table | Central element, shows Reveal Cards button |
| Player Seats | Around table, show name + card (back or value) |
| Card Selection | Row of Fibonacci values at bottom |
| Selected Card | Visual highlight when picked |
| Player Card Status | Shows if voted (card back) or waiting |

#### 3.4.3 Card Reveal Flow
1. Players select cards (shown face-down to others)
2. Moderator/anyone clicks "Reveal Cards"
3. Optional: 3-2-1 countdown animation
4. All cards flip simultaneously
5. **Meme appears** based on voting consensus/chaos
6. Average displayed if enabled

#### 3.4.4 Meme Integration Points
| Trigger | Meme Type |
|---------|-----------|
| Card flip reveal | Random team meme overlay |
| All same vote | "Agreement" celebration meme |
| Wide spread votes | "Chaos" meme |
| Someone picks coffee | "Break time" meme |
| Someone picks ? | "Confusion" meme |
| Custom card backs | Team member caricatures |
| Player avatars | Custom team photos/drawings |

### 3.5 Issues/Tickets Panel
Based on reference (Screenshot 4):

| Element | Description |
|---------|-------------|
| Issues Sidebar | Collapsible panel on right |
| Issue Card | ID, title, status badge, final score |
| Voting Now Badge | Highlights current issue |
| Add Issue Button | Quick add for new tickets |
| Issue Actions | Edit, delete, skip, re-vote |
| Points Summary | Total issues, total points |

**Issue Fields:**
- ID (auto-generated or custom like "PP-1")
- Title/description
- Status: Pending / Voting / Voted
- Final score (after reveal)
- Notes (optional)

### 3.6 Confidence Vote (Fist of Five)
Separate voting mode for sprint commitment:

| Element | Description |
|---------|-------------|
| Trigger Button | "Confidence Vote" in header/menu |
| Scale | 1-5 fingers (fists to high-five) |
| Question | "How confident are you in this sprint?" |
| Display | All votes revealed simultaneously |
| Output | Average confidence, distribution chart |

**Flow:**
1. SM clicks "Start Confidence Vote"
2. Team members select 1-5
3. Results reveal with team average
4. Discussion if average < 3

### 3.7 Invite Players
| Feature | Description |
|---------|-------------|
| Copy Link Button | One-click copy game URL |
| QR Code | Optional for in-person meetings |
| Share Options | Slack, Teams integration (future) |

---

## 4. Data & Persistence

### 4.1 Session Storage
All game data stored in Supabase (PostgreSQL):

| Entity | Fields |
|--------|--------|
| Game | id, name, settings, created_at, host_id |
| Player | id, game_id, name, avatar, is_spectator |
| Issue | id, game_id, title, status, final_score |
| Vote | id, issue_id, player_id, value, timestamp |
| ConfidenceVote | id, game_id, player_id, value, timestamp |

### 4.2 Real-time Sync
- Supabase Realtime for live updates
- Player joins/leaves
- Card selections
- Vote reveals
- Issue changes

### 4.3 History & Export
| Feature | Description |
|---------|-------------|
| Session History | Browse past games |
| Export CSV | Download session results |
| Statistics | Average points, voting patterns |

---

## 5. Technical Requirements

### 5.1 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Backend/DB | Supabase (PostgreSQL + Realtime) |
| Hosting | Vercel |
| State | React Context or Zustand |

### 5.2 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (responsive design)

### 5.3 Performance
- Initial load < 3s
- Real-time latency < 500ms
- Support 10 concurrent users per room

---

## 6. Design Requirements

### 6.1 Brand Colors (Appinium)
```css
:root {
  --primary-purple: #5533ff;
  --accent-gold: #FFD700;
  --text-navy: #4e5b73;
  --bg-dark: rgba(16, 24, 32, 0.9);
  --bg-darker: #0a0f14;
  --white: #ffffff;
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
}
```

### 6.2 Design Principles
- **Dark Theme**: Primary, matches dev/tech aesthetic
- **Playful but Professional**: Memes add fun, UX stays clean
- **Mobile-First**: Works on phones for remote team members
- **Accessibility**: WCAG 2.1 AA compliance

### 6.3 UI Language
- Interface: **English only**
- Team memes: Can include Russian/English mix

---

## 7. Future Considerations (V2+)

### 7.1 Integrations
- Jira import/export
- Linear integration
- Slack notifications

### 7.2 Features
- Timer for votes
- Custom voting scales (T-shirt sizes, etc.)
- Team templates
- Persistent teams with saved settings
- Retrospective mode

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Session completion rate | > 90% |
| Average session duration | < 30 min |
| Player join time | < 10 seconds |
| Team adoption | 100% of planning sessions |

---

## 9. User Stories

### Epic: Game Setup
```
As a Scrum Master
I want to create a new game with custom settings
So that I can run an estimation session for my team
```

**Acceptance Criteria:**
- [ ] Can set game name
- [ ] Can choose voting system
- [ ] Can configure permissions
- [ ] Get shareable link after creation

### Epic: Estimation
```
As a team member
I want to vote on story points
So that I can contribute to sprint planning
```

**Acceptance Criteria:**
- [ ] See available cards clearly
- [ ] Can change vote before reveal
- [ ] See other players' vote status (voted/waiting)
- [ ] See results after reveal

### Epic: Issue Management
```
As a Scrum Master
I want to add and manage backlog items
So that we can estimate the entire sprint
```

**Acceptance Criteria:**
- [ ] Can add issues with title
- [ ] Can select which issue to vote on
- [ ] See final scores on issues
- [ ] Can export results

### Epic: Confidence Voting
```
As a Scrum Master
I want to run a Fist of Five vote
So that I can gauge team confidence in the sprint
```

**Acceptance Criteria:**
- [ ] Separate button for confidence vote
- [ ] 1-5 scale for voting
- [ ] See team average
- [ ] Results don't mix with story points

### Epic: Fun Features
```
As a team member
I want to see team memes during estimation
So that planning sessions are more enjoyable
```

**Acceptance Criteria:**
- [ ] Memes appear on card reveal
- [ ] Custom avatars for team members
- [ ] Playful animations throughout

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real-time sync issues | High | Fallback polling, reconnection logic |
| Supabase free tier limits | Medium | Monitor usage, optimize queries |
| Meme content management | Low | Admin panel for uploads (future) |
| Player disconnection | Medium | Grace period, reconnection handling |

---

## 11. Decisions Made

| Question | Decision |
|----------|----------|
| App Name | **Appinium Poker** |
| Meme Library | Hardcoded in codebase, update via code changes |
| Game Expiration | **Indefinite** — sessions persist forever |
| Issue Import | Manual entry only for V1 |

## 12. Open Questions

1. **Moderator Transfer**: Can moderator role be passed to another player?
2. **Max players**: Soft limit at 10 or hard enforce?

---

## 13. Appendix

### A. Design Prototype
**Location:** `prototypes/prototype-appinium-light.html`

Interactive HTML prototype with all screens:
- Landing page (minimal: badge, title, Start Game button)
- Create Game form (settings, toggles)
- Join Game (name input, avatar selection with team photos)
- Game Room (poker table, player seats, card selector, issues sidebar)
- Confidence Vote modal

**Design decisions from prototype:**
- Light theme with Appinium colors (#5533ff purple, #ffc107 yellow)
- No header/nav on Landing, Create, Join screens
- Header only in Game Room (logo, game name, invite, user menu)
- Avatar selection uses team member photos (placeholder: randomuser.me)
- Clean, modern UI with Space Grotesk font

### B. Reference Screenshots
1. Game creation form
2. Display name entry
3. Main game room with cards
4. Issues sidebar with voting status

### B. Competitor Analysis
- planningpokeronline.com (primary reference)
- Pointing Poker
- Scrumpy Poker

### C. Glossary
- **Story Points**: Abstract measure of effort/complexity
- **Fibonacci**: Sequence used for estimation (1,2,3,5,8,13...)
- **Fist of Five**: Confidence voting 1-5 scale
- **Sprint**: Fixed time period for work completion
- **Grooming/Refinement**: Session to estimate backlog items
