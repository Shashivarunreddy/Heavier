import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
  copyAsync,
  deleteAsync,
  readDirectoryAsync,
} from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { zip, unzip } from "react-native-zip-archive";
import { sqliteDb } from "@/db/sqlite";
import { Alert } from "react-native";

// ─── Constants ───────────────────────────────────────────────────────────────

const BACKUP_VERSION = 1;
const BACKUP_DIR = `${documentDirectory}heavier-backup/`;
const BACKUP_PHOTOS_DIR = `${BACKUP_DIR}photos/`;
const PHOTOS_DIR = `${documentDirectory}progress_photos/`;
const SETTINGS_FILE_PATH = `${documentDirectory}settings.json`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface BackupExercise {
  exerciseName: string;
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: number;
}

interface BackupWorkout {
  workoutName: string;
  workoutDate: string;
  durationSeconds: number;
  notes: string;
  createdAt: string;
  exercises: BackupExercise[];
}

interface BackupTemplateExercise {
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
}

interface BackupTemplate {
  name: string;
  notes: string;
  createdAt: string;
  exercises: BackupTemplateExercise[];
}

interface BackupPhotoSet {
  front: string | null;
  left: string | null;
  right: string | null;
  back: string | null;
}

interface BackupMeasurement {
  measurementDate: string;
  bodyWeight: number | null;
  chestSize: number | null;
  waistSize: number | null;
  leftArmSize: number | null;
  rightArmSize: number | null;
  leftThighSize: number | null;
  rightThighSize: number | null;
  createdAt: string;
  photos: BackupPhotoSet | null;
}

interface BackupCustomExercise {
  name: string;
  category: string;
  targetMuscle: string;
  instructions: string;
  createdAt: string;
}

interface BackupUser {
  name: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  createdAt: string;
}

interface BackupSettings {
  theme: string;
  weightUnit: string;
  lengthUnit: string;
}

interface BackupData {
  version: number;
  exportedAt: string;
  user: BackupUser | null;
  settings: BackupSettings;
  workouts: BackupWorkout[];
  templates: BackupTemplate[];
  measurements: BackupMeasurement[];
  customExercises: BackupCustomExercise[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureDirExists(dirPath: string): Promise<void> {
  const dirInfo = await getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(dirPath, { intermediates: true });
  }
}

async function cleanupDir(dirPath: string): Promise<void> {
  try {
    const dirInfo = await getInfoAsync(dirPath);
    if (dirInfo.exists) {
      await deleteAsync(dirPath, { idempotent: true });
    }
  } catch (err) {
    console.warn("[Backup] Failed to cleanup directory:", dirPath, err);
  }
}

/** Extracts just the filename from a full file path */
function getFileName(filePath: string): string {
  return filePath.split("/").pop() || filePath;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportBackup(): Promise<void> {
  try {
    // 1. Clean up any previous backup temp directory
    await cleanupDir(BACKUP_DIR);
    await ensureDirExists(BACKUP_DIR);
    await ensureDirExists(BACKUP_PHOTOS_DIR);

    // 2. Collect all data from SQLite

    // User
    const userRows = sqliteDb.getAllSync("SELECT * FROM users LIMIT 1") as any[];
    const user: BackupUser | null = userRows.length > 0
      ? {
          name: userRows[0].name,
          age: userRows[0].age,
          gender: userRows[0].gender,
          height: userRows[0].height,
          createdAt: userRows[0].created_at,
        }
      : null;

    // Settings
    let settings: BackupSettings = { theme: "system", weightUnit: "kg", lengthUnit: "cm" };
    try {
      const settingsInfo = await getInfoAsync(SETTINGS_FILE_PATH);
      if (settingsInfo.exists) {
        const content = await readAsStringAsync(SETTINGS_FILE_PATH);
        settings = { ...settings, ...JSON.parse(content) };
      }
    } catch (e) {
      console.warn("[Backup] Could not read settings file:", e);
    }

    // Workouts + Exercises
    const workoutRows = sqliteDb.getAllSync("SELECT * FROM workouts ORDER BY workout_date DESC") as any[];
    const workouts: BackupWorkout[] = workoutRows.map((w) => {
      const exerciseRows = sqliteDb.getAllSync(
        "SELECT * FROM exercises WHERE workout_id = ? ORDER BY id ASC",
        w.id
      ) as any[];

      return {
        workoutName: w.workout_name,
        workoutDate: w.workout_date,
        durationSeconds: w.duration_seconds,
        notes: w.notes || "",
        createdAt: w.created_at,
        exercises: exerciseRows.map((e) => ({
          exerciseName: e.exercise_name,
          setNumber: e.set_number,
          reps: e.reps,
          weight: e.weight,
          isCompleted: e.is_completed,
        })),
      };
    });

    // Templates + Template Exercises
    const templateRows = sqliteDb.getAllSync("SELECT * FROM templates ORDER BY name ASC") as any[];
    const templates: BackupTemplate[] = templateRows.map((t) => {
      const exerciseRows = sqliteDb.getAllSync(
        "SELECT * FROM template_exercises WHERE template_id = ? ORDER BY id ASC",
        t.id
      ) as any[];

      return {
        name: t.name,
        notes: t.notes || "",
        createdAt: t.created_at,
        exercises: exerciseRows.map((e) => ({
          exerciseName: e.exercise_name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
        })),
      };
    });

    // Measurements + Progress Photos
    const measurementRows = sqliteDb.getAllSync("SELECT * FROM measurements ORDER BY measurement_date DESC") as any[];
    const measurements: BackupMeasurement[] = [];

    for (const m of measurementRows) {
      const photoRows = sqliteDb.getAllSync(
        "SELECT * FROM progress_photos WHERE measurement_id = ?",
        m.id
      ) as any[];

      let photos: BackupPhotoSet | null = null;

      if (photoRows.length > 0) {
        const row = photoRows[0];
        const photoAngles = [
          { key: "front" as const, path: row.front_image_path },
          { key: "left" as const, path: row.left_image_path },
          { key: "right" as const, path: row.right_image_path },
          { key: "back" as const, path: row.back_image_path },
        ];

        photos = { front: null, left: null, right: null, back: null };

        for (const angle of photoAngles) {
          if (angle.path) {
            try {
              const fileInfo = await getInfoAsync(angle.path);
              if (fileInfo.exists) {
                const fileName = `m${m.id}_${angle.key}_${getFileName(angle.path)}`;
                await copyAsync({ from: angle.path, to: `${BACKUP_PHOTOS_DIR}${fileName}` });
                photos[angle.key] = fileName;
              }
            } catch (e) {
              console.warn(`[Backup] Could not copy photo ${angle.key} for measurement ${m.id}:`, e);
            }
          }
        }
      }

      measurements.push({
        measurementDate: m.measurement_date,
        bodyWeight: m.body_weight,
        chestSize: m.chest_size,
        waistSize: m.waist_size,
        leftArmSize: m.left_arm_size,
        rightArmSize: m.right_arm_size,
        leftThighSize: m.left_thigh_size,
        rightThighSize: m.right_thigh_size,
        createdAt: m.created_at,
        photos,
      });
    }

    // Custom Exercises
    const customExerciseRows = sqliteDb.getAllSync("SELECT * FROM custom_exercises ORDER BY name ASC") as any[];
    const customExercises: BackupCustomExercise[] = customExerciseRows.map((ce) => ({
      name: ce.name,
      category: ce.category,
      targetMuscle: ce.target_muscle || "",
      instructions: ce.instructions || "",
      createdAt: ce.created_at,
    }));

    // 3. Build backup JSON
    const backupData: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      user,
      settings,
      workouts,
      templates,
      measurements,
      customExercises,
    };

    // 4. Write backup.json
    await writeAsStringAsync(
      `${BACKUP_DIR}backup.json`,
      JSON.stringify(backupData, null, 2)
    );

    // 5. Create ZIP file
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const zipFileName = `heavier-backup-${dateStr}.zip`;
    const zipPath = `${documentDirectory}${zipFileName}`;

    // Delete old zip if exists
    try {
      const oldZip = await getInfoAsync(zipPath);
      if (oldZip.exists) {
        await deleteAsync(zipPath, { idempotent: true });
      }
    } catch {}

    await zip(BACKUP_DIR, zipPath);

    // 6. Share the ZIP file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(zipPath, {
        mimeType: "application/zip",
        dialogTitle: "Save Heavier Backup",
        UTI: "public.zip-archive",
      });
    } else {
      Alert.alert("Error", "Sharing is not available on this device.");
    }

    // 7. Clean up temp directory (keep zip for a bit in case sharing needs it)
    await cleanupDir(BACKUP_DIR);
    // Also clean the zip after sharing completes
    try {
      await deleteAsync(zipPath, { idempotent: true });
    } catch {}

  } catch (error) {
    console.error("[Backup] Export failed:", error);
    await cleanupDir(BACKUP_DIR);
    throw error;
  }
}

// ─── Import ──────────────────────────────────────────────────────────────────

export async function importBackup(): Promise<boolean> {
  const extractDir = `${documentDirectory}heavier-restore/`;

  try {
    // 1. Pick the backup ZIP file
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/zip",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }

    const pickedUri = result.assets[0].uri;

    // 2. Clean up and extract
    await cleanupDir(extractDir);
    await ensureDirExists(extractDir);
    await unzip(pickedUri, extractDir);

    // 3. Find backup.json — it might be at root or inside a subfolder
    let backupJsonPath = `${extractDir}backup.json`;
    let photosSourceDir = `${extractDir}photos/`;

    const topLevelInfo = await getInfoAsync(backupJsonPath);
    if (!topLevelInfo.exists) {
      // Check if there's a subfolder (e.g., heavier-backup/)
      const entries = await readDirectoryAsync(extractDir);
      for (const entry of entries) {
        const nestedPath = `${extractDir}${entry}/backup.json`;
        const nestedInfo = await getInfoAsync(nestedPath);
        if (nestedInfo.exists) {
          backupJsonPath = nestedPath;
          photosSourceDir = `${extractDir}${entry}/photos/`;
          break;
        }
      }
    }

    // 4. Read and validate backup.json
    const backupInfo = await getInfoAsync(backupJsonPath);
    if (!backupInfo.exists) {
      Alert.alert("Invalid Backup", "This ZIP file does not contain a valid Heavier backup.");
      await cleanupDir(extractDir);
      return false;
    }

    const backupContent = await readAsStringAsync(backupJsonPath);
    let backupData: BackupData;

    try {
      backupData = JSON.parse(backupContent);
    } catch {
      Alert.alert("Invalid Backup", "The backup file is corrupted or contains invalid data.");
      await cleanupDir(extractDir);
      return false;
    }

    if (!backupData.version || backupData.version > BACKUP_VERSION) {
      Alert.alert(
        "Unsupported Backup",
        `This backup was created with a newer version of Heavier (v${backupData.version}). Please update the app first.`
      );
      await cleanupDir(extractDir);
      return false;
    }

    // 5. Confirm with the user
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Restore Backup?",
        "This will replace ALL existing data in the app with data from the backup. This action cannot be undone.\n\nContinue?",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Restore", style: "destructive", onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
    });

    if (!confirmed) {
      await cleanupDir(extractDir);
      return false;
    }

    // 6. Wipe existing data and restore
    sqliteDb.execSync("PRAGMA foreign_keys = OFF;");
    sqliteDb.execSync("BEGIN TRANSACTION;");

    try {
      // Delete in correct order (children first due to foreign keys)
      sqliteDb.execSync("DELETE FROM exercises;");
      sqliteDb.execSync("DELETE FROM workouts;");
      sqliteDb.execSync("DELETE FROM template_exercises;");
      sqliteDb.execSync("DELETE FROM templates;");
      sqliteDb.execSync("DELETE FROM progress_photos;");
      sqliteDb.execSync("DELETE FROM measurements;");
      sqliteDb.execSync("DELETE FROM custom_exercises;");
      sqliteDb.execSync("DELETE FROM users;");

      // Restore User
      if (backupData.user) {
        const u = backupData.user;
        sqliteDb.runSync(
          "INSERT INTO users (name, age, gender, height, created_at) VALUES (?, ?, ?, ?, ?)",
          u.name,
          u.age,
          u.gender,
          u.height,
          u.createdAt || new Date().toISOString()
        );
      }

      // Restore Workouts + Exercises
      for (const w of backupData.workouts || []) {
        const result = sqliteDb.runSync(
          "INSERT INTO workouts (workout_name, workout_date, duration_seconds, notes, created_at) VALUES (?, ?, ?, ?, ?)",
          w.workoutName,
          w.workoutDate,
          w.durationSeconds,
          w.notes || "",
          w.createdAt || new Date().toISOString()
        );
        const workoutId = Number(result.lastInsertRowId);

        for (const e of w.exercises || []) {
          sqliteDb.runSync(
            "INSERT INTO exercises (workout_id, exercise_name, set_number, reps, weight, is_completed) VALUES (?, ?, ?, ?, ?, ?)",
            workoutId,
            e.exerciseName,
            e.setNumber,
            e.reps,
            e.weight,
            e.isCompleted ?? 1
          );
        }
      }

      // Restore Templates + Template Exercises
      for (const t of backupData.templates || []) {
        const result = sqliteDb.runSync(
          "INSERT INTO templates (name, notes, created_at) VALUES (?, ?, ?)",
          t.name,
          t.notes || "",
          t.createdAt || new Date().toISOString()
        );
        const templateId = Number(result.lastInsertRowId);

        for (const e of t.exercises || []) {
          sqliteDb.runSync(
            "INSERT INTO template_exercises (template_id, exercise_name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)",
            templateId,
            e.exerciseName,
            e.sets,
            e.reps,
            e.weight
          );
        }
      }

      // Restore Measurements + Photos
      await ensureDirExists(PHOTOS_DIR);

      for (const m of backupData.measurements || []) {
        const result = sqliteDb.runSync(
          `INSERT INTO measurements (measurement_date, body_weight, chest_size, waist_size, left_arm_size, right_arm_size, left_thigh_size, right_thigh_size, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          m.measurementDate,
          m.bodyWeight,
          m.chestSize,
          m.waistSize,
          m.leftArmSize,
          m.rightArmSize,
          m.leftThighSize,
          m.rightThighSize,
          m.createdAt || new Date().toISOString()
        );
        const measurementId = Number(result.lastInsertRowId);

        if (m.photos) {
          const restoredPhotos = { front: null as string | null, left: null as string | null, right: null as string | null, back: null as string | null };
          const angles: (keyof BackupPhotoSet)[] = ["front", "left", "right", "back"];

          for (const angle of angles) {
            const fileName = m.photos[angle];
            if (fileName) {
              const sourcePath = `${photosSourceDir}${fileName}`;
              try {
                const sourceInfo = await getInfoAsync(sourcePath);
                if (sourceInfo.exists) {
                  const destPath = `${PHOTOS_DIR}${measurementId}_${angle}_${Date.now()}.${fileName.split(".").pop() || "jpg"}`;
                  await copyAsync({ from: sourcePath, to: destPath });
                  restoredPhotos[angle] = destPath;
                }
              } catch (e) {
                console.warn(`[Backup] Could not restore photo ${angle} for measurement:`, e);
              }
            }
          }

          sqliteDb.runSync(
            `INSERT INTO progress_photos (measurement_id, front_image_path, left_image_path, right_image_path, back_image_path, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            measurementId,
            restoredPhotos.front,
            restoredPhotos.left,
            restoredPhotos.right,
            restoredPhotos.back,
            m.createdAt || new Date().toISOString()
          );
        }
      }

      // Restore Custom Exercises
      for (const ce of backupData.customExercises || []) {
        try {
          sqliteDb.runSync(
            "INSERT INTO custom_exercises (name, category, target_muscle, instructions, created_at) VALUES (?, ?, ?, ?, ?)",
            ce.name,
            ce.category,
            ce.targetMuscle || "",
            ce.instructions || "",
            ce.createdAt || new Date().toISOString()
          );
        } catch (e) {
          // Ignore duplicate entries
          console.warn(`[Backup] Skipping duplicate custom exercise: ${ce.name}`, e);
        }
      }

      sqliteDb.execSync("COMMIT;");
    } catch (err) {
      sqliteDb.execSync("ROLLBACK;");
      throw err;
    } finally {
      sqliteDb.execSync("PRAGMA foreign_keys = ON;");
    }

    // Restore Settings
    if (backupData.settings) {
      try {
        await writeAsStringAsync(
          SETTINGS_FILE_PATH,
          JSON.stringify(backupData.settings, null, 2)
        );
      } catch (e) {
        console.warn("[Backup] Could not restore settings:", e);
      }
    }

    // 7. Clean up
    await cleanupDir(extractDir);

    return true;
  } catch (error) {
    console.error("[Backup] Import failed:", error);
    await cleanupDir(extractDir);
    throw error;
  }
}
