import { View, Text, Pressable, ScrollView } from "react-native";
import { useUserStore, UserSettings } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { settings, updateSettings } = useUserStore();

  const handleUpdate = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    updateSettings({ [key]: val });
  };

  const renderSectionHeader = (title: string) => (
    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3 px-1">{title}</Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Settings</Text>
          <Text className="text-zinc-500 text-sm mt-1">
            Personalize app behavior and preferences.
          </Text>
        </View>

        {/* Theme Settings */}
        <View className="mb-6">
          {renderSectionHeader("Appearance")}
          <View className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold">Dark Mode</Text>
                <Text className="text-zinc-550 dark:text-zinc-500 text-[10px] mt-0.5 leading-relaxed">
                  Switch between light and dark visual aesthetics.
                </Text>
              </View>
              <Pressable
                onPress={() => handleUpdate("theme", settings.theme === "dark" ? "light" : "dark")}
                className={`w-[46px] h-[26px] rounded-full p-[2px] justify-center ${
                  settings.theme === "dark" ? "bg-emerald-500 items-end" : "bg-zinc-200 dark:bg-zinc-800 items-start"
                }`}
              >
                <View className="w-[22px] h-[22px] rounded-full bg-white" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Units Preferences */}
        <View className="mb-6">
          {renderSectionHeader("Units")}
          <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-4 gap-4">
            {/* Weight Unit */}
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold">Weight Unit</Text>
              <View className="flex-row bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-xl overflow-hidden p-1">
                {(["kg", "lbs"] as const).map((unit) => {
                  const isSelected = settings.weightUnit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => handleUpdate("weightUnit", unit)}
                      className={`px-3 py-1.5 rounded-lg justify-center items-center ${
                        isSelected ? "bg-emerald-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-zinc-950" : "text-zinc-500"
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
              <Text className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold">Body Dimension</Text>
              <View className="flex-row bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-xl overflow-hidden p-1">
                {(["cm", "in"] as const).map((unit) => {
                  const isSelected = settings.lengthUnit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => handleUpdate("lengthUnit", unit)}
                      className={`px-3 py-1.5 rounded-lg justify-center items-center ${
                        isSelected ? "bg-emerald-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-zinc-950" : "text-zinc-500"
                        }`}
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>


        {/* About App */}
        <View className="mb-12">
          {renderSectionHeader("About Heavier")}
          <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5 gap-3.5">
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold">Version</Text>
              <Text className="text-zinc-900 dark:text-white text-xs font-bold">1.0.0 (Offline-First)</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold">Database Engine</Text>
              <Text className="text-zinc-900 dark:text-white text-xs font-bold">SQLite / Drizzle ORM</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold">Developer Details</Text>
              <Text className="text-zinc-500 text-xs font-bold">Offline Local Sandbox</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
