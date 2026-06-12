import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUserStore } from "@/store/userStore";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import Card from "../components/Card";

export default function WorkoutHistory() {
  const router = useRouter();
  const { workoutHistory, deleteWorkoutFromHistory } = useWorkoutStore();
  const { settings } = useUserStore();
  const { isDarkColorScheme } = useColorScheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null);

  const handleDeleteHistory = (id: number, name: string) => {
    Alert.alert(
      "Delete Logged Workout",
      `Are you sure you want to delete the workout log "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkoutFromHistory(id),
        },
      ]
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedWorkoutId(expandedWorkoutId === id ? null : id);
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const filteredHistory = workoutHistory.filter((w) =>
    w.workoutName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-border bg-background">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
        </Pressable>
        <Text className="text-foreground text-lg font-black tracking-tight">Workout History</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Search Input */}
      <View className="px-6 py-3 border-b border-border/60">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search workouts by name..."
        />
      </View>

      {/* Logs List */}
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        {filteredHistory.length > 0 ? (
          <View className="gap-4 pb-12">
            {filteredHistory.map((w) => {
              const isExpanded = expandedWorkoutId === w.id;
              
              // Calculate volume
              let totalVolume = 0;
              w.exercises.forEach((ex) => {
                ex.sets.forEach((set) => {
                  if (set.isCompleted) {
                    totalVolume += set.weight * set.reps;
                  }
                });
              });

              return (
                <Card
                  key={w.id}
                  className="overflow-hidden p-0"
                >
                  {/* Summary Card Head */}
                  <Pressable
                    onPress={() => toggleExpand(w.id)}
                    className="p-5 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-foreground text-base font-black tracking-tight">{w.workoutName}</Text>
                      
                      <View className="flex-row gap-3 mt-1.5 items-center">
                        <Text className="text-muted-foreground text-xs">
                          {new Date(w.workoutDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <Text className="text-muted-foreground text-xs">{formatDuration(w.durationSeconds)}</Text>
                        <View className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <Text className="text-muted-foreground text-xs">{totalVolume} {settings.weightUnit}</Text>
                      </View>
                    </View>
                    
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#a1a1aa"
                    />
                  </Pressable>

                  {/* Collapsible Details */}
                  {isExpanded ? (
                    <View className="px-5 pb-5 border-t border-border/40 pt-4">
                      {w.notes ? (
                        <View className="bg-background p-3.5 rounded-2xl border border-border/60 mb-4">
                          <Text className="text-muted-foreground text-xs leading-relaxed italic">“{w.notes}”</Text>
                        </View>
                      ) : null}

                      {/* Exercises Sets List */}
                      <View className="gap-4">
                        {w.exercises.map((ex, exIdx) => {
                          const completedSets = ex.sets.filter((s) => s.isCompleted);
                          return (
                            <View key={exIdx} className="gap-1.5">
                              <Text className="text-foreground text-xs font-bold">{ex.exerciseName}</Text>
                              <View className="flex-row flex-wrap gap-2">
                                {completedSets.map((s, sIdx) => (
                                  <View
                                    key={sIdx}
                                    className="bg-background border border-border/60 px-2.5 py-1 rounded-lg"
                                  >
                                    <Text className="text-muted-foreground text-[10px] font-bold">
                                      Set {s.setNumber}: <Text className="text-foreground font-black">{`${s.weight}${settings.weightUnit} x ${s.reps}`}</Text>
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Delete log row */}
                      <View className="flex-row justify-end mt-6">
                        <Pressable
                          onPress={() => handleDeleteHistory(w.id, w.workoutName)}
                          className="flex-row items-center bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-xl"
                        >
                          <Ionicons name="trash-outline" size={14} color="#ef4444" className="mr-1" />
                          <Text className="text-destructive text-xs font-bold uppercase tracking-wider">Delete Log</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState
            iconName="time-outline"
            title="No workout logs found."
            description="Complete your first workout to see records here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
