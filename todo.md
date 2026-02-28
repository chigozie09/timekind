# Project TODO

## Phase 1: Core Offline
- [x] Theme tokens (light + dark) applied consistently
- [x] Tab bar navigation (Home, Insights, Settings)
- [x] Stack navigation for task flow screens
- [x] Local data layer (AppSettings + Tasks with AsyncStorage)
- [x] Splash / Router screen (check onboarding state)
- [x] Onboarding flow (3 slides)
- [x] Home Dashboard (today's insight, this week, recent tasks)
- [x] Start Task screen (form with name, estimate, energy, category)
- [x] Active Timer screen (progress bar, pause/resume, extend, finish)
- [x] Complete Task screen (accuracy, gentle message, reflection)
- [x] Insights screen (7-day avg accuracy, patterns)
- [x] Weekly Story screen (auto-generated paragraph)

## Phase 2: Value Features
- [x] Energy tagging + timeOfDay tagging (derived on completion)
- [x] Breathing Reset screen (30s animation)
- [x] Daily nudge notifications (UI toggle, scheduling placeholder)
- [x] Export backup (JSON via share sheet)
- [x] Import backup (JSON file picker with merge/replace)

## Phase 3: Firebase Optional Sync (Deferred to Future)
- [ ] Remove Firebase SDK and dependencies
- [ ] Remove sync-context and auth code
- [ ] Remove sync UI from Settings
- [ ] Remove Firebase environment variables

## Branding
- [x] Generate custom app icon
- [x] Update app.config.ts with branding info

## Bugs
- [x] Preview is unresponsive — fixed: replaced FlatList-based onboarding with state-based slides
- [x] Error code 500 when opening in Expo Go — fixed: regex in settings.tsx was generating invalid CSS via Tailwind scan
- [x] Add Google Web Client ID for Google Sign-In
- [x] Fix Google Sign-In error: code_challenge_method not allowed — set usePKCE: false
- [x] Fix Google Sign-In redirect URI: switched to useIdTokenAuthRequest hook which uses auth.expo.io HTTPS redirect

## Phase 4: Polish & Animations
- [x] Button press animations (scale 0.97, 80ms) across all screens
- [x] Swipe gestures for insights 7-day/30-day switching
- [x] Sound effects for task completion
- [x] Sound effects for breathing reset completion

## Phase 5: Enhanced UX Features
- [x] Pull-to-refresh on home screen
- [x] Task filtering by category on home dashboard
- [x] Weekly streak counter display

## Phase 6: Gamification & Analytics
- [ ] Task statistics dashboard with completion rate and metrics
- [ ] Local notifications for streak reminders
- [ ] Achievement badges system with milestones

## Phase 7: V1 Accessibility & Usability
- [x] Accessibility settings in onboarding (disable animations, notifications, sounds)
- [x] Keyboard shortcuts for power users (Space, Enter, etc.)
- [x] Data persistence validation and crash recovery
- [x] Offline-first confirmation messaging
- [x] Optional help/tutorial overlay for first-time users

## Phase 8: Advanced Features
- [x] Task templates for common routines (morning, workout, creative)
- [x] Focus mode with UI hiding and notification control
- [x] Calendar export for completed tasks

## Phase 9: Final Polish & User Control
- [x] Task reminders with configurable notification times
- [x] Task template sharing functionality
- [x] Dark mode toggle in settings

## Phase 10: Task Notes & Reflection
- [x] Reflection prompt UI on task completion screen
- [x] Store and retrieve task notes in database
- [x] Display notes in insights and history

## Phase 11: Advanced Insights & Search
- [x] Mood/emotion tracking on task completion (1-5 stars)
- [x] Reflection search functionality in journal
- [x] AI-powered weekly reflection summary from server LLM

## Phase 12: Final Polish & Wrap-up
- [x] Mood-based task recommendations
- [x] Task history export (PDF/CSV)
- [x] Streak notifications

## Phase 13: Bug Fixes & User Feedback
- [x] Fix onboarding flow not appearing (investigate cache issue)
- [x] Add bulk task creation with start time scheduling
- [x] Test and validate both fixes

## Phase 14: Task Prioritization & Scheduling
- [x] Add priority field to tasks (High/Medium/Low)
- [x] Implement task sorting by priority and start time
- [x] Create delay notification system for upcoming tasks
- [x] Add task delay and sequential shifting UI

## Phase 15: Advanced Task Management
- [x] Task dependency chains with blocking logic
- [x] Smart time blocking based on energy patterns
- [x] Calendar view with drag-to-reschedule

## Phase 16: Subtasks & Analytics
- [x] Task subtasks with individual timers
- [x] Productivity heatmap visualization

## Phase 17: User Feedback Fixes
- [x] Add missing start time field to start-task screen
- [x] Fix bulk-tasks screen and make it accessible from home
- [x] Ensure multiple task scheduling works with individual start times

## Phase 18: UI Improvements
- [x] Add back button to Task Templates screen

## Phase 19: Final Publishing Preparation
- [x] Add back buttons to Bulk Tasks, Calendar, and Heatmap screens
- [x] Add consistent screen titles to all headers
- [x] Perform final publishing checklist (110 tests passing, zero TS errors)
- [x] Save final checkpoint

## Phase 20: App Store Readiness
- [x] Create onboarding video walkthrough
- [x] Implement app ratings prompt
- [x] Add privacy policy and terms screens

## Phase 21: Production Deployment
- [x] Generate app icon variants (iOS 1024x1024, Android adaptive icons)
- [x] Create app store descriptions (iOS App Store, Google Play Store)
- [x] Integrate analytics with user consent
- [x] Update app.config.ts with branding and analytics setup
- [x] Save final checkpoint for production deployment

## Phase 22: App Store Submission & Distribution
- [x] Create app store submission guide with EAS Build instructions
- [x] Integrate optional Sentry crash reporting with user consent
- [x] Generate app store screenshots showcasing key features
- [x] Update configuration and save final checkpoint

## Phase 23: Multi-Language Support
- [x] Set up i18n infrastructure with react-i18next
- [x] Create translation files for 5 languages (EN, ES, FR, DE, JA)
- [x] Add language selector to Settings screen
- [x] Translate all core UI screens and components
- [x] Test language switching and save final checkpoint

## Phase 24: Global Localization & App Store Expansion
- [x] Expand translations to Insights, Templates, Journal screens
- [x] Translate all task categories and templates for all languages
- [x] Add regional date/time formatting (DD/MM/YYYY, HH:mm, etc.)
- [x] Add currency/time unit localization
- [x] Create culturally-relevant task templates for each language
- [x] Create localized app store descriptions for 5 languages
- [x] Generate localized app store screenshots with translated UI
- [x] Test all localizations and verify language switching works

## Phase 25: Publication Preparation
- [x] Implement date/time format preview in Settings
- [x] Create language-specific onboarding flows
- [x] Set up CI/CD pipeline for app store automation
- [x] Final testing and quality assurance
- [x] Create publication documentation
- [x] Generate final checkpoint for publication
