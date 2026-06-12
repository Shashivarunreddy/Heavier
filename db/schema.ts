import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  height: real("height"),
  createdAt: text("created_at").notNull(),
});

export const templates = sqliteTable("templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const templateExercises = sqliteTable("template_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  templateId: integer("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(),
});

export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutName: text("workout_name").notNull(),
  workoutDate: text("workout_date").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(),
  isCompleted: integer("is_completed").default(1),
});

export const measurements = sqliteTable("measurements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  measurementDate: text("measurement_date").notNull(),
  bodyWeight: real("body_weight"),
  armSize: real("arm_size"),
  chestSize: real("chest_size"),
  waistSize: real("waist_size"),
  thighSize: real("thigh_size"),
  shoulderSize: real("shoulder_size"),
  neckSize: real("neck_size"),
  createdAt: text("created_at").notNull(),
});

export const progressPhotos = sqliteTable("progress_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  measurementId: integer("measurement_id")
    .references(() => measurements.id, { onDelete: "cascade" }),
  frontImagePath: text("front_image_path"),
  leftImagePath: text("left_image_path"),
  rightImagePath: text("right_image_path"),
  backImagePath: text("back_image_path"),
  createdAt: text("created_at").notNull(),
});
