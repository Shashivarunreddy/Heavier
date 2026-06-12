import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal, Alert } from "react-native";
import { useRouter, Href } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUserStore } from "@/store/userStore";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EXERCISE_LIBRARY } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import CreateExerciseModal from "../components/CreateExerciseModal";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import Card from "../components/Card";
import Input from "../components/Input";

export default function WorkoutActive() {
  const router = useRouter();
  const {
    activeWorkout,
    updateActiveSet,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    addSetToActiveExercise,
    removeSetFromActiveExercise,
    finishActiveWorkout,
    cancelActiveWorkout,
    customExercises,
  } = useWorkoutStore();

  const { settings } = useUserStore();
  const { isDarkColorScheme } = useColorScheme();

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkout) {
      router.replace("/(tabs)/workouts" as Href);
    }
  }, [activeWorkout, router]);

  const triggerHapticSuccess = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const triggerHapticNotification = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const handleToggleSet = (exIdx: number, setIdx: number, currentlyCompleted: boolean) => {
    const isNowCompleted = !currentlyCompleted;
    updateActiveSet(exIdx, setIdx, { isCompleted: isNowCompleted });
    triggerHapticSuccess();
  };

  const handleAddExercise = (name: string) => {
    addExerciseToActiveWorkout(name);
    setIsAddExerciseModalOpen(false);
    triggerHapticSuccess();
  };

  const handleFinishWorkout = async () => {
    try {
      const summary = await finishActiveWorkout();
      triggerHapticNotification();
      
      if (summary) {
        // Route to summary
        router.replace({
          pathname: "/workout-summary",
          params: { id: summary.id },
        } as unknown as Href);
      } else {
        router.replace("/(tabs)/workouts" as Href);
      }
    } catch {
      Alert.alert("Error", "Failed to save workout session.");
    }
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to discard this workout? All progress logged during this session will be lost.",
      [
        { text: "Continue Workout", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            cancelActiveWorkout();
            router.replace("/(tabs)/workouts" as Href);
          },
        },
      ]
    );
  };

  if (!activeWorkout) return null;

  const combinedLibrary = [...EXERCISE_LIBRARY, ...customExercises];
  const sortedLibrary = [...combinedLibrary].sort((a, b) => a.name.localeCompare(b.name));

  const filteredLibrary = sortedLibrary.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Navigation */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-border bg-background z-10">
        <View>
          <Text className="text-foreground text-base font-black tracking-tight">{activeWorkout.name}</Text>
        </View>
        
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={handleCancelWorkout}
            className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center"
          >
            <Ionicons name="close-outline" size={20} color="#ef4444" />
          </Pressable>

          <Pressable
            onPress={handleFinishWorkout}
            className="bg-accent px-4 py-2 rounded-xl justify-center items-center active:scale-95"
          >
            <Text className="text-accent-foreground font-bold text-xs uppercase tracking-wider">Finish</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Form Scroller */}
      <ScrollView className="flex-grow px-6 py-4" keyboardShouldPersistTaps="handled">
        {activeWorkout.exercises.length > 0 ? (
          <View className="gap-6 pb-24">
            {activeWorkout.exercises.map((ex, exIdx) => (
              <Card
                key={exIdx}
                className="bg-muted border-border/60"
              >
                {/* Exercise Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1 pr-4">
                    <Text className="text-foreground text-base font-black tracking-tight">{ex.exerciseName}</Text>
                  </View>
                  <Pressable
                    onPress={() => removeExerciseFromActiveWorkout(exIdx)}
                    className="w-8 h-8 rounded-lg bg-card justify-center items-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </Pressable>
                </View>

                {/* Table Header */}
                <View className="flex-row mb-2 px-1">
                  <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider w-[12%] text-center">Set</Text>
                  <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider w-[36%] text-center">Weight ({settings.weightUnit})</Text>
                  <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider w-[32%] text-center">Reps</Text>
                  <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider w-[20%] text-center">Done</Text>
                </View>

                {/* Sets List */}
                <View className="gap-2 mb-4">
                  {ex.sets.map((set, setIdx) => (
                    <View
                      key={setIdx}
                      className={`flex-row items-center py-1.5 px-1 rounded-xl ${
                        set.isCompleted ? "bg-accent/5" : ""
                      }`}
                    >
                      <Pressable 
                        onPress={() => removeSetFromActiveExercise(exIdx, setIdx)}
                        className="w-[12%] justify-center items-center"
                      >
                        <Text className="text-muted-foreground font-bold text-xs">{set.setNumber}</Text>
                      </Pressable>

                      <View className="w-[36%] px-2">
                        <Input
                          value={set.weight === 0 ? "" : set.weight.toString()}
                          onChangeText={(val) =>
                            updateActiveSet(exIdx, setIdx, { weight: parseFloat(val) || 0 })
                          }
                          keyboardType="numeric"
                          placeholder="0"
                          variant="dense"
                        />
                      </View>

                      <View className="w-[32%] px-2">
                        <Input
                          value={set.reps.toString()}
                          onChangeText={(val) =>
                            updateActiveSet(exIdx, setIdx, { reps: parseInt(val) || 0 })
                          }
                          keyboardType="numeric"
                          placeholder="10"
                          variant="dense"
                        />
                      </View>

                      <View className="w-[20%] justify-center items-center">
                        <Pressable
                          onPress={() => handleToggleSet(exIdx, setIdx, set.isCompleted)}
                          className={`w-6 h-6 rounded-lg justify-center items-center border ${
                            set.isCompleted
                              ? "bg-accent border-accent"
                              : "border-border bg-card"
                          }`}
                        >
                          {set.isCompleted ? (
                            <Ionicons name="checkmark" size={14} color="#09090b" />
                          ) : null}
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Add Set Button */}
                <Pressable
                  onPress={() => addSetToActiveExercise(exIdx)}
                  className="bg-card border border-border py-2.5 rounded-xl items-center active:scale-98 transition-all"
                >
                  <Text className="text-foreground text-xs font-bold uppercase tracking-wider">+ Add Set</Text>
                </Pressable>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            iconName="barbell-outline"
            title="This workout is empty."
            description="Add exercises from the library below to start tracking."
          />
        )}
      </ScrollView>

      {/* Add Exercise Floating Button at Bottom */}
      <View className="absolute bottom-6 left-6 right-6 z-10 flex-row gap-3">
        <Pressable
          onPress={() => {
            setSearchQuery("");
            setIsAddExerciseModalOpen(true);
          }}
          className="flex-1 bg-card border border-border py-4 rounded-2xl items-center flex-row justify-center active:scale-95 shadow-lg shadow-black/40"
        >
          <Ionicons name="add" size={18} color={isDarkColorScheme ? "#34d399" : "#10b981"} className="mr-1.5" />
          <Text className="text-accent text-xs font-black uppercase tracking-wider">Add Exercise</Text>
        </Pressable>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={isAddExerciseModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsAddExerciseModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-border">
            <Text className="text-foreground text-lg font-black tracking-tight">Add Exercise</Text>
            <Pressable
              onPress={() => setIsAddExerciseModalOpen(false)}
              className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center"
            >
              <Ionicons name="close" size={20} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
            </Pressable>
          </View>

          <View className="px-6 py-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
            />
          </View>

          {/* Not finding it? Create Custom banner */}
          <View className="px-6 pb-3 flex-row justify-between items-center">
            <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Not finding it?</Text>
            <Pressable
              onPress={() => setIsCreateModalOpen(true)}
              className="flex-row items-center bg-card border border-border px-3 py-1.5 rounded-xl active:scale-95"
            >
              <Ionicons name="add" size={14} color={isDarkColorScheme ? "#34d399" : "#10b981"} className="mr-1" />
              <Text className="text-accent text-xs font-bold uppercase tracking-wider">Create Custom</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-grow px-6">
            <View className="gap-2.5 pb-8">
              {filteredLibrary.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleAddExercise(item.name)}
                  className="bg-card dark:bg-muted/60 border border-border rounded-2xl p-4 flex-row justify-between items-center active:scale-[0.99]"
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-foreground font-bold text-sm">{item.name}</Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">{item.targetMuscle}</Text>
                  </View>
                  <View className="bg-card border border-border px-3 py-1.5 rounded-xl">
                    <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">{item.category}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Custom Exercise Modal */}
      <CreateExerciseModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleAddExercise}
      />
    </SafeAreaView>
  );
}
