import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, Href } from "expo-router";
import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";
import Card from "../../components/Card";
import { useUserStore } from "@/store/userStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { useMeasurementStore } from "@/store/measurementStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function Dashboard() {
  const router = useRouter();
  const { profile, settings } = useUserStore();
  const { workoutHistory } = useWorkoutStore();
  const { measurements } = useMeasurementStore();
  const { isDarkColorScheme } = useColorScheme();

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
    if (curr === null || prev === null) return { text: "No prior data", color: "text-muted-foreground" };
    const diff = curr - prev;
    if (diff === 0) return { text: "No change", color: "text-muted-foreground" };
    
    const sign = diff > 0 ? "+" : "";
    const isGood = invertColor ? diff < 0 : diff > 0;
    const color = isGood ? "text-accent font-bold" : "text-destructive font-bold";
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

  const iconColor = isDarkColorScheme ? "#ffffff" : "#18181b";
  const accentIconColor = isDarkColorScheme ? "#34d399" : "#10b981";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header / Profile Row */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              {greeting}
            </Text>
            <Text className="text-3xl font-black text-foreground tracking-tight">
              {profile?.name || "Athlete"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile" as Href)}
            className="w-12 h-12 rounded-2xl bg-card border border-border justify-center items-center active:scale-95 transition-all"
          >
            <Ionicons name="person" size={20} color={iconColor} />
          </Pressable>
        </View>
 
        {/* Current Stats Card */}
        <Card className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground text-lg font-black tracking-tight">Current Stats</Text>
            <View className="flex-row items-center bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
              <Ionicons name="flame" size={14} color={accentIconColor} className="mr-1" />
              <Text className="text-accent text-xs font-bold uppercase tracking-wider">
                {streak} Day Streak
              </Text>
            </View>
          </View>
 
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Weight</Text>
              <Text className="text-foreground text-lg font-bold">{weightVal}</Text>
            </View>
            <View className="w-[1px] bg-border h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">L Arm</Text>
              <Text className="text-foreground text-lg font-bold">{lArmVal}</Text>
            </View>
            <View className="w-[1px] bg-border h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Waist</Text>
              <Text className="text-foreground text-lg font-bold">{waistVal}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View className="mb-8">
          <SectionHeader title="Quick Actions" />
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/workouts" as Href)}
              className="flex-1 bg-accent rounded-2xl p-4 items-center justify-center active:scale-95 transition-all shadow-md shadow-accent/15"
            >
              <Ionicons name="play" size={24} color="#09090b" className="mb-1" />
              <Text className="text-accent-foreground text-xs font-black uppercase tracking-wider">Start Workout</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/progress" as Href)}
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center justify-center active:scale-95 transition-all"
            >
              <Ionicons name="scale-outline" size={24} color={iconColor} className="mb-1" />
              <Text className="text-foreground text-xs font-bold uppercase tracking-wider">Add Logs</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/progress-photos" as Href)}
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center justify-center active:scale-95 transition-all"
            >
              <Ionicons name="camera-outline" size={24} color={iconColor} className="mb-1" />
              <Text className="text-foreground text-xs font-bold uppercase tracking-wider">Add Photos</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Workout */}
        <View className="mb-8">
          <SectionHeader title="Recent Workout" />
          {recentWorkout ? (
            <Pressable
              onPress={() => router.push("/workout-history" as Href)}
              className="bg-card border border-border rounded-3xl p-5 active:scale-[0.99] transition-all"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-foreground text-base font-black tracking-tight">{recentWorkout.workoutName}</Text>
                <Text className="text-muted-foreground text-xs font-semibold">
                  {new Date(recentWorkout.workoutDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <Text className="text-muted-foreground text-xs leading-relaxed" numberOfLines={2}>
                Exercises: {recentWorkout.exercises.map((e) => e.exerciseName).join(", ")}
              </Text>
            </Pressable>
          ) : (
            <EmptyState
              iconName="barbell-outline"
              title="No workouts logged yet."
              containerClassName="bg-muted border border-border/60 border-dashed rounded-3xl p-6 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
              iconSize={28}
            />
          )}
        </View>

        {/* Progress Summary */}
        <View className="mb-8">
          <SectionHeader title="Progress since last check-in" />
          <Card>
            <View className="flex-row justify-between items-center py-2 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-medium">Weight</Text>
              <Text className={weightDiff.color}>{weightDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-medium">Waist</Text>
              <Text className={waistDiff.color}>{waistDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-medium">Left Arm</Text>
              <Text className={lArmDiff.color}>{lArmDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-medium">Right Arm</Text>
              <Text className={rArmDiff.color}>{rArmDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/40">
              <Text className="text-muted-foreground text-sm font-medium">Left Thigh</Text>
              <Text className={lThighDiff.color}>{lThighDiff.text}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-muted-foreground text-sm font-medium">Right Thigh</Text>
              <Text className={rThighDiff.color}>{rThighDiff.text}</Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
