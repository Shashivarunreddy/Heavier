import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, Href } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function Workouts() {
  const router = useRouter();
  const { templates, deleteTemplate, startWorkout } = useWorkoutStore();
  const { isDarkColorScheme } = useColorScheme();

  const iconColor = isDarkColorScheme ? "#ffffff" : "#18181b";
  const accentIconColor = isDarkColorScheme ? "#34d399" : "#10b981";
  const mutedIconColor = isDarkColorScheme ? "#a1a1aa" : "#71717a";

  const handleStartWorkout = (templateId: number | null) => {
    startWorkout(templateId);
    router.push("/workout-active" as Href);
  };

  const handleDeleteTemplate = (id: number, name: string) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete the template "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTemplate(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-foreground tracking-tight">Workouts</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Choose a template, create a new one, or start empty.
          </Text>
        </View>

        {/* Quick Nav Bar */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => router.push("/workout-history" as Href)}
            className="flex-1 flex-row bg-card border border-border px-4 py-3 rounded-2xl items-center justify-center active:scale-95 transition-all"
          >
            <Ionicons name="time-outline" size={18} color={iconColor} className="mr-2" />
            <Text className="text-foreground text-xs font-bold uppercase tracking-wider">History</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/exercise-library" as Href)}
            className="flex-1 flex-row bg-card border border-border px-4 py-3 rounded-2xl items-center justify-center active:scale-95 transition-all"
          >
            <Ionicons name="search-outline" size={18} color={iconColor} className="mr-2" />
            <Text className="text-foreground text-xs font-bold uppercase tracking-wider">Library</Text>
          </Pressable>
        </View>

        {/* Start Empty Workout Card */}
        <Pressable
          onPress={() => handleStartWorkout(null)}
          className="bg-muted border border-border rounded-3xl p-5 mb-8 flex-row justify-between items-center active:scale-[0.99] transition-all"
        >
          <View>
            <Text className="text-foreground text-base font-black tracking-tight">Start Empty Workout</Text>
            <Text className="text-muted-foreground text-xs mt-1">Create a custom routine on the fly</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-accent justify-center items-center">
            <Ionicons name="add" size={24} color="#09090b" />
          </View>
        </Pressable>

        {/* Templates Section Header */}
        <SectionHeader
          title="Workout Templates"
          containerClassName="mb-4"
          rightElement={
            <Pressable
              onPress={() => router.push("/workout-create-template" as Href)}
              className="flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={16} color={accentIconColor} className="mr-1" />
              <Text className="text-accent text-xs font-bold uppercase tracking-wider">Create</Text>
            </Pressable>
          }
        />

        {/* Templates List */}
        {templates.length > 0 ? (
          <View className="gap-4 mb-8">
            {templates.map((t) => (
              <Card
                key={t.id}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1 pr-4">
                    <Text className="text-foreground text-base font-black tracking-tight">{t.name}</Text>
                    {t.notes ? (
                      <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
                        {t.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleDeleteTemplate(t.id, t.name)}
                    className="w-8 h-8 rounded-lg bg-card justify-center items-center active:bg-destructive/10"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                </View>

                {/* Exercises Preview */}
                <View className="border-t border-b border-border/40 py-3 mb-4 gap-1.5">
                  {t.exercises.map((e, idx) => (
                    <Text key={idx} className="text-muted-foreground text-xs">
                      • <Text className="font-bold text-foreground">{e.exerciseName}</Text> — {e.sets} x {e.reps} reps
                    </Text>
                  ))}
                </View>

                {/* Start Button */}
                <Pressable
                  onPress={() => handleStartWorkout(t.id)}
                  className="bg-accent hover:bg-accent/90 active:scale-95 py-3 rounded-xl items-center shadow-md shadow-accent/10 transition-all"
                >
                  <Text className="text-accent-foreground text-xs font-black uppercase tracking-wider">Start Routine</Text>
                </Pressable>
              </Card>
            ))}
          </View>
        ) : (
          <View className="bg-card border border-border border-dashed rounded-3xl p-5 justify-center items-center mb-8">
            <Ionicons name="barbell-outline" size={36} color={mutedIconColor} className="mb-2" />
            <Text className="text-muted-foreground text-sm font-bold text-center">No templates saved yet.</Text>
            <Text className="text-muted-foreground text-xs text-center mt-1">
              Build your favorite routines for faster logging.
            </Text>
            <Pressable
              onPress={() => router.push("/workout-create-template" as Href)}
              className="bg-card border border-border px-6 py-2.5 rounded-xl mt-4 active:scale-95 transition-all"
            >
              <Text className="text-foreground text-xs font-bold uppercase tracking-wider">Create First Template</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
