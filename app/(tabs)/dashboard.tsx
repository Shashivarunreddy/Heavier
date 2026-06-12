import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, Href } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { useMeasurementStore } from "@/store/measurementStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { profile, settings } = useUserStore();
  const { workoutHistory } = useWorkoutStore();
  const { measurements } = useMeasurementStore();

  const [greeting, setGreeting] = useState("Hello");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good Morning");
    else if (hrs < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Calculate Streak
  useEffect(() => {
    if (workoutHistory.length === 0) {
      setStreak(0);
      return;
    }

    // Sort by date descending
    const sortedWorkouts = [...workoutHistory].sort(
      (a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()
    );

    let currentStreak = 0;
    let lastDate = new Date();
    lastDate.setHours(23, 59, 59, 999);

    for (let i = 0; i < sortedWorkouts.length; i++) {
      const wDate = new Date(sortedWorkouts[i].workoutDate);
      const diffTime = Math.abs(lastDate.getTime() - wDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If workout was today or yesterday (or within 2 days to allow rest days)
      if (i === 0 && diffDays > 3) {
        break; // Streak is broken
      }

      if (diffDays <= 3) {
        currentStreak++;
        lastDate = wDate;
      } else {
        break; // Streak broken
      }
    }
    setStreak(currentStreak);
  }, [workoutHistory]);

  // Get current measurements
  const latestLog = measurements[0] || null;
  const previousLog = measurements[1] || null;

  const weightVal = latestLog?.bodyWeight ? `${latestLog.bodyWeight} ${settings.weightUnit}` : "--";
  const lArmVal = latestLog?.leftArmSize ? `${latestLog.leftArmSize} ${settings.lengthUnit}` : "--";
  const waistVal = latestLog?.waistSize ? `${latestLog.waistSize} ${settings.lengthUnit}` : "--";

  // Calculate progress differences
  const getDiffText = (curr: number | null, prev: number | null, unit: string, invertColor = false) => {
    if (curr === null || prev === null) return { text: "No prior data", color: "text-zinc-500" };
    const diff = curr - prev;
    if (diff === 0) return { text: "No change", color: "text-zinc-600 dark:text-zinc-400 dark:text-zinc-400" };
    
    const sign = diff > 0 ? "+" : "";
    const isGood = invertColor ? diff < 0 : diff > 0;
    const color = isGood ? "text-emerald-500 font-bold" : "text-rose-500 font-bold";
    return {
      text: `${sign}${diff.toFixed(1)} ${unit}`,
      color,
    };
  };

  const weightDiff = getDiffText(latestLog?.bodyWeight, previousLog?.bodyWeight, settings.weightUnit, true);
  const lArmDiff = getDiffText(latestLog?.leftArmSize, previousLog?.leftArmSize, settings.lengthUnit);
  const rArmDiff = getDiffText(latestLog?.rightArmSize, previousLog?.rightArmSize, settings.lengthUnit);
  const waistDiff = getDiffText(latestLog?.waistSize, previousLog?.waistSize, settings.lengthUnit, true);
  const lThighDiff = getDiffText(latestLog?.leftThighSize, previousLog?.leftThighSize, settings.lengthUnit);
  const rThighDiff = getDiffText(latestLog?.rightThighSize, previousLog?.rightThighSize, settings.lengthUnit);

  const recentWorkout = workoutHistory[0] || null;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header / Profile Row */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-zinc-500 text-sm font-semibold tracking-wide uppercase">
              {greeting}
            </Text>
            <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {profile?.name || "Athlete"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile" as Href)}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95 transition-all"
          >
            <Ionicons name="person" size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Current Stats Card */}
        <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Current Stats</Text>
            <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Ionicons name="flame" size={14} color="#10b981" className="mr-1" />
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {streak} Day Streak
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Weight</Text>
              <Text className="text-zinc-900 dark:text-white text-lg font-bold">{weightVal}</Text>
            </View>
            <View className="w-[1px] bg-zinc-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">L Arm</Text>
              <Text className="text-zinc-900 dark:text-white text-lg font-bold">{lArmVal}</Text>
            </View>
            <View className="w-[1px] bg-zinc-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Waist</Text>
              <Text className="text-zinc-900 dark:text-white text-lg font-bold">{waistVal}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/workouts" as Href)}
              className="flex-1 bg-emerald-500 rounded-2xl p-4 items-center justify-center active:scale-95 transition-all shadow-md shadow-emerald-500/15"
            >
              <Ionicons name="play" size={24} color="#09090b" className="mb-1" />
              <Text className="text-zinc-950 text-xs font-black uppercase tracking-wider">Start Workout</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/progress" as Href)}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-4 items-center justify-center active:scale-95 transition-all"
            >
              <Ionicons name="scale-outline" size={24} color="#ffffff" className="mb-1" />
              <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider">Add Logs</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/progress-photos" as Href)}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-4 items-center justify-center active:scale-95 transition-all"
            >
              <Ionicons name="camera-outline" size={24} color="#ffffff" className="mb-1" />
              <Text className="text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider">Add Photos</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Workout */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Recent Workout</Text>
          {recentWorkout ? (
            <Pressable
              onPress={() => router.push("/workout-history" as Href)}
              className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5 active:scale-[0.99] transition-all"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{recentWorkout.workoutName}</Text>
                <Text className="text-zinc-500 text-xs font-semibold">
                  {new Date(recentWorkout.workoutDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs leading-relaxed" numberOfLines={2}>
                Exercises: {recentWorkout.exercises.map((e) => e.exerciseName).join(", ")}
              </Text>
            </Pressable>
          ) : (
            <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-6 justify-center items-center">
              <Ionicons name="barbell-outline" size={28} color="#52525b" className="mb-2" />
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                No workouts logged yet.
              </Text>
            </View>
          )}
        </View>

        {/* Progress Summary */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Progress since last check-in</Text>
          <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5">
            <View className="flex-row justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Weight</Text>
              <Text className={weightDiff.color}>{weightDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Waist</Text>
              <Text className={waistDiff.color}>{waistDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Left Arm</Text>
              <Text className={lArmDiff.color}>{lArmDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Right Arm</Text>
              <Text className={rArmDiff.color}>{rArmDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Left Thigh</Text>
              <Text className={lThighDiff.color}>{lThighDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-medium">Right Thigh</Text>
              <Text className={rThighDiff.color}>{rThighDiff.text}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
