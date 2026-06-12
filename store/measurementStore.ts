import { create } from "zustand";
import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync } from "expo-file-system/legacy";
import { sqliteDb } from "@/db/sqlite";

export interface ProgressPhotos {
  front: string | null;
  left: string | null;
  right: string | null;
  back: string | null;
}

export interface MeasurementEntry {
  id: number;
  measurementDate: string;
  bodyWeight: number | null;
  armSize: number | null;
  chestSize: number | null;
  waistSize: number | null;
  thighSize: number | null;
  shoulderSize: number | null;
  neckSize: number | null;
  photos: ProgressPhotos | null;
}

interface DBMeasurementRow {
  id: number;
  measurement_date: string;
  body_weight: number | null;
  arm_size: number | null;
  chest_size: number | null;
  waist_size: number | null;
  thigh_size: number | null;
  shoulder_size: number | null;
  neck_size: number | null;
  created_at: string;
}

interface DBProgressPhotoRow {
  id: number;
  measurement_id: number;
  front_image_path: string | null;
  left_image_path: string | null;
  right_image_path: string | null;
  back_image_path: string | null;
  created_at: string;
}

interface MeasurementState {
  measurements: MeasurementEntry[];
  isLoading: boolean;
  loadMeasurements: () => Promise<void>;
  addMeasurement: (
    date: string,
    metrics: {
      bodyWeight?: number;
      armSize?: number;
      chestSize?: number;
      waistSize?: number;
      thighSize?: number;
      shoulderSize?: number;
      neckSize?: number;
    },
    photos?: Partial<ProgressPhotos>
  ) => Promise<void>;
  deleteMeasurement: (id: number) => Promise<void>;
}

const PHOTOS_DIR = `${documentDirectory}progress_photos/`;

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  measurements: [],
  isLoading: false,

  loadMeasurements: async () => {
    set({ isLoading: true });
    try {
      const rows = sqliteDb.getAllSync("SELECT * FROM measurements ORDER BY measurement_date DESC") as DBMeasurementRow[];
      const entries: MeasurementEntry[] = [];

      for (const r of rows) {
        const photoRow = sqliteDb.getAllSync(
          "SELECT * FROM progress_photos WHERE measurement_id = ?",
          r.id
        ) as DBProgressPhotoRow[];

        let photos: ProgressPhotos | null = null;
        if (photoRow.length > 0) {
          photos = {
            front: photoRow[0].front_image_path || null,
            left: photoRow[0].left_image_path || null,
            right: photoRow[0].right_image_path || null,
            back: photoRow[0].back_image_path || null,
          };
        }

        entries.push({
          id: r.id,
          measurementDate: r.measurement_date,
          bodyWeight: r.body_weight || null,
          armSize: r.arm_size || null,
          chestSize: r.chest_size || null,
          waistSize: r.waist_size || null,
          thighSize: r.thigh_size || null,
          shoulderSize: r.shoulder_size || null,
          neckSize: r.neck_size || null,
          photos,
        });
      }

      set({ measurements: entries, isLoading: false });
    } catch (e) {
      console.error("Failed to load measurements:", e);
      set({ isLoading: false });
    }
  },

  addMeasurement: async (date, metrics, photos) => {
    try {
      const createdAt = new Date().toISOString();
      const weight = metrics.bodyWeight ?? null;
      const arm = metrics.armSize ?? null;
      const chest = metrics.chestSize ?? null;
      const waist = metrics.waistSize ?? null;
      const thigh = metrics.thighSize ?? null;
      const shoulder = metrics.shoulderSize ?? null;
      const neck = metrics.neckSize ?? null;

      sqliteDb.execSync("BEGIN TRANSACTION;");
      let measurementId: number;

      try {
        const result = sqliteDb.runSync(
          `INSERT INTO measurements (
            measurement_date, body_weight, arm_size, chest_size, waist_size, thigh_size, shoulder_size, neck_size, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          date,
          weight,
          arm,
          chest,
          waist,
          thigh,
          shoulder,
          neck,
          createdAt
        );
        
        measurementId = Number(result.lastInsertRowId);

        // Handle photo saving if photos are present
        if (photos && (photos.front || photos.back || photos.left || photos.right)) {
          // Ensure directory exists
          const dirInfo = await getInfoAsync(PHOTOS_DIR);
          if (!dirInfo.exists) {
            await makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
          }

          const photoPaths: ProgressPhotos = {
            front: null,
            left: null,
            right: null,
            back: null,
          };

          const angles: (keyof ProgressPhotos)[] = ["front", "left", "right", "back"];
          for (const angle of angles) {
            const sourceUri = photos[angle];
            if (sourceUri) {
              const fileExtension = sourceUri.split(".").pop() || "jpg";
              const destPath = `${PHOTOS_DIR}${measurementId}_${angle}_${Date.now()}.${fileExtension}`;
              await copyAsync({ from: sourceUri, to: destPath });
              photoPaths[angle] = destPath;
            }
          }

          sqliteDb.runSync(
            `INSERT INTO progress_photos (
              measurement_id, front_image_path, left_image_path, right_image_path, back_image_path, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            measurementId,
            photoPaths.front,
            photoPaths.left,
            photoPaths.right,
            photoPaths.back,
            createdAt
          );
        }

        sqliteDb.execSync("COMMIT;");
      } catch (err) {
        sqliteDb.execSync("ROLLBACK;");
        throw err;
      }

      await get().loadMeasurements();
    } catch (e) {
      console.error("Failed to add measurement entry:", e);
    }
  },

  deleteMeasurement: async (id: number) => {
    try {
      // Find files to delete
      const photoRows = sqliteDb.getAllSync(
        "SELECT * FROM progress_photos WHERE measurement_id = ?",
        id
      ) as DBProgressPhotoRow[];

      if (photoRows.length > 0) {
        const row = photoRows[0];
        const paths = [
          row.front_image_path,
          row.left_image_path,
          row.right_image_path,
          row.back_image_path,
        ];
        
        for (const path of paths) {
          if (path) {
            const fileInfo = await getInfoAsync(path);
            if (fileInfo.exists) {
              await deleteAsync(path, { idempotent: true });
            }
          }
        }
      }

      // SQLite cascade delete takes care of progress_photos rows
      sqliteDb.runSync("DELETE FROM measurements WHERE id = ?", id);

      await get().loadMeasurements();
    } catch (e) {
      console.error("Failed to delete measurement:", e);
    }
  },
}));

