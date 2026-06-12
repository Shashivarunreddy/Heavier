import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useRouter, Href } from "expo-router";
import { useMeasurementStore } from "@/store/measurementStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProgressPhotosScreen() {
  const router = useRouter();
  const { measurements } = useMeasurementStore();

  // Filter out measurements that actually have photos
  const measurementsWithPhotos = measurements.filter(
    (item) => item.photos && (item.photos.front || item.photos.left || item.photos.right || item.photos.back)
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-50 dark:bg-zinc-950 z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </Pressable>
        <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Physique Gallery</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/progress" as Href)}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95"
        >
          <Ionicons name="add" size={20} color="#10b981" />
        </Pressable>
      </View>

      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        {measurementsWithPhotos.length > 0 ? (
          <View className="gap-6 pb-24">
            {measurementsWithPhotos.map((item) => (
              <View
                key={item.id}
                className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl p-5"
              >
                {/* Date Header */}
                <Text className="text-zinc-900 dark:text-white text-sm font-black tracking-tight mb-3">
                  {new Date(item.measurementDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>

                {/* Grid */}
                <View className="flex-row flex-wrap justify-between gap-y-2.5">
                  {(["front", "left", "right", "back"] as const).map((angle) => {
                    const path = item.photos?.[angle];
                    if (!path) return null;
                    return (
                      <View
                        key={angle}
                        className="w-[48%] h-[160px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden justify-center items-center"
                      >
                        <Image source={{ uri: path }} className="w-full h-full object-cover" />
                        <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md">
                          <Text className="text-zinc-900 dark:text-white text-[8px] font-black uppercase tracking-wider">{angle}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center mt-12">
            <Ionicons name="camera-outline" size={48} color="#52525b" className="mb-2" />
            <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-bold text-center">No progress photos found.</Text>
            <Text className="text-zinc-600 text-xs text-center mt-1">
              Add photos during a progress log check-in to see them here.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/progress" as Href)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 px-6 py-2.5 rounded-xl mt-4 active:scale-95"
            >
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Log Photos Now</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
