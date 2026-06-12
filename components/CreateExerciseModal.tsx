import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutStore } from "@/store/workoutStore";
import { useColorScheme } from "@/hooks/useColorScheme";
import Input from "./Input";

type WorkoutCategory = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

interface CreateExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (exerciseName: string) => void;
}

export default function CreateExerciseModal({ visible, onClose, onCreated }: CreateExerciseModalProps) {
  const { createCustomExercise } = useWorkoutStore();
  const { isDarkColorScheme } = useColorScheme();

  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState<WorkoutCategory>("Chest");
  const [newExerciseTarget, setNewExerciseTarget] = useState("");
  const [newExerciseInstructions, setNewExerciseInstructions] = useState("");

  const creationCategories: WorkoutCategory[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

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
      onClose();
      onCreated(createdName);
    } else {
      Alert.alert("Duplicate Name", "An exercise with this name already exists in the library.");
    }
  };

  const handleClose = () => {
    setNewExerciseName("");
    setNewExerciseCategory("Chest");
    setNewExerciseTarget("");
    setNewExerciseInstructions("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="bg-card border border-border rounded-3xl p-5 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground text-base font-black tracking-tight">Create Custom Exercise</Text>
            <Pressable
              onPress={handleClose}
              className="w-8 h-8 rounded-lg bg-background justify-center items-center"
            >
              <Ionicons name="close" size={16} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
            </Pressable>
          </View>

          <ScrollView className="max-h-[350px]" showsVerticalScrollIndicator={false}>
            <View className="gap-4 pb-2">
              <View>
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1.5">Exercise Name *</Text>
                <Input
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="e.g. Incline Bench Press (Barbell)"
                />
              </View>

              <View>
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1.5">Category *</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {creationCategories.map((cat) => {
                    const isSel = newExerciseCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setNewExerciseCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg border text-center active:scale-95 transition-all ${
                          isSel
                            ? "bg-accent border-accent"
                            : "bg-background border-border/60"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            isSel ? "text-accent-foreground" : "text-muted-foreground"
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
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1.5">Target Muscles</Text>
                <Input
                  value={newExerciseTarget}
                  onChangeText={setNewExerciseTarget}
                  placeholder="e.g. Upper Chest, Triceps"
                />
              </View>

              <View>
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1.5">Instructions</Text>
                <Input
                  value={newExerciseInstructions}
                  onChangeText={setNewExerciseInstructions}
                  placeholder="e.g. Set bench to 30 degrees..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>

          <Pressable
            onPress={handleCreateExercise}
            className="bg-accent py-3 rounded-xl items-center mt-6 active:scale-95"
          >
            <Text className="text-accent-foreground text-xs font-black uppercase tracking-wider">Save Exercise</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
