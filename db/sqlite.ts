import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expoDb = openDatabaseSync("heavier.db");

function synchronizeTableSchema(tableName: string, expectedColumns: { name: string; type: string; isNotNull?: boolean; defaultValue?: string }[]) {
  try {
    const existingCols = expoDb.getAllSync(`PRAGMA table_info(${tableName})`) as { name: string }[];
    const existingNames = new Set(existingCols.map(c => c.name));
    
    for (const col of expectedColumns) {
      if (!existingNames.has(col.name)) {
        let sql = `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`;
        if (col.isNotNull) {
          sql += ` NOT NULL DEFAULT ${col.defaultValue ?? "''"}`;
        }
        console.log(`[Database Migration] Adding column ${col.name} to table ${tableName}: ${sql}`);
        expoDb.execSync(sql);
      }
    }
  } catch (err) {
    console.warn(`[Database Migration] Failed to synchronize schema for table ${tableName}:`, err);
  }
}

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
      chest_size REAL,
      waist_size REAL,
      left_arm_size REAL,
      right_arm_size REAL,
      left_thigh_size REAL,
      right_thigh_size REAL,
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

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS custom_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      target_muscle TEXT,
      instructions TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 1. Run RENAME migrations first to preserve old column data
  try {
    const workoutsCols = expoDb.getAllSync("PRAGMA table_info(workouts)") as { name: string }[];
    const hasWorkoutDate = workoutsCols.some(c => c.name === "workout_date");
    const hasDateCol = workoutsCols.some(c => c.name === "date");
    if (!hasWorkoutDate && hasDateCol) {
      expoDb.execSync("ALTER TABLE workouts RENAME COLUMN date TO workout_date;");
    }
  } catch (err) {
    console.warn("Could not rename workouts table column:", err);
  }

  try {
    const measurementsCols = expoDb.getAllSync("PRAGMA table_info(measurements)") as { name: string }[];
    const hasMeasurementDate = measurementsCols.some(c => c.name === "measurement_date");
    const hasDateCol = measurementsCols.some(c => c.name === "date");
    if (!hasMeasurementDate && hasDateCol) {
      expoDb.execSync("ALTER TABLE measurements RENAME COLUMN date TO measurement_date;");
    }
    const hasBodyWeight = measurementsCols.some(c => c.name === "body_weight");
    const hasWeightCol = measurementsCols.some(c => c.name === "weight");
    if (!hasBodyWeight && hasWeightCol) {
      expoDb.execSync("ALTER TABLE measurements RENAME COLUMN weight TO body_weight;");
    }
  } catch (err) {
    console.warn("Could not rename measurements table column:", err);
  }

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(exercises)") as { name: string }[];
    const hasCol = (colName: string) => cols.some(c => c.name === colName);
    if (!hasCol("workout_id") && hasCol("workoutId")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN workoutId TO workout_id;");
    // Handle old schema where exercise name column was called "name" (not "exerciseName" or "exercise_name")
    if (!hasCol("exercise_name") && hasCol("name")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN name TO exercise_name;");
    if (!hasCol("exercise_name") && hasCol("exerciseName")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN exerciseName TO exercise_name;");
    if (!hasCol("set_number") && hasCol("setNumber")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN setNumber TO set_number;");
    if (!hasCol("is_completed") && hasCol("isCompleted")) expoDb.execSync("ALTER TABLE exercises RENAME COLUMN isCompleted TO is_completed;");
  } catch (err) {
    console.warn("Could not rename exercises table columns:", err);
  }

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(template_exercises)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    if (!hasCol("template_id") && hasCol("templateId")) expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN templateId TO template_id;");
    if (!hasCol("exercise_name") && hasCol("exerciseName")) expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN exerciseName TO exercise_name;");
  } catch (err) {
    console.warn("Could not rename template_exercises table columns:", err);
  }

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(progress_photos)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    if (!hasCol("measurement_id") && hasCol("measurementId")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN measurementId TO measurement_id;");
    if (!hasCol("front_image_path") && hasCol("frontImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN frontImagePath TO front_image_path;");
    if (!hasCol("left_image_path") && hasCol("leftImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN leftImagePath TO left_image_path;");
    if (!hasCol("right_image_path") && hasCol("rightImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN rightImagePath TO right_image_path;");
    if (!hasCol("back_image_path") && hasCol("backImagePath")) expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN backImagePath TO back_image_path;");
  } catch (err) {
    console.warn("Could not rename progress_photos table columns:", err);
  }

  // 2. Synchronize all table columns dynamically
  synchronizeTableSchema("users", [
    { name: "name", type: "TEXT", isNotNull: true },
    { name: "age", type: "INTEGER" },
    { name: "gender", type: "TEXT" },
    { name: "height", type: "REAL" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);

  synchronizeTableSchema("templates", [
    { name: "name", type: "TEXT", isNotNull: true },
    { name: "notes", type: "TEXT" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);

  synchronizeTableSchema("template_exercises", [
    { name: "template_id", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "exercise_name", type: "TEXT", isNotNull: true },
    { name: "sets", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "reps", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "weight", type: "REAL", isNotNull: true, defaultValue: "0" }
  ]);

  synchronizeTableSchema("workouts", [
    { name: "workout_name", type: "TEXT", isNotNull: true },
    { name: "workout_date", type: "TEXT", isNotNull: true },
    { name: "duration_seconds", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "notes", type: "TEXT" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);

  synchronizeTableSchema("exercises", [
    { name: "workout_id", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "exercise_name", type: "TEXT", isNotNull: true },
    { name: "set_number", type: "INTEGER", isNotNull: true, defaultValue: "1" },
    { name: "reps", type: "INTEGER", isNotNull: true, defaultValue: "0" },
    { name: "weight", type: "REAL", isNotNull: true, defaultValue: "0" },
    { name: "is_completed", type: "INTEGER", defaultValue: "1" }
  ]);

  synchronizeTableSchema("measurements", [
    { name: "measurement_date", type: "TEXT", isNotNull: true },
    { name: "body_weight", type: "REAL" },
    { name: "chest_size", type: "REAL" },
    { name: "waist_size", type: "REAL" },
    { name: "left_arm_size", type: "REAL" },
    { name: "right_arm_size", type: "REAL" },
    { name: "left_thigh_size", type: "REAL" },
    { name: "right_thigh_size", type: "REAL" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);

  // Migrate legacy data if needed
  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(measurements)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    if (hasCol("arm_size")) {
      expoDb.execSync(`
        UPDATE measurements
        SET left_arm_size = COALESCE(left_arm_size, arm_size),
            right_arm_size = COALESCE(right_arm_size, arm_size)
        WHERE arm_size IS NOT NULL;
      `);
    }
    if (hasCol("thigh_size")) {
      expoDb.execSync(`
        UPDATE measurements
        SET left_thigh_size = COALESCE(left_thigh_size, thigh_size),
            right_thigh_size = COALESCE(right_thigh_size, thigh_size)
        WHERE thigh_size IS NOT NULL;
      `);
    }
  } catch (err) {
    console.warn("Failed to migrate legacy arm_size / thigh_size columns:", err);
  }

  synchronizeTableSchema("progress_photos", [
    { name: "measurement_id", type: "INTEGER" },
    { name: "front_image_path", type: "TEXT" },
    { name: "left_image_path", type: "TEXT" },
    { name: "right_image_path", type: "TEXT" },
    { name: "back_image_path", type: "TEXT" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);

  synchronizeTableSchema("custom_exercises", [
    { name: "name", type: "TEXT", isNotNull: true },
    { name: "category", type: "TEXT", isNotNull: true },
    { name: "target_muscle", type: "TEXT" },
    { name: "instructions", type: "TEXT" },
    { name: "created_at", type: "TEXT", isNotNull: true }
  ]);
}

export const db = drizzle(expoDb);
export const sqliteDb = expoDb;
