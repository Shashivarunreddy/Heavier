import { create } from "zustand";
import { sqliteDb } from "@/db/sqlite";

interface DBTemplateRow {
  id: number;
  name: string;
  notes: string | null;
  created_at: string;
}

interface DBTemplateExerciseRow {
  id: number;
  template_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface DBWorkoutRow {
  id: number;
  workout_name: string;
  workout_date: string;
  duration_seconds: number;
  notes: string | null;
  created_at: string;
}

interface DBExerciseRow {
  id: number;
  workout_id: number;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number;
  is_completed: number;
}

export interface TemplateExercise {
  id?: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  notes: string;
  exercises: TemplateExercise[];
}

export interface ActiveSet {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface ActiveExercise {
  exerciseName: string;
  sets: ActiveSet[];
}

export interface ActiveWorkout {
  name: string;
  startTime: number; // timestamp
  exercises: ActiveExercise[];
  templateId?: number;
}

export interface HistorySet {
  id: number;
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

export interface HistoryExercise {
  exerciseName: string;
  sets: HistorySet[];
}

export interface WorkoutHistoryEntry {
  id: number;
  workoutName: string;
  workoutDate: string;
  durationSeconds: number;
  notes: string;
  exercises: HistoryExercise[];
}

interface WorkoutState {
  templates: WorkoutTemplate[];
  activeWorkout: ActiveWorkout | null;
  workoutHistory: WorkoutHistoryEntry[];
  isLoading: boolean;

  loadTemplates: () => Promise<void>;
  createTemplate: (name: string, notes: string, exercises: Omit<TemplateExercise, "id">[]) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  
  startWorkout: (templateId: number | null, customName?: string) => void;
  updateActiveSet: (exerciseIndex: number, setIndex: number, fields: Partial<ActiveSet>) => void;
  addExerciseToActiveWorkout: (exerciseName: string) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  addSetToActiveExercise: (exerciseIndex: number) => void;
  removeSetFromActiveExercise: (exerciseIndex: number, setIndex: number) => void;
  finishActiveWorkout: (notes: string) => Promise<WorkoutHistoryEntry | null>;
  cancelActiveWorkout: () => void;

  loadWorkoutHistory: () => Promise<void>;
  deleteWorkoutFromHistory: (id: number) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  templates: [],
  activeWorkout: null,
  workoutHistory: [],
  isLoading: false,

  loadTemplates: async () => {
    set({ isLoading: true });
    try {
      const templateRows = sqliteDb.getAllSync("SELECT * FROM templates ORDER BY name ASC") as DBTemplateRow[];
      const templatesList: WorkoutTemplate[] = [];

      for (const t of templateRows) {
        const exerciseRows = sqliteDb.getAllSync(
          "SELECT * FROM template_exercises WHERE template_id = ?",
          t.id
        ) as DBTemplateExerciseRow[];

        templatesList.push({
          id: t.id,
          name: t.name,
          notes: t.notes || "",
          exercises: exerciseRows.map((e) => ({
            id: e.id,
            exerciseName: e.exercise_name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
          })),
        });
      }

      set({ templates: templatesList, isLoading: false });
    } catch (e) {
      console.error("Failed to load templates:", e);
      set({ isLoading: false });
    }
  },

  createTemplate: async (name: string, notes: string, exercises: Omit<TemplateExercise, "id">[]) => {
    try {
      const createdAt = new Date().toISOString();
      
      // Wrap in SQLite transaction manually for safety
      sqliteDb.execSync("BEGIN TRANSACTION;");
      
      try {
        const result = sqliteDb.runSync(
          "INSERT INTO templates (name, notes, created_at) VALUES (?, ?, ?)",
          name,
          notes,
          createdAt
        );
        
        const templateId = result.lastInsertRowId;

        for (const e of exercises) {
          sqliteDb.runSync(
            `INSERT INTO template_exercises (template_id, exercise_name, sets, reps, weight)
            VALUES (?, ?, ?, ?, ?)`,
            templateId,
            e.exerciseName,
            e.sets,
            e.reps,
            e.weight
          );
        }

        sqliteDb.execSync("COMMIT;");
      } catch (err) {
        sqliteDb.execSync("ROLLBACK;");
        throw err;
      }

      await get().loadTemplates();
    } catch (e) {
      console.error("Failed to create template:", e);
    }
  },

  deleteTemplate: async (id: number) => {
    try {
      sqliteDb.runSync("DELETE FROM templates WHERE id = ?", id);
      await get().loadTemplates();
    } catch (e) {
      console.error("Failed to delete template:", e);
    }
  },

  startWorkout: (templateId: number | null, customName?: string) => {
    if (templateId !== null) {
      const template = get().templates.find((t) => t.id === templateId);
      if (template) {
        const activeExercises: ActiveExercise[] = template.exercises.map((e) => {
          const sets: ActiveSet[] = [];
          for (let i = 0; i < e.sets; i++) {
            sets.push({
              setNumber: i + 1,
              weight: e.weight,
              reps: e.reps,
              isCompleted: false,
            });
          }
          return {
            exerciseName: e.exerciseName,
            sets,
          };
        });

        set({
          activeWorkout: {
            name: template.name,
            startTime: Date.now(),
            exercises: activeExercises,
            templateId,
          },
        });
      }
    } else {
      set({
        activeWorkout: {
          name: customName || "Custom Workout",
          startTime: Date.now(),
          exercises: [],
        },
      });
    }
  },

  updateActiveSet: (exerciseIndex: number, setIndex: number, fields: Partial<ActiveSet>) => {
    const active = get().activeWorkout;
    if (!active) return;

    const updatedExercises = [...active.exercises];
    const exercise = { ...updatedExercises[exerciseIndex] };
    const sets = [...exercise.sets];
    sets[setIndex] = { ...sets[setIndex], ...fields };
    exercise.sets = sets;
    updatedExercises[exerciseIndex] = exercise;

    set({
      activeWorkout: {
        ...active,
        exercises: updatedExercises,
      },
    });
  },

  addExerciseToActiveWorkout: (exerciseName: string) => {
    const active = get().activeWorkout;
    if (!active) return;

    // Check if exercise already exists in active workout to avoid duplicates, or just append it
    const updatedExercises = [
      ...active.exercises,
      {
        exerciseName,
        sets: [
          {
            setNumber: 1,
            weight: 0,
            reps: 10,
            isCompleted: false,
          },
        ],
      },
    ];

    set({
      activeWorkout: {
        ...active,
        exercises: updatedExercises,
      },
    });
  },

  removeExerciseFromActiveWorkout: (exerciseIndex: number) => {
    const active = get().activeWorkout;
    if (!active) return;

    const updatedExercises = active.exercises.filter((_, idx) => idx !== exerciseIndex);

    set({
      activeWorkout: {
        ...active,
        exercises: updatedExercises,
      },
    });
  },

  addSetToActiveExercise: (exerciseIndex: number) => {
    const active = get().activeWorkout;
    if (!active) return;

    const updatedExercises = [...active.exercises];
    const exercise = { ...updatedExercises[exerciseIndex] };
    const sets = [...exercise.sets];

    // Copy settings of previous set if available
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      isCompleted: false,
    });

    exercise.sets = sets;
    updatedExercises[exerciseIndex] = exercise;

    set({
      activeWorkout: {
        ...active,
        exercises: updatedExercises,
      },
    });
  },

  removeSetFromActiveExercise: (exerciseIndex: number, setIndex: number) => {
    const active = get().activeWorkout;
    if (!active) return;

    const updatedExercises = [...active.exercises];
    const exercise = { ...updatedExercises[exerciseIndex] };
    
    // Remove the set and re-number sets
    const sets = exercise.sets
      .filter((_, idx) => idx !== setIndex)
      .map((set, idx) => ({ ...set, setNumber: idx + 1 }));

    exercise.sets = sets;
    updatedExercises[exerciseIndex] = exercise;

    set({
      activeWorkout: {
        ...active,
        exercises: updatedExercises,
      },
    });
  },

  finishActiveWorkout: async (notes: string) => {
    const active = get().activeWorkout;
    if (!active) return null;

    const durationSeconds = Math.round((Date.now() - active.startTime) / 1000);
    const workoutDate = new Date().toISOString();
    const createdAt = new Date().toISOString();

    try {
      sqliteDb.execSync("BEGIN TRANSACTION;");

      let workoutId: number;
      try {
        const result = sqliteDb.runSync(
          `INSERT INTO workouts (workout_name, workout_date, duration_seconds, notes, created_at)
          VALUES (?, ?, ?, ?, ?)`,
          active.name,
          workoutDate,
          durationSeconds,
          notes,
          createdAt
        );
        
        workoutId = Number(result.lastInsertRowId);

        for (const ex of active.exercises) {
          for (const s of ex.sets) {
            sqliteDb.runSync(
              `INSERT INTO exercises (workout_id, exercise_name, set_number, reps, weight, is_completed)
              VALUES (?, ?, ?, ?, ?, ?)`,
              workoutId,
              ex.exerciseName,
              s.setNumber,
              s.reps,
              s.weight,
              s.isCompleted ? 1 : 0
            );
          }
        }

        sqliteDb.execSync("COMMIT;");
      } catch (err) {
        sqliteDb.execSync("ROLLBACK;");
        throw err;
      }

      set({ activeWorkout: null });
      await get().loadWorkoutHistory();
      
      // Find and return the newly created entry
      const history = get().workoutHistory;
      return history.find((h) => h.id === workoutId) || null;
    } catch (e) {
      console.error("Failed to finish active workout:", e);
      return null;
    }
  },

  cancelActiveWorkout: () => {
    set({ activeWorkout: null });
  },

  loadWorkoutHistory: async () => {
    set({ isLoading: true });
    try {
      const workoutRows = sqliteDb.getAllSync("SELECT * FROM workouts ORDER BY workout_date DESC") as DBWorkoutRow[];
      const historyList: WorkoutHistoryEntry[] = [];

      for (const w of workoutRows) {
        const exerciseRows = sqliteDb.getAllSync(
          "SELECT * FROM exercises WHERE workout_id = ? ORDER BY id ASC",
          w.id
        ) as DBExerciseRow[];

        // Group sets by exercise name
        const exerciseMap: { [name: string]: HistorySet[] } = {};
        for (const e of exerciseRows) {
          if (!exerciseMap[e.exercise_name]) {
            exerciseMap[e.exercise_name] = [];
          }
          exerciseMap[e.exercise_name].push({
            id: e.id,
            setNumber: e.set_number,
            reps: e.reps,
            weight: e.weight,
            isCompleted: e.is_completed === 1,
          });
        }

        const exercises: HistoryExercise[] = Object.keys(exerciseMap).map((name) => ({
          exerciseName: name,
          sets: exerciseMap[name],
        }));

        historyList.push({
          id: w.id,
          workoutName: w.workout_name,
          workoutDate: w.workout_date,
          durationSeconds: w.duration_seconds,
          notes: w.notes || "",
          exercises,
        });
      }

      set({ workoutHistory: historyList, isLoading: false });
    } catch (e) {
      console.error("Failed to load workout history:", e);
      set({ isLoading: false });
    }
  },

  deleteWorkoutFromHistory: async (id: number) => {
    try {
      sqliteDb.runSync("DELETE FROM workouts WHERE id = ?", id);
      await get().loadWorkoutHistory();
    } catch (e) {
      console.error("Failed to delete workout history entry:", e);
    }
  },
}));
