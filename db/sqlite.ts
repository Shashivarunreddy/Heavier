import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expoDb = openDatabaseSync("heavier.db");

function dropColumnIfExists(tableName: string, colName: string) {
  try {
    const cols = expoDb.getAllSync(`PRAGMA table_info(${tableName})`) as { name: string }[];
    if (cols.some(c => c.name === colName)) {
      console.log(`[Database Migration] Dropping column ${colName} from table ${tableName}`);
      expoDb.execSync(`ALTER TABLE ${tableName} DROP COLUMN ${colName};`);
    }
  } catch (err) {
    console.warn(`[Database Migration] Failed to drop column ${colName} from table ${tableName}:`, err);
  }
}

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

  // 1. Run RENAME/DROP migrations first to preserve old column data and remove duplicates
  try {
    const workoutsCols = expoDb.getAllSync("PRAGMA table_info(workouts)") as { name: string }[];
    const hasCol = (name: string) => workoutsCols.some(c => c.name === name);
    if (hasCol("workout_date") && hasCol("date")) {
      expoDb.execSync("UPDATE workouts SET workout_date = date WHERE workout_date IS NULL OR workout_date = '';");
    } else if (!hasCol("workout_date") && hasCol("date")) {
      expoDb.execSync("ALTER TABLE workouts RENAME COLUMN date TO workout_date;");
    }
  } catch (err) {
    console.warn("Could not rename workouts table column:", err);
  }
  dropColumnIfExists("workouts", "date");

  try {
    const measurementsCols = expoDb.getAllSync("PRAGMA table_info(measurements)") as { name: string }[];
    const hasCol = (name: string) => measurementsCols.some(c => c.name === name);
    
    // date -> measurement_date
    if (hasCol("measurement_date") && hasCol("date")) {
      expoDb.execSync("UPDATE measurements SET measurement_date = date WHERE measurement_date IS NULL OR measurement_date = '';");
    } else if (!hasCol("measurement_date") && hasCol("date")) {
      expoDb.execSync("ALTER TABLE measurements RENAME COLUMN date TO measurement_date;");
    }
    
    // weight -> body_weight
    if (hasCol("body_weight") && hasCol("weight")) {
      expoDb.execSync("UPDATE measurements SET body_weight = weight WHERE body_weight IS NULL;");
    } else if (!hasCol("body_weight") && hasCol("weight")) {
      expoDb.execSync("ALTER TABLE measurements RENAME COLUMN weight TO body_weight;");
    }
  } catch (err) {
    console.warn("Could not rename measurements table column:", err);
  }
  dropColumnIfExists("measurements", "date");
  dropColumnIfExists("measurements", "weight");

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(exercises)") as { name: string }[];
    const hasCol = (colName: string) => cols.some(c => c.name === colName);

    // workoutId -> workout_id
    if (hasCol("workout_id") && hasCol("workoutId")) {
      expoDb.execSync("UPDATE exercises SET workout_id = workoutId WHERE workout_id IS NULL OR workout_id = 0;");
    } else if (!hasCol("workout_id") && hasCol("workoutId")) {
      expoDb.execSync("ALTER TABLE exercises RENAME COLUMN workoutId TO workout_id;");
    }

    // name -> exercise_name
    if (hasCol("exercise_name") && hasCol("name")) {
      expoDb.execSync("UPDATE exercises SET exercise_name = name WHERE exercise_name IS NULL OR exercise_name = '';");
    } else if (!hasCol("exercise_name") && hasCol("name")) {
      expoDb.execSync("ALTER TABLE exercises RENAME COLUMN name TO exercise_name;");
    }

    // exerciseName -> exercise_name
    if (hasCol("exercise_name") && hasCol("exerciseName")) {
      expoDb.execSync("UPDATE exercises SET exercise_name = exerciseName WHERE exercise_name IS NULL OR exercise_name = '';");
    } else if (!hasCol("exercise_name") && hasCol("exerciseName")) {
      expoDb.execSync("ALTER TABLE exercises RENAME COLUMN exerciseName TO exercise_name;");
    }

    // setNumber -> set_number
    if (hasCol("set_number") && hasCol("setNumber")) {
      expoDb.execSync("UPDATE exercises SET set_number = setNumber WHERE set_number IS NULL OR set_number = 0;");
    } else if (!hasCol("set_number") && hasCol("setNumber")) {
      expoDb.execSync("ALTER TABLE exercises RENAME COLUMN setNumber TO set_number;");
    }

    // isCompleted -> is_completed
    if (hasCol("is_completed") && hasCol("isCompleted")) {
      expoDb.execSync("UPDATE exercises SET is_completed = isCompleted WHERE is_completed IS NULL;");
    } else if (!hasCol("is_completed") && hasCol("isCompleted")) {
      expoDb.execSync("ALTER TABLE exercises RENAME COLUMN isCompleted TO is_completed;");
    }

    // Rebuild table if 'name' exists to drop the UNIQUE constraint
    if (hasCol("name")) {
      console.log("[Database Migration] Rebuilding exercises table to drop legacy unique 'name' column...");
      expoDb.execSync("PRAGMA foreign_keys = OFF;");
      expoDb.execSync("BEGIN TRANSACTION;");
      try {
        expoDb.execSync("ALTER TABLE exercises RENAME TO old_exercises;");
        expoDb.execSync(`
          CREATE TABLE exercises (
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
        
        const oldCols = expoDb.getAllSync("PRAGMA table_info(old_exercises)") as { name: string }[];
        const hasExerciseName = oldCols.some(c => c.name === "exercise_name");
        
        if (hasExerciseName) {
          expoDb.execSync(`
            INSERT INTO exercises (id, workout_id, exercise_name, set_number, reps, weight, is_completed)
            SELECT id, workout_id, COALESCE(NULLIF(exercise_name, ''), name), set_number, reps, weight, is_completed
            FROM old_exercises;
          `);
        } else {
          expoDb.execSync(`
            INSERT INTO exercises (id, workout_id, exercise_name, set_number, reps, weight, is_completed)
            SELECT id, workout_id, name, set_number, reps, weight, is_completed
            FROM old_exercises;
          `);
        }
        
        expoDb.execSync("DROP TABLE old_exercises;");
        expoDb.execSync("COMMIT;");
        console.log("[Database Migration] Rebuilt exercises table successfully.");
      } catch (err) {
        expoDb.execSync("ROLLBACK;");
        throw err;
      } finally {
        expoDb.execSync("PRAGMA foreign_keys = ON;");
      }
    }
  } catch (err) {
    console.warn("Could not rename/rebuild exercises table columns:", err);
  }
  dropColumnIfExists("exercises", "workoutId");
  dropColumnIfExists("exercises", "exerciseName");
  dropColumnIfExists("exercises", "setNumber");
  dropColumnIfExists("exercises", "isCompleted");

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(template_exercises)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);

    // templateId -> template_id
    if (hasCol("template_id") && hasCol("templateId")) {
      expoDb.execSync("UPDATE template_exercises SET template_id = templateId WHERE template_id IS NULL OR template_id = 0;");
    } else if (!hasCol("template_id") && hasCol("templateId")) {
      expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN templateId TO template_id;");
    }

    // exerciseName -> exercise_name
    if (hasCol("exercise_name") && hasCol("exerciseName")) {
      expoDb.execSync("UPDATE template_exercises SET exercise_name = exerciseName WHERE exercise_name IS NULL OR exercise_name = '';");
    } else if (!hasCol("exercise_name") && hasCol("exerciseName")) {
      expoDb.execSync("ALTER TABLE template_exercises RENAME COLUMN exerciseName TO exercise_name;");
    }
  } catch (err) {
    console.warn("Could not rename template_exercises table columns:", err);
  }
  dropColumnIfExists("template_exercises", "templateId");
  dropColumnIfExists("template_exercises", "exerciseName");

  try {
    const cols = expoDb.getAllSync("PRAGMA table_info(progress_photos)") as { name: string }[];
    const hasCol = (name: string) => cols.some(c => c.name === name);
    
    // measurementId -> measurement_id
    if (hasCol("measurement_id") && hasCol("measurementId")) {
      expoDb.execSync("UPDATE progress_photos SET measurement_id = measurementId WHERE measurement_id IS NULL;");
    } else if (!hasCol("measurement_id") && hasCol("measurementId")) {
      expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN measurementId TO measurement_id;");
    }

    // frontImagePath -> front_image_path
    if (hasCol("front_image_path") && hasCol("frontImagePath")) {
      expoDb.execSync("UPDATE progress_photos SET front_image_path = frontImagePath WHERE front_image_path IS NULL;");
    } else if (!hasCol("front_image_path") && hasCol("frontImagePath")) {
      expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN frontImagePath TO front_image_path;");
    }

    // leftImagePath -> left_image_path
    if (hasCol("left_image_path") && hasCol("leftImagePath")) {
      expoDb.execSync("UPDATE progress_photos SET left_image_path = leftImagePath WHERE left_image_path IS NULL;");
    } else if (!hasCol("left_image_path") && hasCol("leftImagePath")) {
      expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN leftImagePath TO left_image_path;");
    }

    // rightImagePath -> right_image_path
    if (hasCol("right_image_path") && hasCol("rightImagePath")) {
      expoDb.execSync("UPDATE progress_photos SET right_image_path = rightImagePath WHERE right_image_path IS NULL;");
    } else if (!hasCol("right_image_path") && hasCol("rightImagePath")) {
      expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN rightImagePath TO right_image_path;");
    }

    // backImagePath -> back_image_path
    if (hasCol("back_image_path") && hasCol("backImagePath")) {
      expoDb.execSync("UPDATE progress_photos SET back_image_path = backImagePath WHERE back_image_path IS NULL;");
    } else if (!hasCol("back_image_path") && hasCol("backImagePath")) {
      expoDb.execSync("ALTER TABLE progress_photos RENAME COLUMN backImagePath TO back_image_path;");
    }
  } catch (err) {
    console.warn("Could not rename progress_photos table columns:", err);
  }
  dropColumnIfExists("progress_photos", "measurementId");
  dropColumnIfExists("progress_photos", "frontImagePath");
  dropColumnIfExists("progress_photos", "leftImagePath");
  dropColumnIfExists("progress_photos", "rightImagePath");
  dropColumnIfExists("progress_photos", "backImagePath");

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
