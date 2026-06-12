# Heavier - Future Roadmap & Advancements

This document maps out the proposed feature enhancements and technical improvements for subsequent releases of the Heavier application.

---

## 1. Local Database & Data Portability

- [ ] **Import/Export SQLite Database**: Allow users to export their complete `heavier.db` file as a backup or import it to transfer history between devices.
- [ ] **CSV Data Export**: Add a settings option to export workout history and measurements as structured CSV files for custom spreadsheet analysis.
- [ ] **Database Vacuum & Optimization**: Programmatic triggers to run SQLite vacuum and clean up orphaned file-system progress photos to conserve storage.

---

## 2. Wearables & Integrations

- [ ] **Apple HealthKit Sync**: Read/write active workout durations, active calories, heart rate ranges, and body weight logs to Apple Health.
- [ ] **Android Google Fit / Health Connect**: Synchronize workout summaries and weight logs with the Android fitness system.
- [ ] **Smart Watch Companions**: Build simplified Apple Watch and Wear OS helper interfaces to record sets and view rest timers directly from the wrist.

---

## 3. Advanced Workout Analytics

- [ ] **Estimated 1RM (One-Rep Max) Tracker**: Calculate and graph theoretical 1RMs using Brzycki or Epley formulas for compound exercises.
- [ ] **Muscle Fatigue Heatmap**: A body silhouette visualizer highlighting targeted muscles based on recent workout volumes (color gradient indicating recovery status).
- [ ] **Plate Calculator Helper**: A utility in active workout view illustrating exactly which plates to slide onto the barbell for a given weight targets.

---

## 4. Notifications & Reminders

- [ ] **Workout Reminders**: Custom local schedule reminders alerts prompting users when it is time to hit their workout routines.
- [ ] **Weekly Check-In Reminders**: Gentle alerts reminding users to complete their body dimensions check-in and photograph logs.
- [ ] **Rest Timer Push Notifications**: Send local push notices when the rest timer concludes if the app is minimized in the background.

---

## 5. Smart AI & Predictive Tracking

- [ ] **AI Gym Routine Builder**: A wizard utilizing local metadata (age, height, weight, gender, and target goals) to propose a balanced weekly workout structure.
- [ ] **Overload Predictor**: Analyze history trends to automatically suggest target weight increments for subsequent workouts.
- [ ] **Plateau Alerts**: Warn the user when strength progress on an exercise stagnates, suggesting deload weeks or alternative movements.

---

## 6. Design & UX Refinements

- [ ] **Workout Playlists Sync**: Control Spotify or Apple Music tracks directly within the active workout log dashboard.
- [x] **Custom Exercise Creator**: Enable adding custom exercises directly to the local catalog with target muscles and instructions.
- [ ] **Advanced Custom Exercises Features**:
  - Add equipment tags (e.g., Barbell, Dumbbell, Cables, Machine, Kettlebell, Bodyweight).
  - Enable custom workout categories creation (in addition to the static chest/back/legs/shoulders/arms/core).
  - Add option to upload custom photos or attach tutorial links to user-defined exercises.
  - Implement editing and deleting of created custom exercises.
