import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { EXERCISE_LIBRARY, ExerciseInfo } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutStore } from "@/store/workoutStore";

type CategoryFilter = "All" | "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
type WorkoutCategory = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

export default function ExerciseLibrary() {
  const router = useRouter();
  const { customExercises, createCustomExercise } = useWorkoutStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseInfo | null>(null);

  // Custom exercise creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState<WorkoutCategory>("Chest");
  const [newExerciseTarget, setNewExerciseTarget] = useState("");
  const [newExerciseInstructions, setNewExerciseInstructions] = useState("");

  const categories: CategoryFilter[] = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  const creationCategories: WorkoutCategory[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

  const combinedLibrary = [...EXERCISE_LIBRARY, ...customExercises];
  const sortedLibrary = [...combinedLibrary].sort((a, b) => a.name.localeCompare(b.name));

  const filteredExercises = sortedLibrary.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All" || ex.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
      setNewExerciseName("");
      setNewExerciseCategory("Chest");
      setNewExerciseTarget("");
      setNewExerciseInstructions("");
      setIsCreateModalOpen(false);
      Alert.alert("Success", `Custom exercise "${newExerciseName.trim()}" created successfully!`);
    } else {
      Alert.alert("Duplicate Name", "An exercise with this name already exists in the library.");
    }
  };

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
        <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Exercise Library</Text>
        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-emerald-500 justify-center items-center active:scale-95 shadow-md shadow-emerald-500/25"
        >
          <Ionicons name="add" size={22} color="#09090b" />
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="px-6 py-3 border-b border-zinc-900/60">
        <View className="flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-xl px-4 py-2.5 items-center mb-3">
          <Ionicons name="search" size={16} color="#71717a" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises or muscles..."
            placeholderTextColor="#71717a"
            className="text-zinc-900 dark:text-white flex-grow p-0 m-0 font-medium"
          />
        </View>

        {/* Category Horizontal Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl border mr-2 active:scale-95 transition-all ${
                  isSelected
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/60"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? "text-zinc-950" : "text-zinc-600 dark:text-zinc-400 dark:text-zinc-400"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        {filteredExercises.length > 0 ? (
          <View className="gap-3 pb-12">
            {filteredExercises.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedExercise(item)}
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
        ) : (
          <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center mt-8">
            <Ionicons name="alert-circle-outline" size={42} color="#52525b" className="mb-2" />
            <Text className="text-zinc-500 text-sm font-bold text-center">No exercises found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Instruction Details Modal */}
      <Modal
        visible={selectedExercise !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">{selectedExercise?.name}</Text>
              <Pressable
                onPress={() => setSelectedExercise(null)}
                className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 justify-center items-center"
              >
                <Ionicons name="close" size={16} color="#ffffff" />
              </Pressable>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1">Target Muscles</Text>
                <Text className="text-zinc-800 dark:text-zinc-300 text-xs font-semibold">{selectedExercise?.targetMuscle}</Text>
              </View>

              <View>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1">Category</Text>
                <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl self-start">
                  <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">{selectedExercise?.category}</Text>
                </View>
              </View>

              <View className="border-t border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 pt-3">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-1">Instructions</Text>
                <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs leading-relaxed">{selectedExercise?.instructions}</Text>
              </View>
            </View>
          </View>
        </View>
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
