import { create } from "zustand";
import { documentDirectory, getInfoAsync, readAsStringAsync, writeAsStringAsync } from "expo-file-system/legacy";
import { db, sqliteDb } from "@/db/sqlite";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  weightUnit: "kg" | "lbs";
  lengthUnit: "cm" | "in";
}

interface DBUserRow {
  id: number;
  name: string;
  age: number;
  gender: string;
  height: number;
  created_at: string;
}

interface UserState {
  hasOnboarded: boolean;
  profile: UserProfile | null;
  settings: UserSettings;
  isLoading: boolean;
  loadUser: () => Promise<void>;
  setOnboarded: (profile: UserProfile) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const SETTINGS_FILE_PATH = `${documentDirectory}settings.json`;

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  weightUnit: "kg",
  lengthUnit: "cm",
};

export const useUserStore = create<UserState>((set, get) => ({
  hasOnboarded: false,
  profile: null,
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadUser: async () => {
    try {
      // 1. Fetch profile from SQLite
      const userRows = sqliteDb.getAllSync("SELECT * FROM users LIMIT 1") as DBUserRow[];
      let profile: UserProfile | null = null;
      let hasOnboarded = false;

      if (userRows.length > 0) {
        const row = userRows[0];
        profile = {
          name: row.name,
          age: row.age,
          gender: row.gender,
          height: row.height,
        };
        hasOnboarded = true;
      }

      // 2. Fetch settings from local JSON file
      let settings = DEFAULT_SETTINGS;
      const fileInfo = await getInfoAsync(SETTINGS_FILE_PATH);
      if (fileInfo.exists) {
        const fileContent = await readAsStringAsync(SETTINGS_FILE_PATH);
        try {
          const parsedSettings = JSON.parse(fileContent);
          settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        } catch (e) {
          console.error("Failed to parse settings JSON, resetting to defaults", e);
        }
      }

      set({
        profile,
        hasOnboarded,
        settings,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading user profile or settings:", error);
      set({ isLoading: false });
    }
  },

  setOnboarded: async (profile: UserProfile) => {
    try {
      const createdAt = new Date().toISOString();
      // Insert profile into SQLite
      sqliteDb.runSync(
        `INSERT INTO users (name, age, gender, height, created_at) VALUES (?, ?, ?, ?, ?)`,
        profile.name,
        profile.age,
        profile.gender,
        profile.height,
        createdAt
      );

      set({
        profile,
        hasOnboarded: true,
      });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  },

  updateProfile: async (updatedFields: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    try {
      const newProfile = { ...currentProfile, ...updatedFields };

      // Update in SQLite
      sqliteDb.runSync(
        `UPDATE users SET name = ?, age = ?, gender = ?, height = ? WHERE id = (SELECT id FROM users LIMIT 1)`,
        newProfile.name,
        newProfile.age,
        newProfile.gender,
        newProfile.height
      );

      set({ profile: newProfile });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  },

  updateSettings: async (updatedSettings: Partial<UserSettings>) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...updatedSettings };

    try {
      // Save settings to JSON file
      await writeAsStringAsync(
        SETTINGS_FILE_PATH,
        JSON.stringify(newSettings, null, 2)
      );

      set({ settings: newSettings });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },
}));
