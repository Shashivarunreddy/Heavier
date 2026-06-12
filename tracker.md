# Heavier - Project Tracker

This file tracks the design and coding progress for the Heavier gym progress tracker app.

---

## 1. Complete System Progress

| Component | Status | Description |
| :--- | :--- | :--- |
| **Local Database Setup** | **100% Complete** | Programmatic table creator inside `db/sqlite.ts` and type mappings in `db/schema.ts`. |
| **Zustand State Stores** | **100% Complete** | Stores for user profiles/settings (`userStore.ts`), template logging (`workoutStore.ts`), and body metrics (`measurementStore.ts`). |
| **Onboarding Routing** | **100% Complete** | Launch redirect on onboarding completion inside `index.tsx` and custom inputs in `onboarding.tsx`. |
| **Primary Navigation** | **100% Complete** | 5-tab layout (`dashboard`, `workouts`, `progress`, `analytics`, `settings`) in `app/(tabs)/_layout.tsx`. |
| **Personalized Dashboard** | **100% Complete** | Multi-card dashboard displaying streaks, recent logs, quick actions, and differences since last check-in. |
| **Workout Templates Builder** | **100% Complete** | Exercise library search modal and routine template planner in `workout-create-template.tsx`. |
| **Active Workout Tracker** | **100% Complete** | Realtime stopwatch, editable weight/reps inputs, check-in checks, and auto rest timer count in `workout-active.tsx`. |
| **Post-Workout Summary** | **100% Complete** | Volume totals, time, completed sets, and Personal Record achievements in `workout-summary.tsx`. |
| **collapsible History Logs** | **100% Complete** | Searchable logs with detail expanders and log deleter in `workout-history.tsx`. |
| **Measurements Check-In** | **100% Complete** | Dimensions input forms and quad-angle image picker in `app/(tabs)/progress.tsx`. |
| **Physique Photo Gallery** | **100% Complete** | Chronological timeline group grid showcasing physique photos in `progress-photos.tsx`. |
| **Comparison Dashboard** | **100% Complete** | Deltas comparator table and side-by-side photo comparer in `progress-compare.tsx`. |
| **Analytics Charts Dashboard** | **100% Complete** | Weight timelines, workout frequencies, strength progressions, and all PRs listings in `app/(tabs)/analytics.tsx`. |
| **System Settings** | **100% Complete** | Theme selectors, unit preferences, rest defaults, and local DB info. |

---

## 2. File Directory Map

The following files have been built and verified:
- [x] [db/sqlite.ts](file:///s:/Shashi/Heavier/db/sqlite.ts) — SQLite table executor and client connector
- [x] [db/schema.ts](file:///s:/Shashi/Heavier/db/schema.ts) — Drizzle schema representations
- [x] [lib/exerciseLibrary.ts](file:///s:/Shashi/Heavier/lib/exerciseLibrary.ts) — Predefined catalog of 16 common movements
- [x] [store/userStore.ts](file:///s:/Shashi/Heavier/store/userStore.ts) — Profiles, settings, and file-based preferences sync
- [x] [store/workoutStore.ts](file:///s:/Shashi/Heavier/store/workoutStore.ts) — Active session manager, templates, and history transactions
- [x] [store/measurementStore.ts](file:///s:/Shashi/Heavier/store/measurementStore.ts) — Metric logs and physical image file copiers
- [x] [app/_layout.tsx](file:///s:/Shashi/Heavier/app/_layout.tsx) — Root layout connecting database initialization and styles
- [x] [app/index.tsx](file:///s:/Shashi/Heavier/app/index.tsx) — Main route checking onboarding redirection and motivators
- [x] [app/onboarding.tsx](file:///s:/Shashi/Heavier/app/onboarding.tsx) — User initial configuration form
- [x] [app/profile.tsx](file:///s:/Shashi/Heavier/app/profile.tsx) — Edit profile info card
- [x] [app/(tabs)/_layout.tsx](file:///s:/Shashi/Heavier/app/(tabs)/_layout.tsx) — 5-tab bar controller utilizing Ionicons
- [x] [app/(tabs)/dashboard.tsx](file:///s:/Shashi/Heavier/app/(tabs)/dashboard.tsx) — Streaks, stats, and shortcuts
- [x] [app/(tabs)/workouts.tsx](file:///s:/Shashi/Heavier/app/(tabs)/workouts.tsx) — Routines start page
- [x] [app/workout-create-template.tsx](file:///s:/Shashi/Heavier/app/workout-create-template.tsx) — Routine template maker
- [x] [app/workout-active.tsx](file:///s:/Shashi/Heavier/app/workout-active.tsx) — Workout logger and rest counts overlay
- [x] [app/workout-summary.tsx](file:///s:/Shashi/Heavier/app/workout-summary.tsx) — Completed stats and trophy records
- [x] [app/workout-history.tsx](file:///s:/Shashi/Heavier/app/workout-history.tsx) — Detailed archives browser
- [x] [app/exercise-library.tsx](file:///s:/Shashi/Heavier/app/exercise-library.tsx) — Catalog browser
- [x] [app/(tabs)/progress.tsx](file:///s:/Shashi/Heavier/app/(tabs)/progress.tsx) — Dimension inputs and check-in timelines
- [x] [app/progress-photos.tsx](file:///s:/Shashi/Heavier/app/progress-photos.tsx) — Photo layout viewer
- [x] [app/progress-compare.tsx](file:///s:/Shashi/Heavier/app/progress-compare.tsx) — Dual logs comparator
- [x] [app/(tabs)/analytics.tsx](file:///s:/Shashi/Heavier/app/(tabs)/analytics.tsx) — Chart kits line and bar graphs
- [x] [app/(tabs)/settings.tsx](file:///s:/Shashi/Heavier/app/(tabs)/settings.tsx) — Custom preferences manager
