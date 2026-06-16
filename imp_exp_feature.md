# Heavier - Backup & Restore System

## Goal

Allow users to:

* Export all app data into a single backup file
* Store the backup anywhere (Google Drive, PC, Email, Telegram, etc.)
* Import the backup on a new phone
* Restore workouts, analytics, measurements, goals, and progress photos exactly as they were

---

# High Level Flow

```text
Phone A
   ↓
Export Backup
   ↓
heavier-backup.zip
   ↓
Google Drive / Email / PC / Telegram
   ↓
Import Backup
   ↓
Phone B
```

No account required.

No cloud storage required.

The user fully owns their data.

---

# Required Packages

## File System

Used to create and read files.

```bash
npx expo install expo-file-system
```

---

## Document Picker

Used to select backup files during import.

```bash
npx expo install expo-document-picker
```

---

## Sharing

Used to share exported backups.

```bash
npx expo install expo-sharing
```

---

## ZIP Support

Used to create and extract ZIP files.

```bash
npm install react-native-zip-archive
```

After installation:

```bash
npx expo prebuild
```

---

# Export Process

## Step 1

User opens:

```text
Settings
↓
Backup & Restore
↓
Export Backup
```

---

## Step 2

Collect all user data:

### User Profile

```text
Name
Units
Theme
Preferences
```

### Workouts

```text
Workout History
Workout Templates
Exercise History
```

### Analytics Data

```text
PRs
Volume
Streaks
Statistics
```

### Measurements

```text
Weight
Body Measurements
Progress Entries
```

### Goals

```text
Active Goals
Completed Goals
```

### Photos

```text
Progress Photos
```

---

## Step 3

Generate:

```text
backup.json
```

Example:

```json
{
  "version": 1,
  "exportedAt": "2026-06-14",

  "user": {},
  "workouts": [],
  "measurements": [],
  "goals": [],
  "settings": {}
}
```

---

## Step 4

Create temporary folder:

```text
heavier-backup/
```

Structure:

```text
heavier-backup/

backup.json

photos/
 ├── photo1.jpg
 ├── photo2.jpg
 └── photo3.jpg
```

---

## Step 5

Create ZIP file:

```text
heavier-backup.zip
```

---

## Step 6

Share backup:

```text
Google Drive
Telegram
WhatsApp
Email
Files App
PC
```

---

# Import Process

## Step 1

User opens:

```text
Settings
↓
Backup & Restore
↓
Import Backup
```

---

## Step 2

Select:

```text
heavier-backup.zip
```

using Document Picker.

---

## Step 3

Extract ZIP contents.

Result:

```text
backup.json

photos/
```

---

## Step 4

Validate backup.

Checks:

* File exists
* JSON valid
* Version supported

Example:

```json
{
  "version": 1
}
```

---

## Step 5

Restore data.

Restore:

```text
User Profile
Workout History
Workout Templates
Measurements
Goals
Settings
Progress Photos
```

---

## Step 6

Recalculate analytics.

Rebuild:

```text
Current Streak
Longest Streak
PRs
Volume Statistics
Exercise Statistics
Workout Counts
```

---

## Step 7

Show success message.

```text
Backup restored successfully.
```

---

# Progress Photos

## Incorrect Approach

Do NOT store:

```json
{
  "path": "/storage/emulated/0/photo.jpg"
}
```

Reason:

* Paths change between devices
* Restore will fail

---

## Correct Approach

Store:

```json
{
  "filename": "photo1.jpg"
}
```

And include actual image inside:

```text
photos/photo1.jpg
```

within the ZIP file.

---

# Versioning

Always include:

```json
{
  "version": 1
}
```

Future:

```json
{
  "version": 2
}
```

This allows migration when the database structure changes.

Example:

```text
Version 1
- workouts
- measurements

Version 2
- workouts
- measurements
- goals

Version 3
- workouts
- measurements
- goals
- routines
```

---

# Additional Export Features

## Export Workouts CSV

```text
workouts.csv
```

Used for:

* Excel
* Google Sheets

---

## Export Measurements CSV

```text
measurements.csv
```

Used for body tracking.

---

## Export PRs CSV

```text
prs.csv
```

Used for exercise analysis.

---

## Fitness Report PDF

Generate:

```text
fitness-report.pdf
```

Containing:

* Current Weight
* Workout Count
* Volume Lifted
* Personal Records
* Progress Charts

---

# Recommended MVP Scope

For Version 1 implement only:

## Export

```text
Export Full Backup (.zip)
```

---

## Import

```text
Import Full Backup (.zip)
```

---

## Included Data

```text
User Profile
Settings
Workout History
Workout Templates
Exercises
Measurements
Goals
Progress Photos
```

This is enough for complete device migration and long-term data safety.
