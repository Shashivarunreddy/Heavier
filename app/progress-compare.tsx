import { useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useMeasurementStore, MeasurementEntry, ProgressPhotos } from "@/store/measurementStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProgressCompare() {
  const router = useRouter();
  const { measurements } = useMeasurementStore();
  const { settings } = useUserStore();

  const [entryA, setEntryA] = useState<MeasurementEntry | null>(measurements[1] || null);
  const [entryB, setEntryB] = useState<MeasurementEntry | null>(measurements[0] || null);

  const [selectorTarget, setSelectorTarget] = useState<"A" | "B" | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<keyof ProgressPhotos>("front");

  const handleSelectEntry = (entry: MeasurementEntry) => {
    if (selectorTarget === "A") {
      setEntryA(entry);
    } else if (selectorTarget === "B") {
      setEntryB(entry);
    }
    setSelectorTarget(null);
  };

  const getDiffText = (valA: number | null, valB: number | null, unit: string) => {
    if (valA === null || valB === null) return { text: "--", color: "text-zinc-500" };
    const diff = valB - valA;
    if (diff === 0) return { text: "0.0", color: "text-zinc-600 dark:text-zinc-400 dark:text-zinc-400" };
    const sign = diff > 0 ? "+" : "";
    return {
      text: `${sign}${diff.toFixed(1)} ${unit}`,
      color: diff > 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold",
    };
  };

  const renderComparisonRow = (label: string, valA: number | null, valB: number | null, unit: string) => {
    const diff = getDiffText(valA, valB, unit);
    return (
      <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/40">
        <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold">{label}</Text>
        <View className="flex-row gap-6 items-center">
          <Text className="text-zinc-500 text-xs font-bold">{valA !== null ? `${valA} ${unit}` : "--"}</Text>
          <Text className="text-zinc-500 text-xs font-bold">→</Text>
          <Text className="text-zinc-900 dark:text-white text-xs font-bold">{valB !== null ? `${valB} ${unit}` : "--"}</Text>
          <Text className={`${diff.color} text-xs text-right w-16`}>{diff.text}</Text>
        </View>
      </View>
    );
  };

  const angles: (keyof ProgressPhotos)[] = ["front", "left", "right", "back"];

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
        <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Compare Progress</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Entry Selection Rows */}
        <View className="flex-row gap-3 mb-6">
          {/* Select A */}
          <Pressable
            onPress={() => setSelectorTarget("A")}
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-3.5 items-center active:scale-95 transition-all"
          >
            <Text className="text-zinc-500 text-[9px] font-black uppercase tracking-wider mb-1">Log A (Earlier)</Text>
            <Text className="text-zinc-900 dark:text-white font-bold text-xs">
              {entryA
                ? new Date(entryA.measurementDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })
                : "Select Entry"}
            </Text>
          </Pressable>

          {/* Icon */}
          <View className="justify-center items-center">
            <Ionicons name="arrow-forward" size={16} color="#71717a" />
          </View>

          {/* Select B */}
          <Pressable
            onPress={() => setSelectorTarget("B")}
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-3.5 items-center active:scale-95 transition-all"
          >
            <Text className="text-zinc-500 text-[9px] font-black uppercase tracking-wider mb-1">Log B (Later)</Text>
            <Text className="text-zinc-900 dark:text-white font-bold text-xs">
              {entryB
                ? new Date(entryB.measurementDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })
                : "Select Entry"}
            </Text>
          </Pressable>
        </View>

        {entryA && entryB ? (
          <View className="gap-6 pb-12">
            {/* Dimensions Table */}
            <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Measurement Deltas</Text>
              
              {renderComparisonRow("Weight", entryA.bodyWeight, entryB.bodyWeight, settings.weightUnit)}
              {renderComparisonRow("Chest", entryA.chestSize, entryB.chestSize, settings.lengthUnit)}
              {renderComparisonRow("Waist", entryA.waistSize, entryB.waistSize, settings.lengthUnit)}
              {renderComparisonRow("Left Arm", entryA.leftArmSize, entryB.leftArmSize, settings.lengthUnit)}
              {renderComparisonRow("Right Arm", entryA.rightArmSize, entryB.rightArmSize, settings.lengthUnit)}
              {renderComparisonRow("Left Thigh", entryA.leftThighSize, entryB.leftThighSize, settings.lengthUnit)}
              {renderComparisonRow("Right Thigh", entryA.rightThighSize, entryB.rightThighSize, settings.lengthUnit)}
            </View>

            {/* Photos Side-by-Side */}
            <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5">
              <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Photo Compare</Text>
              
              {/* Angle selector tabs */}
              <View className="flex-row justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-1 mb-4">
                {angles.map((ang) => (
                  <Pressable
                    key={ang}
                    onPress={() => setSelectedAngle(ang)}
                    className={`flex-1 py-1.5 rounded-lg justify-center items-center ${
                      selectedAngle === ang ? "bg-emerald-500" : ""
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-black uppercase tracking-wider ${
                        selectedAngle === ang ? "text-zinc-950" : "text-zinc-500"
                      }`}
                    >
                      {ang}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Photos container */}
              <View className="flex-row gap-3 h-[240px]">
                <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden justify-center items-center">
                  {entryA.photos?.[selectedAngle] ? (
                    <Image source={{ uri: entryA.photos[selectedAngle]! }} className="w-full h-full object-cover" />
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera-outline" size={24} color="#3f3f46" className="mb-1" />
                      <Text className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">No Photo</Text>
                    </View>
                  )}
                  <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md">
                    <Text className="text-zinc-900 dark:text-white text-[8px] font-black uppercase tracking-wider">A: Earlier</Text>
                  </View>
                </View>

                <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden justify-center items-center">
                  {entryB.photos?.[selectedAngle] ? (
                    <Image source={{ uri: entryB.photos[selectedAngle]! }} className="w-full h-full object-cover" />
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera-outline" size={24} color="#3f3f46" className="mb-1" />
                      <Text className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">No Photo</Text>
                    </View>
                  )}
                  <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md">
                    <Text className="text-zinc-900 dark:text-white text-[8px] font-black uppercase tracking-wider">B: Later</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center">
            <Ionicons name="git-compare-outline" size={42} color="#52525b" className="mb-2" />
            <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm font-bold text-center">Select two check-in entries.</Text>
            <Text className="text-zinc-600 text-xs text-center mt-1">
              Select date ranges at the top to compute delta calculations.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Select Entry Modal */}
      <Modal
        visible={selectorTarget !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectorTarget(null)}
      >
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-zinc-900">
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Select check-in entry</Text>
            <Pressable
              onPress={() => setSelectorTarget(null)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center"
            >
              <Ionicons name="close" size={20} color="#ffffff" />
            </Pressable>
          </View>

          <ScrollView className="flex-grow px-6 py-4">
            <View className="gap-3 pb-8">
              {measurements.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectEntry(item)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-900 rounded-2xl p-4 flex-row justify-between items-center active:scale-[0.99]"
                >
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-bold text-sm">
                      {new Date(item.measurementDate).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    {item.bodyWeight ? (
                      <Text className="text-zinc-500 text-xs mt-0.5">
                        Weight: {item.bodyWeight} {settings.weightUnit}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#71717a" />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
