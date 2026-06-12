import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams, Href } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMemo } from "react";
import SectionHeader from "../components/SectionHeader";
import Card from "../components/Card";

export default function WorkoutSummary() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { workoutHistory } = useWorkoutStore();
  const { settings } = useUserStore();
  const { isDarkColorScheme } = useColorScheme();

  const workoutId = Number(id);

  const workout = useMemo(() => {
    return workoutHistory.find((w) => w.id === workoutId);
  }, [workoutHistory, workoutId]);

  // Calculations
  const stats = useMemo(() => {
    if (!workout) return { duration: "0:00", volume: 0, exercisesCount: 0, prsList: [] };

    // Calculate duration format
    const hrs = Math.floor(workout.durationSeconds / 3600);
    const mins = Math.floor((workout.durationSeconds % 3600) / 60);
    const duration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;

    // Total Volume & Completed Exercises
    let totalVolume = 0;
    let exercisesCount = 0;
    const prsList: string[] = [];

    workout.exercises.forEach((ex) => {
      let exHasCompletedSet = false;
      let exMaxWeight = 0;

      ex.sets.forEach((set) => {
        if (set.isCompleted) {
          exHasCompletedSet = true;
          totalVolume += set.weight * set.reps;
          if (set.weight > exMaxWeight) {
            exMaxWeight = set.weight;
          }
        }
      });

      if (exHasCompletedSet) {
        exercisesCount++;

        // Calculate if this is a PR
        // Find previous max weight for this exercise in history
        let historicMax = 0;
        workoutHistory.forEach((prevWorkout) => {
          if (prevWorkout.id !== workoutId) {
            prevWorkout.exercises.forEach((prevEx) => {
              if (prevEx.exerciseName.toLowerCase() === ex.exerciseName.toLowerCase()) {
                prevEx.sets.forEach((prevSet) => {
                  if (prevSet.isCompleted && prevSet.weight > historicMax) {
                    historicMax = prevSet.weight;
                  }
                });
              }
            });
          }
        });

        if (exMaxWeight > historicMax && historicMax > 0) {
          prsList.push(`${ex.exerciseName} (${exMaxWeight} ${settings.weightUnit})`);
        }
      }
    });

    return {
      duration,
      volume: totalVolume,
      exercisesCount,
      prsList,
    };
  }, [workout, workoutHistory, settings.weightUnit, workoutId]);

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground text-sm">Workout summary not found.</Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/workouts" as Href)}
          className="bg-card border border-border px-6 py-2.5 rounded-xl mt-4"
        >
          <Text className="text-foreground text-xs font-bold uppercase tracking-wider">Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Success Icon Header */}
        <View className="items-center mt-6 mb-8">
          <View className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 justify-center items-center mb-4">
            <Ionicons name="checkmark-circle" size={36} color={isDarkColorScheme ? "#34d399" : "#10b981"} />
          </View>
          <Text className="text-3xl font-black text-foreground tracking-tight">Workout Complete</Text>
          <Text className="text-muted-foreground text-xs mt-1 uppercase tracking-wider font-semibold">
            Logged to your device storage
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-grow flex-1 dark:bg-muted/60 items-center">
            <Ionicons name="time-outline" size={20} color={isDarkColorScheme ? "#a1a1aa" : "#71717a"} className="mb-2" />
            <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-0.5">Time</Text>
            <Text className="text-foreground text-base font-black">{stats.duration}</Text>
          </Card>

          <Card className="flex-grow flex-1 dark:bg-muted/60 items-center">
            <Ionicons name="barbell-outline" size={20} color={isDarkColorScheme ? "#a1a1aa" : "#71717a"} className="mb-2" />
            <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-0.5">Volume</Text>
            <Text className="text-foreground text-base font-black">
              {stats.volume} {settings.weightUnit}
            </Text>
          </Card>

          <Card className="flex-grow flex-1 dark:bg-muted/60 items-center">
            <Ionicons name="stats-chart-outline" size={20} color={isDarkColorScheme ? "#a1a1aa" : "#71717a"} className="mb-2" />
            <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-0.5">Exercises</Text>
            <Text className="text-foreground text-base font-black">{stats.exercisesCount}</Text>
          </Card>
        </View>

        {/* PRs Section */}
        {stats.prsList.length > 0 ? (
          <View className="bg-accent/10 border border-accent/20 rounded-3xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="trophy" size={18} color={isDarkColorScheme ? "#34d399" : "#10b981"} className="mr-2" />
              <Text className="text-accent text-sm font-black uppercase tracking-wider">New Personal Records!</Text>
            </View>
            <View className="gap-1.5">
              {stats.prsList.map((pr, idx) => (
                <Text key={idx} className="text-foreground text-xs font-semibold">
                  🏆 {pr}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Workout Details list */}
        <View className="mb-8">
          <SectionHeader title="Workout Summary" />
          <Card className="bg-muted gap-4">
            <View className="flex-row justify-between items-center pb-3 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-bold">{workout.workoutName}</Text>
              <Text className="text-muted-foreground text-xs">
                {new Date(workout.workoutDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            {workout.notes ? (
              <View className="bg-background p-4 rounded-2xl border border-border/60">
                <Text className="text-muted-foreground text-xs leading-relaxed italic">“{workout.notes}”</Text>
              </View>
            ) : null}

            <View className="gap-3">
              {workout.exercises.map((ex, idx) => {
                const completedSets = ex.sets.filter((s) => s.isCompleted);
                if (completedSets.length === 0) return null;
                return (
                  <View key={idx} className="gap-1.5">
                    <Text className="text-foreground text-xs font-black">{ex.exerciseName}</Text>
                    <Text className="text-muted-foreground text-xs">
                      {completedSets.map((s) => `${s.weight}${settings.weightUnit} x ${s.reps}`).join(", ")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={() => router.replace("/(tabs)/dashboard" as Href)}
          className="bg-accent hover:bg-accent/90 active:scale-95 py-4 rounded-2xl items-center shadow-lg shadow-accent/15 mb-12 transition-all"
        >
          <Text className="text-accent-foreground font-black text-sm uppercase tracking-wider">Close Summary</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
