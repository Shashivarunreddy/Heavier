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
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

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

// Prevent the splash screen from auto-hiding before font loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const { loadUser, settings, isLoading: isUserLoading } = useUserStore();
  const { loadTemplates, loadWorkoutHistory, loadCustomExercises } = useWorkoutStore();
  const { loadMeasurements } = useMeasurementStore();

  const [fontsLoaded, fontError] = useFonts({
    "Sora-Regular": require("../assets/fonts/Sora/static/Sora-Regular.ttf"),
    "Sora-Medium": require("../assets/fonts/Sora/static/Sora-Medium.ttf"),
    "Sora-SemiBold": require("../assets/fonts/Sora/static/Sora-SemiBold.ttf"),
    "Sora-Bold": require("../assets/fonts/Sora/static/Sora-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter/static/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter/static/Inter_18pt-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter/static/Inter_18pt-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/static/Inter_18pt-Bold.ttf"),
  });

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
    if (!isUserLoading) {
      setColorScheme(settings.theme);
    }
  }, [settings.theme, isUserLoading, setColorScheme]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (isUserLoading || (!fontsLoaded && !fontError)) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={isDarkColorScheme ? "#34d399" : "#10b981"} />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <View className={isDarkColorScheme ? "dark flex-1" : "flex-1"}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}

