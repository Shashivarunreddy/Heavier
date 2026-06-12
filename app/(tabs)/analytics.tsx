import { View, Text, ScrollView, Dimensions } from "react-native";
import { useWorkoutStore } from "@/store/workoutStore";
import { useMeasurementStore } from "@/store/measurementStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useMemo } from "react";

export default function Analytics() {
  const { workoutHistory } = useWorkoutStore();
  const { measurements } = useMeasurementStore();
  const { settings } = useUserStore();

  const screenWidth = Dimensions.get("window").width - 32;

  // Chart Styling config
  const chartConfig = {
    backgroundGradientFrom: "#18181b",
    backgroundGradientTo: "#09090b",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#10b981",
    },
  };

  // 1. Weight Progression Chart Data
  const weightData = useMemo(() => {
    // Sort chronologically (ascending)
    const sorted = [...measurements]
      .filter((m) => m.bodyWeight !== null)
      .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime());

    // Take last 6 logs
    const slice = sorted.slice(-6);

    if (slice.length < 2) return null;

    return {
      labels: slice.map((m) => {
        const d = new Date(m.measurementDate);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          data: slice.map((m) => m.bodyWeight as number),
        },
      ],
    };
  }, [measurements]);

  // 2. Training Frequency Chart Data
  const frequencyData = useMemo(() => {
    const monthlyCounts: { [month: string]: number } = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: "short" });
      monthlyCounts[label] = 0;
    }

    workoutHistory.forEach((w) => {
      const d = new Date(w.workoutDate);
      const label = d.toLocaleString(undefined, { month: "short" });
      if (monthlyCounts[label] !== undefined) {
        monthlyCounts[label]++;
      }
    });

    const labels = Object.keys(monthlyCounts);
    const data = Object.values(monthlyCounts);

    const hasWorkouts = data.some((count) => count > 0);
    if (!hasWorkouts) return null;

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  }, [workoutHistory]);

  // 3. Personal Records Calculations
  const personalRecords = useMemo(() => {
    const prs: { [exercise: string]: { weight: number; date: string } } = {};

    workoutHistory.forEach((w) => {
      w.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.isCompleted) {
            const currentPr = prs[ex.exerciseName];
            if (!currentPr || set.weight > currentPr.weight) {
              prs[ex.exerciseName] = {
                weight: set.weight,
                date: w.workoutDate,
              };
            }
          }
        });
      });
    });

    return Object.entries(prs).map(([name, val]) => ({
      name,
      weight: val.weight,
      date: val.date,
    }));
  }, [workoutHistory]);

  // 4. Strength Progression (Bench Press / Squat / Deadlift)
  const strengthData = useMemo(() => {
    // Look for Squat, Deadlift, or Bench Press logs
    const targets = ["Bench Press", "Squat", "Deadlift"];
    const progress: { [key: string]: { date: string; weight: number }[] } = {
      "Bench Press": [],
      Squat: [],
      Deadlift: [],
    };

    // Filter and sort history ascending
    const sorted = [...workoutHistory].sort(
      (a, b) => new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    sorted.forEach((w) => {
      w.exercises.forEach((ex) => {
        const match = targets.find((t) => t.toLowerCase() === ex.exerciseName.toLowerCase());
        if (match) {
          let maxWeight = 0;
          ex.sets.forEach((set) => {
            if (set.isCompleted && set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          });
          if (maxWeight > 0) {
            progress[match].push({
              date: new Date(w.workoutDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              weight: maxWeight,
            });
          }
        }
      });
    });

    return progress;
  }, [workoutHistory]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Analytics</Text>
          <Text className="text-zinc-500 text-sm mt-1">
            Analyze logs and strength metrics.
          </Text>
        </View>

        {/* Weight Progression Card */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Weight History</Text>
          {weightData ? (
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-4 items-center">
              <LineChart
                data={weightData}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 4,
                  borderRadius: 16,
                }}
              />
            </View>
          ) : (
            <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-8 justify-center items-center">
              <Ionicons name="scale-outline" size={32} color="#52525b" className="mb-2" />
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                Need at least 2 weight logs to plot progression.
              </Text>
            </View>
          )}
        </View>

        {/* Consistency Card */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Training Consistency</Text>
          {frequencyData ? (
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-4 items-center">
              <BarChart
                data={frequencyData}
                width={screenWidth}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={{
                  marginVertical: 4,
                  borderRadius: 16,
                }}
              />
            </View>
          ) : (
            <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-8 justify-center items-center">
              <Ionicons name="barbell-outline" size={32} color="#52525b" className="mb-2" />
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                Log workouts to see consistency statistics.
              </Text>
            </View>
          )}
        </View>

        {/* Strength Progress Card */}
        <View className="mb-8">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Strength Progression (Max Weight)</Text>
          {Object.entries(strengthData).map(([name, logs]) => {
            if (logs.length < 2) return null;
            
            const chartData = {
              labels: logs.slice(-5).map((l) => l.date),
              datasets: [{ data: logs.slice(-5).map((l) => l.weight) }],
            };

            return (
              <View key={name} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-4 items-center mb-4">
                <Text className="text-zinc-900 dark:text-white text-xs font-black self-start mb-2 px-2 uppercase tracking-wide">
                  {name} ({settings.weightUnit})
                </Text>
                <LineChart
                  data={chartData}
                  width={screenWidth}
                  height={150}
                  chartConfig={chartConfig}
                  style={{
                    borderRadius: 16,
                  }}
                />
              </View>
            );
          })}
          {Object.values(strengthData).every((logs) => logs.length < 2) ? (
            <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-6 justify-center items-center">
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                Log Bench Press, Squat, or Deadlifts repeatedly to plot strength progress.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Personal Records List */}
        <View className="mb-12">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">All Personal Records</Text>
          {personalRecords.length > 0 ? (
            <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5">
              {personalRecords.map((item, idx) => (
                <View
                  key={idx}
                  className={`flex-row justify-between items-center py-2.5 ${
                    idx !== personalRecords.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40" : ""
                  }`}
                >
                  <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold">{item.name}</Text>
                  <View className="items-end">
                    <Text className="text-zinc-900 dark:text-white text-xs font-black">
                      {item.weight} {settings.weightUnit}
                    </Text>
                    <Text className="text-zinc-600 text-[9px] mt-0.5 font-medium">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-8 justify-center items-center">
              <Ionicons name="trophy-outline" size={32} color="#52525b" className="mb-2" />
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                Records appear as you complete sets.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
