import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { EXERCISE_LIBRARY, ExerciseInfo } from "@/lib/exerciseLibrary";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useWorkoutStore } from "@/store/workoutStore";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import CreateExerciseModal from "../components/CreateExerciseModal";

type CategoryFilter = "All" | "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

export default function ExerciseLibrary() {
  const router = useRouter();
  const { customExercises } = useWorkoutStore();
  const { isDarkColorScheme } = useColorScheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseInfo | null>(null);

  // Custom exercise creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories: CategoryFilter[] = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

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
        <Text className="text-foreground text-lg font-black tracking-tight">Exercise Library</Text>
        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-accent justify-center items-center active:scale-95 shadow-md shadow-accent/25"
        >
          <Ionicons name="add" size={22} color="#09090b" />
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="px-6 py-3 border-b border-border/60">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises or muscles..."
          containerClassName="mb-3"
        />

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
                    ? "bg-accent border-accent"
                    : "bg-card border-border/60"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? "text-accent-foreground" : "text-muted-foreground"
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
        ) : (
          <EmptyState
            iconName="alert-circle-outline"
            title="No exercises found."
          />
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
          <View className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground text-base font-black tracking-tight">{selectedExercise?.name}</Text>
              <Pressable
                onPress={() => setSelectedExercise(null)}
                className="w-8 h-8 rounded-lg bg-background justify-center items-center"
              >
                <Ionicons name="close" size={16} color={isDarkColorScheme ? "#ffffff" : "#09090b"} />
              </Pressable>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1">Target Muscles</Text>
                <Text className="text-foreground text-xs font-semibold">{selectedExercise?.targetMuscle}</Text>
              </View>

              <View>
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1">Category</Text>
                <View className="bg-background border border-border/60 px-3 py-1.5 rounded-xl self-start">
                  <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">{selectedExercise?.category}</Text>
                </View>
              </View>

              <View className="border-t border-border pt-3">
                <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mb-1">Instructions</Text>
                <Text className="text-muted-foreground text-xs leading-relaxed">{selectedExercise?.instructions}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Custom Exercise Modal */}
      <CreateExerciseModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(name) => {
          Alert.alert("Success", `Custom exercise "${name}" created successfully!`);
        }}
      />
    </SafeAreaView>
  );
}
