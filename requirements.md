# Heavier - Technical & Feature Requirements

This document details all implemented features, technical design, and rules for the Heavier application.

---

## 1. Core Features

### Onboarding Flow
- Fullscreen setup on first launch.
- Collects user profile metadata: Name, Age, Height, Weight, and Gender.
- Restricts entry until mandatory items are filled.
- Saves parameters directly to the local SQLite database and marks onboarding complete in state.

### Personalized Dashboard
- Welcoming greeting dynamically adjusted to local system time (Morning/Afternoon/Evening).
- Consecutive workout streak tracking logic (calculates continuity with a 3-day rest grace period).
- Recent stats panel compiling weight and dimensions.
- Quick Log actions to instantly start routines, update body measurements, or add photos.
- Collapsible progress differences detailing variations in weight and dimensions since the last log.

### Workout Logger & Templates
- Standard pre-configured templates (such as Push, Pull, Legs) to quickly boot a session.
- Ability to build custom templates specifying template name, notes, sets, reps, and target weights.
- Multi-row active tracking:
  - Editable weights and reps inputs.
  - Done checkbox marking sets as completed.
  - Adding/removing exercises and sets dynamically during the session.
  - Active duration timer stopwatch.
- Clean post-workout summary detailing duration, total volume lifted, exercises completed, and achievements of new Personal Records (PRs).
- Workout history browsing with search functionality and collapsible detail panels showing set breakdowns.

### Custom Exercises & Variations Library
- Merging of a comprehensive pre-defined exercise list with user-created custom variations.
- Dynamic exercise selector search filtering through both standard and custom databases.
- Direct inline "Create Custom" option available inside active workouts, template creations, and the main exercise library tab to prevent routine interruptions.
- Offline storage of custom exercise definitions in SQLite database, persistent across app reloads.


### Measurements & Physique Timeline
- Input checklist to log dimension indicators (Weight, Waist, Arms, Chest, Shoulders, Thighs, Neck).
- Device image integration using `expo-image-picker` to save Front, Back, Left, and Right physique angles.
- Physique Photos gallery showing logs chronologically.
- Side-by-side progression comparison detailing differences in measurements and dual image comparisons.

### Analytics Graphs
- Weight trend timeline using `react-native-chart-kit` bezier charts.
- Bar charts plotting workouts per month to track consistency.
- Line charts detailing Bench Press, Squat, and Deadlift max weight progression over time.
- All-time Personal Records (PRs) list.

### Preferences & Customization
- Light Mode, Dark Mode, and System Theme alignment syncing to NativeWind settings.
- Units configuration: Kilograms (KG) vs. Pounds (LBS) and Centimeters (CM) vs. Inches (IN).
- Rest timer configurations: adjust rest interval values (30s, 60s, 90s, 120s) and toggle auto-start timer on checking sets.

---

## 2. Technical Stack & Integrity
- **Offline-First & Local-Only**: No external web APIs, cloud syncing, or authentication layers. All data is saved on device.
- **Expo SQLite**: Provides relational database storage for user profiles, workout histories, and measurement records.
- **Zustand State Store**: Manages user stores, workouts, and measurements reactive state, loading from SQLite on boot.
- **Expo FileSystem**: Copy selected progress photos to application document directory to prevent deletion.
- **Expo Haptics**: Adds physical touch feedback on checklist logs.
