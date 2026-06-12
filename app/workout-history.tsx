import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function WorkoutHistory() {
  const router = useRouter();
  const { workoutHistory, deleteWorkoutFromHistory } = useWorkoutStore();
  const { settings } = useUserStore();

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
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </Pressable>
        <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Workout History</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Search Input */}
      <View className="px-6 py-3 border-b border-zinc-900/60">
        <View className="flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-xl px-4 py-2.5 items-center">
          <Ionicons name="search" size={16} color="#71717a" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search workouts by name..."
            placeholderTextColor="#71717a"
            className="text-zinc-900 dark:text-white flex-grow p-0 m-0 font-medium"
          />
        </View>
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
                <View
                  key={w.id}
                  className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl overflow-hidden"
                >
                  {/* Summary Card Head */}
                  <Pressable
                    onPress={() => toggleExpand(w.id)}
                    className="p-5 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{w.workoutName}</Text>
                      
                      <View className="flex-row gap-3 mt-1.5 items-center">
                        <Text className="text-zinc-500 text-xs">
                          {new Date(w.workoutDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <View className="w-1 h-1 rounded-full bg-zinc-700" />
                        <Text className="text-zinc-500 text-xs">{formatDuration(w.durationSeconds)}</Text>
                        <View className="w-1 h-1 rounded-full bg-zinc-700" />
                        <Text className="text-zinc-500 text-xs">{totalVolume} {settings.weightUnit}</Text>
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
                    <View className="px-5 pb-5 border-t border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40 pt-4">
                      {w.notes ? (
                        <View className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 mb-4">
                          <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs leading-relaxed italic">“{w.notes}”</Text>
                        </View>
                      ) : null}

                      {/* Exercises Sets List */}
                      <View className="gap-4">
                        {w.exercises.map((ex, exIdx) => {
                          const completedSets = ex.sets.filter((s) => s.isCompleted);
                          return (
                            <View key={exIdx} className="gap-1.5">
                              <Text className="text-zinc-200 text-xs font-bold">{ex.exerciseName}</Text>
                              <View className="flex-row flex-wrap gap-2">
                                {completedSets.map((s, sIdx) => (
                                  <View
                                    key={sIdx}
                                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-2.5 py-1 rounded-lg"
                                  >
                                    <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-[10px] font-bold">
                                      Set {s.setNumber}: <Text className="text-zinc-900 dark:text-white font-black">{`${s.weight}${settings.weightUnit} x ${s.reps}`}</Text>
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
                          className="flex-row items-center bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl"
                        >
                          <Ionicons name="trash-outline" size={14} color="#ef4444" className="mr-1" />
                          <Text className="text-rose-400 text-xs font-bold uppercase tracking-wider">Delete Log</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center mt-8">
            <Ionicons name="time-outline" size={42} color="#52525b" className="mb-2" />
            <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-bold text-center">No workout logs found.</Text>
            <Text className="text-zinc-600 text-xs text-center mt-1">
              Complete your first workout to see records here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
