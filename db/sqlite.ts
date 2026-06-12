import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expoDb = openDatabaseSync("heavier.db");

export function initializeDatabase() {
  // Turn on foreign keys and build database schema
  expoDb.execSync("PRAGMA foreign_keys = ON;");
  
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      height REAL,
      created_at TEXT NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      FOREIGN KEY(template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_name TEXT NOT NULL,
      workout_date TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      is_completed INTEGER DEFAULT 1,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      measurement_date TEXT NOT NULL,
      body_weight REAL,
      arm_size REAL,
      chest_size REAL,
      waist_size REAL,
      thigh_size REAL,
      shoulder_size REAL,
      neck_size REAL,
      created_at TEXT NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      measurement_id INTEGER,
      front_image_path TEXT,
      left_image_path TEXT,
      right_image_path TEXT,
      back_image_path TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
    );
  `);

  // Migration checks for columns
  try {
    const workoutsCols = expoDb.getAllSync("PRAGMA table_info(workouts)") as { name: string }[];
    const hasWorkoutDate = workoutsCols.some(c => c.name === "workout_date");
    const hasDateCol = workoutsCols.some(c => c.name === "date");
    if (!hasWorkoutDate) {
      if (hasDateCol) {
        expoDb.execSync("ALTER TABLE workouts RENAME COLUMN date TO workout_date;");
      } else {
        expoDb.execSync("ALTER TABLE workouts ADD COLUMN workout_date TEXT NOT NULL DEFAULT '';");
      }
    }
  } catch (err) {
    console.warn("Could not migrate workouts table schema:", err);
  }

  try {
    const measurementsCols = expoDb.getAllSync("PRAGMA table_info(measurements)") as { name: string }[];
    const hasMeasurementDate = measurementsCols.some(c => c.name === "measurement_date");
    const hasDateCol = measurementsCols.some(c => c.name === "date");
    if (!hasMeasurementDate) {
      if (hasDateCol) {
        expoDb.execSync("ALTER TABLE measurements RENAME COLUMN date TO measurement_date;");
      } else {
        expoDb.execSync("ALTER TABLE measurements ADD COLUMN measurement_date TEXT NOT NULL DEFAULT '';");
      }
    }
  } catch (err) {
    console.warn("Could not migrate measurements table schema:", err);
  }

  // Exercises Table Migration
  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(exercises)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    
    if (!hasCol("workout_id")) {
      if (hasCol("workoutId")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN workoutId TO workout_id;");
      else expoDb.execSync("ALTER TABLE exercises ADD COLUMN workout_id INTEGER NOT NULL DEFAULT 0;");
    }
    if (!hasCol("exercise_name")) {
      if (hasCol("exerciseName")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN exerciseName TO exercise_name;");
      else expoDb.execSync("ALTER TABLE exercises ADD COLUMN exercise_name TEXT NOT NULL DEFAULT '';");
    }
    if (!hasCol("set_number")) {
      if (hasCol("setNumber")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN setNumber TO set_number;");
      else expoDb.execSync("ALTER TABLE exercises ADD COLUMN set_number INTEGER NOT NULL DEFAULT 1;");
    }
    if (!hasCol("is_completed")) {
      if (hasCol("isCompleted")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN isCompleted TO is_completed;");
      else expoDb.execSync("ALTER TABLE exercises ADD COLUMN is_completed INTEGER DEFAULT 1;");
    }
  } catch (err) {
    console.warn("Could not migrate exercises table columns:", err);
  }

  // Template Exercises Table Migration
  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(template_exercises)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    
    if (!hasCol("template_id")) {
      if (hasCol("templateId")) expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN templateId TO template_id;");
      else expoDb.execSync("ALTER TABLE template_exercises ADD COLUMN template_id INTEGER NOT NULL DEFAULT 0;");
    }
    if (!hasCol("exercise_name")) {
      if (hasCol("exerciseName")) expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN exerciseName TO exercise_name;");
      else expoDb.execSync("ALTER TABLE template_exercises ADD COLUMN exercise_name TEXT NOT NULL DEFAULT '';");
    }
  } catch (err) {
    console.warn("Could not migrate template_exercises table columns:", err);
  }

  // Progress Photos Table Migration
  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(progress_photos)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    
    if (!hasCol("measurement_id")) {
      if (hasCol("measurementId")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN measurementId TO measurement_id;");
      else expoDb.execSync("ALTER TABLE progress_photos ADD COLUMN measurement_id INTEGER;");
    }
    if (!hasCol("front_image_path")) {
      if (hasCol("frontImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN frontImagePath TO front_image_path;");
      else expoDb.execSync("ALTER TABLE progress_photos ADD COLUMN front_image_path TEXT;");
    }
    if (!hasCol("left_image_path")) {
      if (hasCol("leftImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN leftImagePath TO left_image_path;");
      else expoDb.execSync("ALTER TABLE progress_photos ADD COLUMN left_image_path TEXT;");
    }
    if (!hasCol("right_image_path")) {
      if (hasCol("rightImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN rightImagePath TO right_image_path;");
      else expoDb.execSync("ALTER TABLE progress_photos ADD COLUMN right_image_path TEXT;");
    }
    if (!hasCol("back_image_path")) {
      if (hasCol("backImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN backImagePath TO back_image_path;");
      else expoDb.execSync("ALTER TABLE progress_photos ADD COLUMN back_image_path TEXT;");
    }
  } catch (err) {
    console.warn("Could not migrate progress_photos table columns:", err);
  }
}

export const db = drizzle(expoDb);
export const sqliteDb = expoDb;
