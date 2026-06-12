import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useColorScheme } from "../hooks/useColorScheme";
import { NAV_THEME } from "../lib/theme";
import { initializeDatabase } from "../db/sqlite";
import { useUserStore } from "../store/userStore";
import { useWorkoutStore } from "../store/workoutStore";
import { useMeasurementStore } from "../store/measurementStore";
import { View, ActivityIndicator } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

// Suppress Reanimated warnings about reading values during component render
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const LIGHT_THEME = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

const DARK_THEME = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const { loadUser, settings, isLoading } = useUserStore();
  const { loadTemplates, loadWorkoutHistory, loadCustomExercises } = useWorkoutStore();
  const { loadMeasurements } = useMeasurementStore();

  useEffect(() => {
    // 1. Initialize SQLite Database
    initializeDatabase();

    // 2. Load cached stores
    loadUser();
    loadTemplates();
    loadWorkoutHistory();
    loadCustomExercises();
    loadMeasurements();
  }, [loadUser, loadTemplates, loadWorkoutHistory, loadCustomExercises, loadMeasurements]);

  useEffect(() => {
    if (!isLoading) {
      setColorScheme(settings.theme);
    }
  }, [settings.theme, isLoading, setColorScheme]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ThemeProvider>
  );
}

