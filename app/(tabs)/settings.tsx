import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useUserStore, UserSettings } from "@/store/userStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { useMeasurementStore } from "@/store/measurementStore";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { exportBackup, importBackup } from "@/lib/backupService";

export default function Settings() {
  const { settings, updateSettings, loadUser } = useUserStore();
  const { loadTemplates, loadWorkoutHistory, loadCustomExercises } = useWorkoutStore();
  const { loadMeasurements } = useMeasurementStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleUpdate = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    updateSettings({ [key]: val });
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      await exportBackup();
    } catch (error) {
      Alert.alert("Export Failed", "Something went wrong while creating the backup. Please try again.");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    setIsImporting(true);
    try {
      const success = await importBackup();
      if (success) {
        // Reload all stores to reflect restored data
        await loadUser();
        await loadTemplates();
        await loadWorkoutHistory();
        await loadMeasurements();
        await loadCustomExercises();
        Alert.alert("Backup Restored", "All your data has been restored successfully.");
      }
    } catch (error) {
      Alert.alert("Import Failed", "Something went wrong while restoring the backup. Your previous data may still be intact.");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const renderSectionHeader = (title: string) => (
    <SectionHeader title={title} containerClassName="mb-3 px-1" />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-foreground tracking-tight">Settings</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Personalize app behavior and preferences.
          </Text>
        </View>

        {/* Theme Settings */}
        <View className="mb-6">
          {renderSectionHeader("Appearance")}
          <Card>
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-foreground text-sm font-semibold">Dark Mode</Text>
                <Text className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                  Switch between light and dark visual aesthetics.
                </Text>
              </View>
              <Pressable
                onPress={() => handleUpdate("theme", settings.theme === "dark" ? "light" : "dark")}
                className={`w-[46px] h-[26px] rounded-full p-[2px] justify-center ${
                  settings.theme === "dark" ? "bg-accent items-end" : "bg-muted items-start"
                }`}
              >
                <View className="w-[22px] h-[22px] rounded-full bg-white" />
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Units Preferences */}
        <View className="mb-6">
          {renderSectionHeader("Units")}
          <Card className="gap-4">
            {/* Weight Unit */}
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-foreground text-sm font-semibold">Weight Unit</Text>
              <View className="flex-row bg-background border border-border/60 rounded-xl overflow-hidden p-1">
                {(["kg", "lbs"] as const).map((unit) => {
                  const isSelected = settings.weightUnit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => handleUpdate("weightUnit", unit)}
                      className={`px-3 py-1.5 rounded-lg justify-center items-center ${
                        isSelected ? "bg-accent" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-accent-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Measurement Unit */}
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-foreground text-sm font-semibold">Body Dimension</Text>
              <View className="flex-row bg-background border border-border/60 rounded-xl overflow-hidden p-1">
                {(["cm", "in"] as const).map((unit) => {
                  const isSelected = settings.lengthUnit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => handleUpdate("lengthUnit", unit)}
                      className={`px-3 py-1.5 rounded-lg justify-center items-center ${
                        isSelected ? "bg-accent" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-accent-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>
        </View>

        {/* Backup & Restore */}
        <View className="mb-6">
          {renderSectionHeader("Backup & Restore")}
          <View className="gap-3">
            {/* Export Backup */}
            <Pressable onPress={handleExportBackup} disabled={isExporting || isImporting}>
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 gap-3">
                    <View className="w-9 h-9 rounded-xl bg-accent/15 items-center justify-center">
                      <Text className="text-accent text-base">↑</Text>
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-foreground text-sm font-semibold">Export Backup</Text>
                      <Text className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                        Create a full backup of all your data as a ZIP file.
                      </Text>
                    </View>
                  </View>
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#888" />
                  ) : (
                    <Text className="text-muted-foreground text-lg">›</Text>
                  )}
                </View>
              </Card>
            </Pressable>

            {/* Import Backup */}
            <Pressable onPress={handleImportBackup} disabled={isExporting || isImporting}>
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 gap-3">
                    <View className="w-9 h-9 rounded-xl bg-accent/15 items-center justify-center">
                      <Text className="text-accent text-base">↓</Text>
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-foreground text-sm font-semibold">Import Backup</Text>
                      <Text className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                        Restore data from a previously exported backup file.
                      </Text>
                    </View>
                  </View>
                  {isImporting ? (
                    <ActivityIndicator size="small" color="#888" />
                  ) : (
                    <Text className="text-muted-foreground text-lg">›</Text>
                  )}
                </View>
              </Card>
            </Pressable>
          </View>

          <Text className="text-muted-foreground text-[9px] mt-2 px-1 leading-relaxed">
            Backups include your profile, workouts, templates, measurements, progress photos, custom exercises, and settings. No account required — you fully own your data.
          </Text>
        </View>

        {/* About App */}
        <View className="mb-12">
          {renderSectionHeader("About Heavier")}
          <Card className="gap-3.5">
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-xs font-semibold">Version</Text>
              <Text className="text-foreground text-xs font-bold">1.0.0 (Offline-First)</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-xs font-semibold">Database Engine</Text>
              <Text className="text-foreground text-xs font-bold">SQLite / Drizzle ORM</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-xs font-semibold">Developer Details</Text>
              <Text className="text-muted-foreground text-xs font-bold">Offline Local Sandbox</Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
