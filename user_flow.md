# Home page/ wake up page , simple ui and some quotes by famour persons , include anime mostly loop through different quotes each time user opens the app.

# Gym Progress Tracker App - Navigation & Screen Requirements

## Bottom Tab Navigation

The application will use a 5-tab bottom navigation structure.

### Tabs

1. Dashboard
2. Workouts
3. Progress
4. Analytics
5. Settings

---

# 1. Dashboard Tab

## Purpose

Provide users with a quick overview of their fitness journey and access to frequently used actions.

## Components

### Welcome Section

Display:

* User Name
* Greeting Message

Example:

Good Morning, John

### Current Stats Card

Display:

* Current Weight
* Arm Size
* Chest Size
* Waist Size
* Current Workout Streak

### Quick Actions

Buttons:

* Start Workout
* Add Measurements
* Upload Progress Photos

### Recent Workout Section

Display:

* Most Recent Workout
* Workout Date
* Exercises Performed

### Progress Summary

Display:

* Weight Change
* Arm Growth
* Waist Reduction
* Progress Since Last Measurement

---

# 2. Workouts Tab

## Purpose

Track and manage workout sessions.

## Screens

### Workout Templates Screen

Display all saved workout templates.

Examples:

* Push Day
* Pull Day
* Leg Day
* Upper Body
* Lower Body
* Custom Workouts

Actions:

* Create Template
* Edit Template
* Delete Template

---

### Create Workout Template Screen

User can define:

* Workout Name
* Exercises
* Sets
* Reps
* Target Weight

---

### Start Workout Screen

Displays workout session.

Features:

* Current Exercise
* Weight Input
* Reps Input
* Sets Tracking
* Complete Set Button

---

### Workout Summary Screen

Displayed after workout completion.

Shows:

* Workout Duration
* Total Volume Lifted
* Exercises Completed
* Personal Records Achieved

---

### Workout History Screen

Displays all completed workouts.

Features:

* Search Workouts
* Filter By Date
* View Workout Details

---

# 3. Progress Tab

## Purpose

Track body measurements and visual progress.

## Screens

### Measurements Screen

Users can enter:

* Body Weight
* Arm Size
* Chest Size
* Waist Size
* Shoulder Size
* Thigh Size
* Neck Size

---

### Progress Photos Screen

Upload four images.

Required Angles:

* Front View
* Left Side View
* Right Side View
* Back View

---

### Progress Timeline Screen

Displays all progress entries chronologically.

Each Entry Shows:

* Date
* Weight
* Measurements Available
* Photos Available

---

### Progress Comparison Screen

Compare two progress dates.

Display:

* Measurements Difference
* Weight Difference
* Side-by-Side Photos

---

# 4. Analytics Tab

## Purpose

Visualize progress through charts and statistics.

## Screens

### Weight Analytics

Charts Showing:

* Weight Progression
* Weight Trend Over Time

---

### Strength Analytics

Track:

* Bench Press Progress
* Squat Progress
* Deadlift Progress
* Other Exercise Progression

---

### Body Measurement Analytics

Charts Showing:

* Arm Growth
* Chest Growth
* Waist Changes
* Shoulder Growth

---

### Training Frequency Analytics

Display:

* Workouts Per Week
* Monthly Consistency
* Current Workout Streak

---

### Personal Records Screen

Display:

* Highest Bench Press
* Highest Squat
* Highest Deadlift
* Exercise PR History

---

# 5. Settings Tab

## Purpose

Allow users to customize app behavior and preferences.

## Appearance Settings

### Theme Selection

Options:

* Light Theme
* Dark Theme
* System Default

Implementation:

Radio Selection

Example:

( ) Light

( ) Dark

( ) System

Only one option can be selected.

---

## Units Settings

### Weight Unit

Options:

* Kilograms (KG)
* Pounds (LBS)

### Measurement Unit

Options:

* Centimeters (CM)
* Inches (IN)

---

## Workout Preferences

### Default Rest Timer

Options:

* 30 Seconds
* 60 Seconds
* 90 Seconds
* 120 Seconds

---

### Auto Start Rest Timer

Toggle:

* Enabled
* Disabled

Behavior:

Automatically starts rest timer after completing a set.

---

## About Section

Display:

* Application Version
* Current Database Version
* Developer Information

---

# Additional Screens (Not Bottom Tabs)

## Onboarding Screen

Displayed on first app launch.

Collect:

* Name
* Age
* Height
* Current Weight
* Gender

---

## Profile Screen

Accessible from Dashboard.

Display:

* Name
* Age
* Height
* Weight
* Fitness Goal

Allow Editing:

* Profile Information
* Fitness Goals

---

## Exercise Library Screen

Searchable exercise database.

Each Exercise Contains:

* Exercise Name
* Target Muscle Group
* Instructions
* Exercise Category

Examples:

* Bench Press
* Squat
* Deadlift
* Lat Pulldown
* Shoulder Press

---

# Navigation Structure

Dashboard
├── Profile

Workouts
├── Workout Templates
├── Create Template
├── Start Workout
├── Workout Summary
└── Workout History

Progress
├── Measurements
├── Progress Photos
├── Timeline
└── Compare Progress

Analytics
├── Weight Analytics
├── Strength Analytics
├── Body Analytics
├── Training Frequency
└── Personal Records

Settings
├── Theme Settings
├── Unit Settings
├── Workout Preferences
└── About

Additional Screens
├── Onboarding
├── Profile
└── Exercise Library

---

# Version 1 Scope

Included:

* Dashboard
* Workout Tracking
* Workout Templates
* Workout History
* Body Measurements
* Progress Photos
* Progress Comparison
* Analytics
* Theme Switching
* Unit Preferences
* Rest Timer Preferences
* Profile Management
* Exercise Library

Excluded (Future Versions):

* Cloud Sync
* Backup & Restore
* Notifications
* AI Features
* Social Features
* Trainer Access
* Subscription Features
