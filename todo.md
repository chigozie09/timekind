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

## Phase 3: Firebase Optional Sync
- [ ] Firebase project config
- [ ] Auth providers (Apple/Google sign-in)
- [ ] Firestore tasks collection + security rules
- [ ] Initial sync + merge logic
- [ ] Ongoing sync + lastSyncAt
- [ ] Sync now button in Settings

## Branding
- [x] Generate custom app icon
- [x] Update app.config.ts with branding info

## Bugs
- [x] Preview is unresponsive — fixed: replaced FlatList-based onboarding with state-based slides
