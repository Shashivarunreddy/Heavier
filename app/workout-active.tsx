import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal, Alert } from "react-native";
import { useRouter, Href } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useUserStore } from "@/store/userStore";
import { EXERCISE_LIBRARY } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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
    createCustomExercise,
  } = useWorkoutStore();

  const { settings } = useUserStore();

  const [notes, setNotes] = useState("");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom exercise creation state
  type WorkoutCategory = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
  const creationCategories: WorkoutCategory[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState<WorkoutCategory>("Chest");
  const [newExerciseTarget, setNewExerciseTarget] = useState("");
  const [newExerciseInstructions, setNewExerciseInstructions] = useState("");

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert("Required", "Please enter an exercise name.");
      return;
    }

    const success = await createCustomExercise(
      newExerciseName,
      newExerciseCategory,
      newExerciseTarget,
      newExerciseInstructions
    );

    if (success) {
      const createdName = newExerciseName.trim();
      setNewExerciseName("");
      setNewExerciseCategory("Chest");
      setNewExerciseTarget("");
      setNewExerciseInstructions("");
      setIsCreateModalOpen(false);
      
      // Auto-select and add the newly created exercise
      handleAddExercise(createdName);
    } else {
      Alert.alert("Duplicate Name", "An exercise with this name already exists in the library.");
    }
  };

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
      const summary = await finishActiveWorkout(notes);
      setIsNotesModalOpen(false);
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
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Top Navigation */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-50 dark:bg-zinc-950 z-10">
        <View>
          <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{activeWorkout.name}</Text>
        </View>
        
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={handleCancelWorkout}
            className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center"
          >
            <Ionicons name="close-outline" size={20} color="#ef4444" />
          </Pressable>

          <Pressable
            onPress={() => setIsNotesModalOpen(true)}
            className="bg-emerald-500 px-4 py-2 rounded-xl justify-center items-center active:scale-95"
          >
            <Text className="text-zinc-950 font-bold text-xs uppercase tracking-wider">Finish</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Form Scroller */}
      <ScrollView className="flex-grow px-6 py-4" keyboardShouldPersistTaps="handled">
        {activeWorkout.exercises.length > 0 ? (
          <View className="gap-6 pb-24">
            {activeWorkout.exercises.map((ex, exIdx) => (
              <View
                key={exIdx}
                className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl p-5"
              >
                {/* Exercise Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1 pr-4">
                    <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{ex.exerciseName}</Text>
                  </View>
                  <Pressable
                    onPress={() => removeExerciseFromActiveWorkout(exIdx)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 justify-center items-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </Pressable>
                </View>

                {/* Table Header */}
                <View className="flex-row mb-2 px-1">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider w-[12%] text-center">Set</Text>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider w-[36%] text-center">Weight ({settings.weightUnit})</Text>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider w-[32%] text-center">Reps</Text>
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider w-[20%] text-center">Done</Text>
                </View>

                {/* Sets List */}
                <View className="gap-2 mb-4">
                  {ex.sets.map((set, setIdx) => (
                    <View
                      key={setIdx}
                      className={`flex-row items-center py-1.5 px-1 rounded-xl ${
                        set.isCompleted ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <Pressable 
                        onPress={() => removeSetFromActiveExercise(exIdx, setIdx)}
                        className="w-[12%] justify-center items-center"
                      >
                        <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 font-bold text-xs">{set.setNumber}</Text>
                      </Pressable>

                      <View className="w-[36%] px-2">
                        <TextInput
                          value={set.weight === 0 ? "" : set.weight.toString()}
                          onChangeText={(val) =>
                            updateActiveSet(exIdx, setIdx, { weight: parseFloat(val) || 0 })
                          }
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#3f3f46"
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white py-1 rounded-lg text-center font-bold text-xs"
                        />
                      </View>

                      <View className="w-[32%] px-2">
                        <TextInput
                          value={set.reps.toString()}
                          onChangeText={(val) =>
                            updateActiveSet(exIdx, setIdx, { reps: parseInt(val) || 0 })
                          }
                          keyboardType="numeric"
                          placeholder="10"
                          placeholderTextColor="#3f3f46"
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white py-1 rounded-lg text-center font-bold text-xs"
                        />
                      </View>

                      <View className="w-[20%] justify-center items-center">
                        <Pressable
                          onPress={() => handleToggleSet(exIdx, setIdx, set.isCompleted)}
                          className={`w-6 h-6 rounded-lg justify-center items-center border ${
                            set.isCompleted
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 bg-white dark:bg-zinc-900"
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
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/80 py-2.5 rounded-xl items-center active:scale-98 transition-all"
                >
                  <Text className="text-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">+ Add Set</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center mt-8">
            <Ionicons name="barbell-outline" size={42} color="#52525b" className="mb-2" />
            <Text className="text-zinc-500 text-sm font-bold text-center">This workout is empty.</Text>
            <Text className="text-zinc-600 text-xs text-center mt-1">
              Add exercises from the library below to start tracking.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Exercise Floating Button at Bottom */}
      <View className="absolute bottom-6 left-6 right-6 z-10 flex-row gap-3">
        <Pressable
          onPress={() => {
            setSearchQuery("");
            setIsAddExerciseModalOpen(true);
          }}
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 py-4 rounded-2xl items-center flex-row justify-center active:scale-95 shadow-lg shadow-black/40"
        >
          <Ionicons name="add" size={18} color="#10b981" className="mr-1.5" />
          <Text className="text-emerald-400 text-xs font-black uppercase tracking-wider">Add Exercise</Text>
        </Pressable>
      </View>

      {/* Finish Notes Modal */}
      <Modal
        visible={isNotesModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight mb-2">Finish Workout</Text>
            <Text className="text-zinc-500 text-xs mb-4">Add notes about your energy level, injuries, or comments.</Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Great session, bench felt easy today!"
              placeholderTextColor="#52525b"
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium mb-6 text-sm"
              multiline
              numberOfLines={3}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsNotesModalOpen(false)}
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 py-3 rounded-xl items-center"
              >
                <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Back</Text>
              </Pressable>

              <Pressable
                onPress={handleFinishWorkout}
                className="flex-1 bg-emerald-500 py-3 rounded-xl items-center"
              >
                <Text className="text-zinc-950 text-xs font-black uppercase tracking-wider">Finish Log</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={isAddExerciseModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsAddExerciseModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900">
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Add Exercise</Text>
            <Pressable
              onPress={() => setIsAddExerciseModalOpen(false)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center"
            >
              <Ionicons name="close" size={20} color="#ffffff" />
            </Pressable>
          </View>

          <View className="px-6 py-3">
            <View className="flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-xl px-4 py-2.5 items-center">
              <Ionicons name="search" size={16} color="#71717a" className="mr-2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises..."
                placeholderTextColor="#71717a"
                className="text-zinc-900 dark:text-white flex-grow p-0 m-0 font-medium"
              />
            </View>
          </View>

          {/* Not finding it? Create Custom banner */}
          <View className="px-6 pb-3 flex-row justify-between items-center">
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Not finding it?</Text>
            <Pressable
              onPress={() => setIsCreateModalOpen(true)}
              className="flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl active:scale-95"
            >
              <Ionicons name="add" size={14} color="#10b981" className="mr-1" />
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Create Custom</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-grow px-6">
            <View className="gap-2.5 pb-8">
              {filteredLibrary.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleAddExercise(item.name)}
                  className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-900 rounded-2xl p-4 flex-row justify-between items-center active:scale-[0.99]"
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-zinc-900 dark:text-white font-bold text-sm">{item.name}</Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">{item.targetMuscle}</Text>
                  </View>
                  <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
                    <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider">{item.category}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Custom Exercise Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">Create Custom Exercise</Text>
              <Pressable
                onPress={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 justify-center items-center"
              >
                <Ionicons name="close" size={16} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[350px]" showsVerticalScrollIndicator={false}>
              <View className="gap-4 pb-2">
                <View>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1.5">Exercise Name *</Text>
                  <TextInput
                    value={newExerciseName}
                    onChangeText={setNewExerciseName}
                    placeholder="e.g. Incline Bench Press (Barbell)"
                    placeholderTextColor="#71717a"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1.5">Category *</Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {creationCategories.map((cat) => {
                      const isSel = newExerciseCategory === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setNewExerciseCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg border text-center active:scale-95 transition-all ${
                            isSel
                              ? "bg-emerald-500 border-emerald-500"
                              : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/60"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              isSel ? "text-zinc-950" : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1.5">Target Muscles</Text>
                  <TextInput
                    value={newExerciseTarget}
                    onChangeText={setNewExerciseTarget}
                    placeholder="e.g. Upper Chest, Triceps"
                    placeholderTextColor="#71717a"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold"
                  />
                </View>

                <View>
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1.5">Instructions</Text>
                  <TextInput
                    value={newExerciseInstructions}
                    onChangeText={setNewExerciseInstructions}
                    placeholder="e.g. Set bench to 30 degrees..."
                    placeholderTextColor="#71717a"
                    multiline
                    numberOfLines={3}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold leading-relaxed"
                  />
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreateExercise}
              className="bg-emerald-500 py-3 rounded-xl items-center mt-6 active:scale-95"
            >
              <Text className="text-zinc-950 text-xs font-black uppercase tracking-wider">Save Exercise</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
