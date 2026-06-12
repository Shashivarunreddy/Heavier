import { View, Text, Pressable, ScrollView } from "react-native";
import { useUserStore, UserSettings } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function Settings() {
  const { settings, updateSettings } = useUserStore();

  const handleUpdate = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    updateSettings({ [key]: val });
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
