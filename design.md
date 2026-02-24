# TimeKind: Routine Buddy — Interface Design

## Brand & UX Principles

**Tone:** Kind, non-judgmental, calm. No productivity pressure, no guilt, no streaks.
**Language:** Avoid "failed", "late", "wrong", "behind", "time's up". Prefer "expanded", "shifted", "went longer than expected", "that happens", "useful to know".
**Accessibility:** Large tap targets (min 44px), high contrast text, minimal motion with reduced motion toggle.

---

## Color Palette

### Light Theme
- Background: `#F7F5F2` (off-white stone)
- Card: `#FFFFFF`
- Text Primary: `#1E1E1E` (charcoal)
- Text Secondary: `#5A5A5A`
- Border: `#E6E1DA`
- Accent: `#6B6B6B` (muted slate)
- Success Soft: `#E9EFEA`
- Warning Soft: `#F2EEE6`

### Dark Theme
- Background: `#121212`
- Card: `#1C1C1C`
- Text Primary: `#F2F2F2`
- Text Secondary: `#B8B8B8`
- Border: `#2A2A2A`
- Accent: `#A6A6A6`
- Success Soft: `#1F2A22`
- Warning Soft: `#2A261F`

### Typography
- Headings: 18–22pt semibold
- Body: 14–16pt regular
- Microcopy: 12–13pt regular

### Components
- Cards: Rounded corners 14–16px, subtle border, no heavy shadows
- Primary Button: Filled with accent, text white/light
- Secondary Button: Outline with border

---

## Screen List

| # | Screen | Purpose |
|---|--------|---------|
| 0 | Splash / Router | Logo display, check onboarding state, route accordingly |
| 1 | Onboarding (3 slides) | Introduce app philosophy, "Get started" CTA |
| 2 | Home Dashboard | Today's insight, this week summary, recent tasks, "Start a task" CTA |
| 3 | Start Task | Form: task name, estimated minutes, energy level, category |
| 4 | Active Timer | Melt progress bar, pause/resume, extend, finish controls |
| 5 | Complete Task | Estimated vs actual, accuracy %, gentle message, reflection input |
| 6 | Breathing Reset | 30s expanding/contracting circle, breathe in/out prompts |
| 7 | Insights | Accuracy trend chart, patterns by category/energy/time-of-day |
| 8 | Weekly Story | Auto-generated paragraph from last 7 days of data |
| 9 | Settings | Theme, sound, notifications, sync toggle, backup export/import |

---

## Primary Content & Functionality Per Screen

### Screen 0: Splash / Router
- Centered app logo + "TimeKind: Routine Buddy" text
- Reads `hasOnboarded` from local storage
- Routes to Onboarding (if false) or Home (if true)

### Screen 1: Onboarding
- 3 horizontal swipeable slides with centered text
- Slide 1: "Time feels different for everyone."
- Slide 2: "Estimate → watch time flow → notice patterns."
- Slide 3: "No pressure. No streaks. Just a kinder view of time."
- "Get started" button on last slide
- Dot indicators for current slide position

### Screen 2: Home Dashboard
- Top: Large "Start a task" button (primary CTA)
- Card A — Today's Insight: Single line derived from last 24h tasks
- Card B — This Week: avgAccuracy7d, bestTimeOfDay, topUnderestimatedCategory
- Card C — Recent Tasks: Last 3 non-deleted tasks showing name + estimated vs actual
- Bottom tab bar: Home | Insights | Settings

### Screen 3: Start Task (Modal/Push screen)
- Task Name text input (required)
- Estimated Minutes picker (5–240, step 5, custom entry allowed)
- Energy Level: 3 selectable buttons (High / Medium / Low)
- Category: Optional dropdown with "Add new category" option
- "Start" button at bottom

### Screen 4: Active Timer (Full screen)
- Melt-style progress bar (animated fill based on elapsed/estimated)
- Remaining time display ("~X min left")
- Pause / Resume toggle button
- Extend buttons: +5 min, +10 min
- "Finish" button
- Overrun state: soft banner "You've passed your estimate. Extend or wrap up."

### Screen 5: Complete Task
- Summary card: Estimated vs Actual minutes
- Accuracy percentage display
- Gentle message based on accuracy range
- Optional reflection text input (one line)
- "Breathing reset (30s)" button (optional)
- "Done" button → routes to Home

### Screen 6: Breathing Reset
- Large expanding/contracting circle animation (3 breaths, ~30s)
- Text alternates: "Breathe in…" / "Breathe out…"
- End text: "What's the next tiny step?"
- "Back to Home" button
- Reduced motion: static circle + timer text

### Screen 7: Insights (Tab)
- Section 1 — Accuracy Trend: Toggle 7d/30d, simple line/bar chart
- Section 2 — Patterns: By Category, By Energy, By Time of Day (min 3 tasks each)
- Section 3 — Common Expansions: Lowest avg accuracy category
- Insufficient data message: "Keep going — patterns appear over a few days."

### Screen 8: Weekly Story
- Auto-generated paragraph from template using last 7 days data
- "Back" button

### Screen 9: Settings (Tab)
- Theme Mode: System / Light / Dark selector
- Sound: Toggle
- Notifications: Toggle + time picker for dailyNudgeTime
- Reduced Motion: Toggle
- Sync section: Toggle "Enable Sync" (shows auth buttons when on)
- Backup section: "Export Backup", "Import Backup", "Sync now" (if sync enabled)

---

## Key User Flows

### Flow 1: First Launch
Splash → Onboarding (3 slides) → Tap "Get started" → Home Dashboard

### Flow 2: Start & Complete a Task
Home → Tap "Start a task" → Fill form → Tap "Start" → Active Timer (running) → Tap "Finish" → Complete Task screen → Optionally add reflection → Tap "Done" → Home

### Flow 3: Timer Overrun
Active Timer → Elapsed exceeds estimate → Soft banner appears → User taps "Extend +5" or "Finish"

### Flow 4: Breathing Reset
Complete Task → Tap "Breathing reset (30s)" → Breathing screen (30s animation) → Tap "Back to Home" → Home

### Flow 5: View Insights
Home → Tap Insights tab → View accuracy trends, patterns → Tap "Weekly Story" → Read story → Back

### Flow 6: Notification Permission
After first task completion → "Gentle daily nudge?" prompt → Allow → Notifications scheduled at dailyNudgeTime

### Flow 7: Change Settings
Home → Tap Settings tab → Adjust theme/sound/notifications/motion → Changes saved immediately

### Flow 8: Export/Import Backup
Settings → Tap "Export Backup" → JSON file shared via share sheet
Settings → Tap "Import Backup" → Select JSON → Choose Merge or Replace → Data imported

---

## Navigation Structure

**Tab Bar (3 tabs):**
1. Home (house icon)
2. Insights (chart icon)
3. Settings (gear icon)

**Stack screens (pushed on top of tabs):**
- Start Task
- Active Timer
- Complete Task
- Breathing Reset
- Weekly Story
- Onboarding (initial only, no tab bar)

---

## Data Architecture (Local-First)

All data stored locally using AsyncStorage with structured JSON.
- `AppSettings`: Single record for all app configuration
- `Tasks`: Array of task records with UUID identifiers
- Computed values (insights, weekly story) derived on-the-fly from Tasks array
- Soft delete pattern: `deletedAt` field, never permanently removed
