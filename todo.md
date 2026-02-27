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
