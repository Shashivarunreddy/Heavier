import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "@/store/workoutStore";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EXERCISE_LIBRARY } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CreateExerciseModal from "../components/CreateExerciseModal";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import Card from "../components/Card";
import Input from "../components/Input";

interface SelectedExercise {
  exerciseName: string;
  sets: string;
  reps: string;
  weight: string;
}

export default function WorkoutCreateTemplate() {
  const router = useRouter();
  const { createTemplate, customExercises } = useWorkoutStore();
  const { isDarkColorScheme } = useColorScheme();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Filter exercise library (static + custom)
  const combinedLibrary = [...EXERCISE_LIBRARY, ...customExercises];
  const sortedLibrary = [...combinedLibrary].sort((a, b) => a.name.localeCompare(b.name));

  const filteredLibrary = sortedLibrary.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-border bg-background">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
        </Pressable>
        <Text className="text-foreground text-lg font-black tracking-tight">Create Template</Text>
        <Pressable
          onPress={handleSaveTemplate}
          className="bg-accent px-4 py-2 rounded-xl active:scale-95"
        >
          <Text className="text-accent-foreground font-bold text-xs uppercase tracking-wider">Save</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-grow px-6 py-4" keyboardShouldPersistTaps="handled">
        {/* Template General Info */}
        <View className="gap-4 mb-6">
          <View>
            <SectionHeader title="Template Name" containerClassName="mb-2" />
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g. Upper Body Strength"
            />
          </View>

          <View>
            <SectionHeader title="Notes (Optional)" containerClassName="mb-2" />
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Alternate with lower body, rest 90s"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Exercises Section */}
        <View className="mb-12">
          <SectionHeader
            title="Exercises"
            containerClassName="mb-4"
            rightElement={
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setIsModalOpen(true);
                }}
                className="flex-row items-center bg-card border border-border px-3 py-1.5 rounded-xl active:scale-95"
              >
                <Ionicons name="add" size={14} color={isDarkColorScheme ? "#34d399" : "#10b981"} className="mr-1" />
                <Text className="text-accent text-xs font-bold uppercase tracking-wider">Add Exercise</Text>
              </Pressable>
            }
          />

          {exercises.length > 0 ? (
            <View className="gap-4">
              {exercises.map((e, idx) => (
                <Card
                  key={idx}
                  className="bg-muted border-border/60"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-foreground text-sm font-black tracking-tight">{e.exerciseName}</Text>
                    <Pressable
                      onPress={() => handleRemoveExercise(idx)}
                      className="w-8 h-8 rounded-lg bg-card justify-center items-center"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-grow flex-1">
                      <Text className="text-muted-foreground text-xs font-semibold mb-1.5">Sets</Text>
                      <Input
                        value={e.sets}
                        onChangeText={(val) => handleUpdateExercise(idx, "sets", val)}
                        keyboardType="numeric"
                        variant="dense"
                      />
                    </View>

                    <View className="flex-grow flex-1">
                      <Text className="text-muted-foreground text-xs font-semibold mb-1.5">Reps</Text>
                      <Input
                        value={e.reps}
                        onChangeText={(val) => handleUpdateExercise(idx, "reps", val)}
                        keyboardType="numeric"
                        variant="dense"
                      />
                    </View>

                    <View className="flex-grow flex-1">
                      <Text className="text-muted-foreground text-xs font-semibold mb-1.5">Weight</Text>
                      <Input
                        value={e.weight}
                        onChangeText={(val) => handleUpdateExercise(idx, "weight", val)}
                        keyboardType="numeric"
                        variant="dense"
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No exercises added yet."
              containerClassName="bg-card border border-border border-dashed rounded-3xl p-5 justify-center items-center"
              titleClassName="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center"
            />
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
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-border">
            <Text className="text-foreground text-lg font-black tracking-tight">Select Exercise</Text>
            <Pressable
              onPress={() => setIsModalOpen(false)}
              className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center"
            >
              <Ionicons name="close" size={20} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
            </Pressable>
          </View>

          {/* Search bar */}
          <View className="px-6 py-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises by name or muscle..."
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
                  onPress={() => handleAddExerciseFromLibrary(item.name)}
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
        onCreated={handleAddExerciseFromLibrary}
      />
    </SafeAreaView>
  );
}
