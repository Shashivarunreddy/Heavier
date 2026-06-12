import { View, Text, ScrollView, Dimensions } from "react-native";
import { useWorkoutStore } from "@/store/workoutStore";
import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";
import Card from "../../components/Card";
import { useMeasurementStore } from "@/store/measurementStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useMemo } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function Analytics() {
  const { workoutHistory } = useWorkoutStore();
  const { measurements } = useMeasurementStore();
  const { settings } = useUserStore();
  const { isDarkColorScheme } = useColorScheme();

  const screenWidth = Dimensions.get("window").width - 32;

  // Chart Styling config
  const chartConfig = {
    backgroundGradientFrom: isDarkColorScheme ? "#18181b" : "#ffffff",
    backgroundGradientTo: isDarkColorScheme ? "#09090b" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => isDarkColorScheme ? `rgba(52, 211, 153, ${opacity})` : `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => isDarkColorScheme ? `rgba(161, 161, 170, ${opacity})` : `rgba(113, 113, 122, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: isDarkColorScheme ? "#34d399" : "#10b981",
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-foreground tracking-tight">Analytics</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Analyze logs and strength metrics.
          </Text>
        </View>

        {/* Weight Progression Card */}
        <View className="mb-8">
          <SectionHeader title="Weight History" />
          {weightData ? (
            <Card className="items-center">
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
            </Card>
          ) : (
            <EmptyState
              iconName="scale-outline"
              title="Need at least 2 weight logs to plot progression."
              containerClassName="bg-muted border border-border/60 border-dashed rounded-3xl p-8 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
              iconSize={32}
            />
          )}
        </View>

        {/* Consistency Card */}
        <View className="mb-8">
          <SectionHeader title="Training Consistency" />
          {frequencyData ? (
            <Card className="items-center">
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
            </Card>
          ) : (
            <EmptyState
              iconName="barbell-outline"
              title="Log workouts to see consistency statistics."
              containerClassName="bg-muted border border-border/60 border-dashed rounded-3xl p-8 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
              iconSize={32}
            />
          )}
        </View>

        {/* Strength Progress Card */}
        <View className="mb-8">
          <SectionHeader title="Strength Progression (Max Weight)" />
          {Object.entries(strengthData).map(([name, logs]) => {
            if (logs.length < 2) return null;
            
            const chartData = {
              labels: logs.slice(-5).map((l) => l.date),
              datasets: [{ data: logs.slice(-5).map((l) => l.weight) }],
            };
 
            return (
              <Card key={name} className="items-center mb-4">
                <Text className="text-foreground text-xs font-black self-start mb-2 px-2 uppercase tracking-wide">
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
              </Card>
            );
          })}
          {Object.values(strengthData).every((logs) => logs.length < 2) ? (
            <EmptyState
              title="Log Bench Press, Squat, or Deadlifts repeatedly to plot strength progress."
              containerClassName="bg-muted border border-border/60 border-dashed rounded-3xl p-6 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
            />
          ) : null}
        </View>

        {/* Personal Records List */}
        <View className="mb-12">
          <SectionHeader title="All Personal Records" />
          {personalRecords.length > 0 ? (
            <Card>
              {personalRecords.map((item, idx) => (
                <View
                  key={idx}
                  className={`flex-row justify-between items-center py-2.5 ${
                    idx !== personalRecords.length - 1 ? "border-b border-border/40" : ""
                  }`}
                >
                  <Text className="text-muted-foreground text-xs font-semibold">{item.name}</Text>
                  <View className="items-end">
                    <Text className="text-foreground text-xs font-black">
                      {item.weight} {settings.weightUnit}
                    </Text>
                    <Text className="text-muted-foreground text-[9px] mt-0.5 font-medium">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          ) : (
            <EmptyState
              iconName="trophy-outline"
              title="Records appear as you complete sets."
              containerClassName="bg-muted border border-border/60 border-dashed rounded-3xl p-8 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
              iconSize={32}
            />
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
