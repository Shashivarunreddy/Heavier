# Gym Progress Tracker App - Requirements Document

## Project Overview

A mobile application built using Expo React Native that allows users to track their gym workouts, body measurements, and physique progress over time.

The application is designed as an offline-first solution where all user data is stored locally on the device. No backend server or cloud storage is required for Version 1.

---

# Primary Goals

The application should enable users to:

1. Track workout sessions.
2. Record exercise performance.
3. Store body measurements.
4. Upload and manage progress photos.
5. View historical progress.
6. Analyze workout consistency and progression.
7. Operate completely offline.

---

# Technology Stack

## Frontend

* Expo SDK 54+
* React Native
* TypeScript
* Expo Router

## Styling

* NativeWind (Tailwind CSS for React Native)

## Local Database

* Expo SQLite

Reason:

* Structured storage
* Fast querying
* Reliable local persistence
* Suitable for long-term workout history

## ORM

* Drizzle ORM

Reason:

* Type-safe database operations
* Easier schema management
* Better maintainability

## State Management

* Zustand

Reason:

* Lightweight
* Simple implementation
* Excellent performance

## Forms & Validation

* React Hook Form
* Zod

Reason:

* Form handling
* Input validation
* Better user experience

## Image Handling

* Expo Image Picker
* Expo FileSystem

Reason:

* Selecting photos
* Local file storage
* Managing progress images

## Data Visualization

* React Native Chart Kit

Reason:

* Workout progression charts
* Measurement tracking charts
* Weight progression graphs

---

# Application Architecture

## Offline First

All application data must remain on the device.

No:

* Authentication server
* Cloud database
* API integration
* AI integration

Version 1 should function completely offline.

---

# Core Features

## 1. Workout Tracking

Users should be able to create workout entries.

### Data Captured

* Workout Date
* Exercise Name
* Sets
* Repetitions
* Weight Lifted
* Notes

### Example

Bench Press

* Set 1: 80kg × 8
* Set 2: 80kg × 8
* Set 3: 75kg × 10

---

## 2. Exercise History

Users should be able to:

* View exercise history
* Compare previous performances
* Track progressive overload

Example:

Bench Press

* Jan 1: 70kg × 8
* Jan 15: 75kg × 8
* Feb 1: 80kg × 8

---

## 3. Body Measurements

Users should be able to record measurements weekly.

### Measurements

* Body Weight
* Arm Size
* Chest Size
* Waist Size
* Thigh Size
* Shoulder Size
* Neck Size

### Tracking Frequency

Recommended:

* Weekly
* Bi-weekly

---

## 4. Progress Photos

Users should upload four photos during each progress update.

### Required Angles

1. Front View
2. Left Side View
3. Right Side View
4. Back View

### Storage

Photos should:

* Be copied to app storage
* Persist locally
* Have file paths stored in SQLite

Example:

Progress Entry

Date: 2026-06-11

* Front Photo
* Left Photo
* Right Photo
* Back Photo

---

## 5. Progress Timeline

Users should be able to browse progress entries chronologically.

Each entry displays:

* Date
* Measurements
* Weight
* Progress Photos

---

## 6. Dashboard

The dashboard should display:

### Summary Metrics

* Current Weight
* Weight Change
* Total Workouts
* Workout Streak
* Most Trained Muscle Group

### Quick Actions

* Start Workout
* Add Measurements
* Upload Progress Photos

---

## 7. Analytics

### Workout Analytics

Charts showing:

* Volume Progression
* Exercise Progression
* Weekly Training Frequency

### Body Analytics

Charts showing:

* Weight Trend
* Arm Growth Trend
* Waist Trend
* Chest Growth Trend

---

# Database Design

## Users Table

users

* id
* name
* age
* gender
* height
* created_at

---

## Workouts Table

workouts

* id
* workout_date
* notes
* created_at

---

## Exercises Table

exercises

* id
* workout_id
* exercise_name
* sets
* reps
* weight

---

## Measurements Table

measurements

* id
* measurement_date
* body_weight
* arm_size
* chest_size
* waist_size
* thigh_size
* shoulder_size
* neck_size

---

## Progress Photos Table

progress_photos

* id
* measurement_id
* front_image_path
* left_image_path
* right_image_path
* back_image_path

---

# Folder Structure

src/

├── app/

│   ├── (tabs)

│   │   ├── dashboard

│   │   ├── workouts

│   │   ├── progress

│   │   ├── analytics

│   │   └── profile

│

├── db/

│   ├── schema

│   ├── migrations

│   └── sqlite.ts

│

├── store/

│   ├── workoutStore.ts

│   ├── measurementStore.ts

│   └── userStore.ts

│

├── services/

│   ├── workoutService.ts

│   ├── measurementService.ts

│   └── photoService.ts

│

├── components/

├── hooks/

├── types/

└── utils/

---

# Local Development Setup

## Create Project

npx create-expo-app@latest gym-tracker

Select:

* TypeScript

---

## Install Navigation

npx expo install expo-router

---

## Install SQLite

npx expo install expo-sqlite

npm install drizzle-orm drizzle-kit

---

## Install State Management

npm install zustand

---

## Install Forms

npm install react-hook-form

npm install zod

npm install @hookform/resolvers

---

## Install Image Support

npx expo install expo-image-picker

npx expo install expo-file-system

---

## Install Charts

npm install react-native-chart-kit

---

# Version 1 Scope

Included:

* Workout Tracking
* Exercise History
* Body Measurements
* Progress Photos
* Dashboard
* Analytics
* Local SQLite Storage
* Offline Functionality

Excluded:

* AI Features
* Cloud Sync
* Authentication
* Social Features
* Trainer Access
* Subscription System

---

# Success Criteria

The application should allow a user to:

1. Track every workout.
2. Store years of workout history.
3. Monitor body measurements.
4. Upload physique photos from four angles.
5. Review progress over time.
6. Use the application entirely offline.
7. Experience fast and reliable performance on Android and iOS devices.
