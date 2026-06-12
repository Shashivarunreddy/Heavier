import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, Href } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Workouts() {
  const router = useRouter();
  const { templates, deleteTemplate, startWorkout } = useWorkoutStore();

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
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Workouts</Text>
          <Text className="text-zinc-500 text-sm mt-1">
            Choose a template, create a new one, or start empty.
          </Text>
        </View>

        {/* Quick Nav Bar */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => router.push("/workout-history" as Href)}
            className="flex-1 flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 px-4 py-3 rounded-2xl items-center justify-center active:scale-95 transition-all"
          >
            <Ionicons name="time-outline" size={18} color="#ffffff" className="mr-2" />
            <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider">History</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/exercise-library" as Href)}
            className="flex-1 flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 px-4 py-3 rounded-2xl items-center justify-center active:scale-95 transition-all"
          >
            <Ionicons name="search-outline" size={18} color="#ffffff" className="mr-2" />
            <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider">Library</Text>
          </Pressable>
        </View>

        {/* Start Empty Workout Card */}
        <Pressable
          onPress={() => handleStartWorkout(null)}
          className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5 mb-8 flex-row justify-between items-center active:scale-[0.99] transition-all"
        >
          <View>
            <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">Start Empty Workout</Text>
            <Text className="text-zinc-500 text-xs mt-1">Create a custom routine on the fly</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-emerald-500 justify-center items-center">
            <Ionicons name="add" size={24} color="#09090b" />
          </View>
        </Pressable>

        {/* Templates Section Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Workout Templates</Text>
          <Pressable
            onPress={() => router.push("/workout-create-template" as Href)}
            className="flex-row items-center"
          >
            <Ionicons name="add-circle-outline" size={16} color="#10b981" className="mr-1" />
            <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Create</Text>
          </Pressable>
        </View>

        {/* Templates List */}
        {templates.length > 0 ? (
          <View className="gap-4 mb-8">
            {templates.map((t) => (
              <View
                key={t.id}
                className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1 pr-4">
                    <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{t.name}</Text>
                    {t.notes ? (
                      <Text className="text-zinc-500 text-xs mt-0.5" numberOfLines={1}>
                        {t.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleDeleteTemplate(t.id, t.name)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 justify-center items-center active:bg-rose-950/20"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                </View>

                {/* Exercises Preview */}
                <View className="border-t border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40 py-3 mb-4 gap-1.5">
                  {t.exercises.map((e, idx) => (
                    <Text key={idx} className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs">
                      • <Text className="font-bold text-zinc-800 dark:text-zinc-300">{e.exerciseName}</Text> — {e.sets} x {e.reps} reps
                    </Text>
                  ))}
                </View>

                {/* Start Button */}
                <Pressable
                  onPress={() => handleStartWorkout(t.id)}
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 py-3 rounded-xl items-center shadow-md shadow-emerald-500/10 transition-all"
                >
                  <Text className="text-zinc-950 text-xs font-black uppercase tracking-wider">Start Routine</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-8 justify-center items-center mb-8">
            <Ionicons name="barbell-outline" size={36} color="#52525b" className="mb-2" />
            <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-bold text-center">No templates saved yet.</Text>
            <Text className="text-zinc-600 text-xs text-center mt-1">
              Build your favorite routines for faster logging.
            </Text>
            <Pressable
              onPress={() => router.push("/workout-create-template" as Href)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 px-6 py-2.5 rounded-xl mt-4 active:scale-95 transition-all"
            >
              <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider">Create First Template</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
