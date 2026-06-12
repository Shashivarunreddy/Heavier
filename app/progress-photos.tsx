import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useRouter, Href } from "expo-router";
import { useMeasurementStore } from "@/store/measurementStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProgressPhotosScreen() {
  const router = useRouter();
  const { measurements } = useMeasurementStore();
  const { isDarkColorScheme } = useColorScheme();

  const iconColor = isDarkColorScheme ? "#ffffff" : "#18181b";
  const accentIconColor = isDarkColorScheme ? "#34d399" : "#10b981";
  const mutedIconColor = isDarkColorScheme ? "#a1a1aa" : "#71717a";

  // Filter out measurements that actually have photos
  const measurementsWithPhotos = measurements.filter(
    (item) => item.photos && (item.photos.front || item.photos.left || item.photos.right || item.photos.back)
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-border bg-background z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center active:scale-95"
        >
          <Ionicons name="chevron-back" size={20} color={iconColor} />
        </Pressable>
        <Text className="text-foreground text-lg font-black tracking-tight">Physique Gallery</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/progress" as Href)}
          className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center active:scale-95"
        >
          <Ionicons name="add" size={20} color={accentIconColor} />
        </Pressable>
      </View>

      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        {measurementsWithPhotos.length > 0 ? (
          <View className="gap-6 pb-24">
            {measurementsWithPhotos.map((item) => (
              <View
                key={item.id}
                className="bg-muted border border-border/60 rounded-3xl p-5"
              >
                {/* Date Header */}
                <Text className="text-foreground text-sm font-black tracking-tight mb-3">
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
                        className="w-[48%] h-[160px] bg-background border border-border/60 rounded-2xl overflow-hidden justify-center items-center"
                      >
                        <Image source={{ uri: path }} className="w-full h-full object-cover" />
                        <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md">
                          <Text className="text-white text-[8px] font-black uppercase tracking-wider">{angle}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-card border border-border border-dashed rounded-3xl p-12 justify-center items-center mt-12">
            <Ionicons name="camera-outline" size={48} color={mutedIconColor} className="mb-2" />
            <Text className="text-muted-foreground text-sm font-bold text-center">No progress photos found.</Text>
            <Text className="text-muted-foreground text-xs text-center mt-1">
              Add photos during a progress log check-in to see them here.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/progress" as Href)}
              className="bg-card border border-border px-6 py-2.5 rounded-xl mt-4 active:scale-95"
            >
              <Text className="text-accent text-xs font-bold uppercase tracking-wider">Log Photos Now</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
