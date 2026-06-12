import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { EXERCISE_LIBRARY } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface SelectedExercise {
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
}

export default function WorkoutCreateTemplate() {
  const router = useRouter();
  const createTemplate = useWorkoutStore((state) => state.createTemplate);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddExerciseFromLibrary = (exerciseName: string) => {
    // Avoid double adding
    if (exercises.some((e) => e.exerciseName === exerciseName)) {
      Alert.alert("Already Added", `${exerciseName} is already in this template.`);
      return;
    }
    setExercises([
      ...exercises,
      { exerciseName, sets: "3", reps: "10", weight: "0" },
    ]);
    setIsModalOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleUpdateExercise = (idx: number, field: keyof SelectedExercise, val: string) => {
    const updated = [...exercises];
    updated[idx] = { ...updated[idx], [field]: val };
    setExercises(updated);
  };

  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a template name.");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Validation Error", "Please add at least one exercise.");
      return;
    }

    // Parse and validate exercises
    const formattedExercises = [];
    for (const e of exercises) {
      const setsNum = parseInt(e.sets);
      const repsNum = parseInt(e.reps);
      const weightNum = parseFloat(e.weight);

      if (isNaN(setsNum) || setsNum <= 0) {
        Alert.alert("Validation Error", `Please enter a valid number of sets for ${e.exerciseName}`);
        return;
      }
      if (isNaN(repsNum) || repsNum <= 0) {
        Alert.alert("Validation Error", `Please enter a valid number of reps for ${e.exerciseName}`);
        return;
      }
      if (isNaN(weightNum) || weightNum < 0) {
        Alert.alert("Validation Error", `Please enter a valid weight for ${e.exerciseName}`);
        return;
      }

      formattedExercises.push({
        exerciseName: e.exerciseName,
        sets: setsNum,
        reps: repsNum,
        weight: weightNum,
      });
    }

    try {
      await createTemplate(name.trim(), notes.trim(), formattedExercises);
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save template.");
    }
  };

  // Filter exercise library
  const filteredLibrary = EXERCISE_LIBRARY.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </Pressable>
        <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Create Template</Text>
        <Pressable
          onPress={handleSaveTemplate}
          className="bg-emerald-500 px-4 py-2 rounded-xl active:scale-95"
        >
          <Text className="text-zinc-950 font-bold text-xs uppercase tracking-wider">Save</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-grow px-6 py-4" keyboardShouldPersistTaps="handled">
        {/* Template General Info */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Template Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Upper Body Strength"
              placeholderTextColor="#52525b"
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
            />
          </View>

          <View>
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Alternate with lower body, rest 90s"
              placeholderTextColor="#52525b"
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Exercises Section */}
        <View className="mb-12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Exercises</Text>
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setIsModalOpen(true);
              }}
              className="flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 px-3 py-1.5 rounded-xl active:scale-95"
            >
              <Ionicons name="add" size={14} color="#10b981" className="mr-1" />
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Add Exercise</Text>
            </Pressable>
          </View>

          {exercises.length > 0 ? (
            <View className="gap-4">
              {exercises.map((e, idx) => (
                <View
                  key={idx}
                  className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-zinc-900 dark:text-white text-sm font-black tracking-tight">{e.exerciseName}</Text>
                    <Pressable
                      onPress={() => handleRemoveExercise(idx)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 justify-center items-center"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-zinc-500 text-xs font-semibold mb-1.5">Sets</Text>
                      <TextInput
                        value={e.sets}
                        onChangeText={(val) => handleUpdateExercise(idx, "sets", val)}
                        keyboardType="numeric"
                        className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-center font-bold"
                      />
                    </View>

                    <View className="flex-grow flex-1">
                      <Text className="text-zinc-500 text-xs font-semibold mb-1.5">Reps</Text>
                      <TextInput
                        value={e.reps}
                        onChangeText={(val) => handleUpdateExercise(idx, "reps", val)}
                        keyboardType="numeric"
                        className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-center font-bold"
                      />
                    </View>

                    <View className="flex-grow flex-1">
                      <Text className="text-zinc-500 text-xs font-semibold mb-1.5">Weight</Text>
                      <TextInput
                        value={e.weight}
                        onChangeText={(val) => handleUpdateExercise(idx, "weight", val)}
                        keyboardType="numeric"
                        className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl text-center font-bold"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-8 justify-center items-center">
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider">No exercises added yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Select Exercise Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900">
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Select Exercise</Text>
            <Pressable
              onPress={() => setIsModalOpen(false)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center"
            >
              <Ionicons name="close" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* Search bar */}
          <View className="px-6 py-3">
            <View className="flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-xl px-4 py-2.5 items-center">
              <Ionicons name="search" size={16} color="#71717a" className="mr-2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises by name or muscle..."
                placeholderTextColor="#71717a"
                className="text-zinc-900 dark:text-white flex-grow p-0 m-0 font-medium"
              />
            </View>
          </View>

          <ScrollView className="flex-grow px-6">
            <View className="gap-2.5 pb-8">
              {filteredLibrary.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleAddExerciseFromLibrary(item.name)}
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
    </SafeAreaView>
  );
}
