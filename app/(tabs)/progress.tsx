import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image, Alert } from "react-native";
import { useRouter, Href } from "expo-router";
import { useMeasurementStore, ProgressPhotos } from "@/store/measurementStore";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function Progress() {
  const router = useRouter();
  const { measurements, addMeasurement, deleteMeasurement } = useMeasurementStore();
  const { settings } = useUserStore();

  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightArm, setRightArm] = useState("");
  const [leftThigh, setLeftThigh] = useState("");
  const [rightThigh, setRightThigh] = useState("");

  const [photos, setPhotos] = useState<Partial<ProgressPhotos>>({
    front: null,
    left: null,
    right: null,
    back: null,
  });

  const [isLoggingOpen, setIsLoggingOpen] = useState(false);

  const handleLaunchCamera = async (angle: keyof ProgressPhotos) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera permissions to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => ({ ...prev, [angle]: result.assets[0].uri }));
    }
  };

  const handleLaunchLibrary = async (angle: keyof ProgressPhotos) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need library permissions to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => ({ ...prev, [angle]: result.assets[0].uri }));
    }
  };

  const handlePickImage = (angle: keyof ProgressPhotos) => {
    Alert.alert(
      "Select Photo",
      `How would you like to add the ${angle} view photo?`,
      [
        {
          text: "Take Photo (Camera)",
          onPress: () => handleLaunchCamera(angle),
        },
        {
          text: "Choose from Gallery",
          onPress: () => handleLaunchLibrary(angle),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleSaveMeasurement = async () => {
    if (!weight && !chest && !waist && !leftArm && !rightArm && !leftThigh && !rightThigh) {
      Alert.alert("Validation Error", "Please enter at least one measurement metric.");
      return;
    }

    const metrics = {
      bodyWeight: weight ? parseFloat(weight) : undefined,
      chestSize: chest ? parseFloat(chest) : undefined,
      waistSize: waist ? parseFloat(waist) : undefined,
      leftArmSize: leftArm ? parseFloat(leftArm) : undefined,
      rightArmSize: rightArm ? parseFloat(rightArm) : undefined,
      leftThighSize: leftThigh ? parseFloat(leftThigh) : undefined,
      rightThighSize: rightThigh ? parseFloat(rightThigh) : undefined,
    };

    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await addMeasurement(date, metrics, photos);
      
      // Reset Form
      setWeight("");
      setChest("");
      setWaist("");
      setLeftArm("");
      setRightArm("");
      setLeftThigh("");
      setRightThigh("");
      setPhotos({ front: null, left: null, right: null, back: null });
      setIsLoggingOpen(false);
      Alert.alert("Success", "Progress check-in logged successfully!");
    } catch {
      Alert.alert("Error", "Failed to save measurement log.");
    }
  };

  const handleDeleteLog = (id: number, date: string) => {
    Alert.alert(
      "Delete Progress Entry",
      `Are you sure you want to delete the check-in from ${new Date(date).toLocaleDateString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMeasurement(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView className="flex-grow px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Progress Log</Text>
            <Text className="text-zinc-500 text-sm mt-1">
              Track weight changes, body size, and photos.
            </Text>
          </View>
          {measurements.length >= 2 ? (
            <Pressable
              onPress={() => router.push("/progress-compare" as Href)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95"
              aria-label="Compare progress entries"
            >
              <Ionicons name="git-compare-outline" size={20} color="#10b981" />
            </Pressable>
          ) : null}
        </View>

        {/* Toggle Logger Form */}
        <Pressable
          onPress={() => setIsLoggingOpen(!isLoggingOpen)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5 mb-6 flex-row justify-between items-center active:scale-[0.99]"
        >
          <View>
            <Text className="text-zinc-900 dark:text-white text-base font-black tracking-tight">New Check-In</Text>
            <Text className="text-zinc-500 text-xs mt-1">Record weight and dimensions</Text>
          </View>
          <Ionicons
            name={isLoggingOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#10b981"
          />
        </Pressable>

        {/* Logger Form Drawer */}
        {isLoggingOpen ? (
          <View className="bg-zinc-100 dark:bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl p-5 mb-8 gap-5">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Weight ({settings.weightUnit})</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="e.g. 75.4"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>

              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Chest ({settings.lengthUnit})</Text>
                <TextInput
                  value={chest}
                  onChangeText={setChest}
                  keyboardType="numeric"
                  placeholder="e.g. 102"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Waist ({settings.lengthUnit})</Text>
                <TextInput
                  value={waist}
                  onChangeText={setWaist}
                  keyboardType="numeric"
                  placeholder="e.g. 82.0"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>
              <View className="flex-1" />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Left Arm ({settings.lengthUnit})</Text>
                <TextInput
                  value={leftArm}
                  onChangeText={setLeftArm}
                  keyboardType="numeric"
                  placeholder="e.g. 36.5"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>

              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Right Arm ({settings.lengthUnit})</Text>
                <TextInput
                  value={rightArm}
                  onChangeText={setRightArm}
                  keyboardType="numeric"
                  placeholder="e.g. 36.7"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Left Thigh ({settings.lengthUnit})</Text>
                <TextInput
                  value={leftThigh}
                  onChangeText={setLeftThigh}
                  keyboardType="numeric"
                  placeholder="e.g. 58"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>

              <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-2">Right Thigh ({settings.lengthUnit})</Text>
                <TextInput
                  value={rightThigh}
                  onChangeText={setRightThigh}
                  keyboardType="numeric"
                  placeholder="e.g. 58.2"
                  placeholderTextColor="#3f3f46"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl font-bold text-xs focus:border-emerald-500"
                />
              </View>
            </View>

            {/* Photo Selection Grid */}
            <View>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-3">Physique Photos</Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {(["front", "left", "right", "back"] as (keyof ProgressPhotos)[]).map((angle) => (
                  <Pressable
                    key={angle}
                    onPress={() => handlePickImage(angle)}
                    className="w-[48%] h-[120px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl justify-center items-center overflow-hidden"
                  >
                    {photos[angle] ? (
                      <View className="w-full h-full">
                        <Image source={{ uri: photos[angle]! }} className="w-full h-full object-cover" />
                        <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-md">
                          <Text className="text-zinc-900 dark:text-white text-[8px] font-black uppercase tracking-wider">{angle}</Text>
                        </View>
                      </View>
                    ) : (
                      <View className="items-center">
                        <Ionicons name="camera" size={20} color="#3f3f46" className="mb-1" />
                        <Text className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">{angle} View</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleSaveMeasurement}
              className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 py-3.5 rounded-2xl items-center shadow-lg shadow-emerald-500/10 mt-3"
            >
              <Text className="text-zinc-950 font-black text-xs uppercase tracking-wider">Save Logs</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Chronological Timeline */}
        <View className="mb-12">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-4">Timeline Entries</Text>
          {measurements.length > 0 ? (
            <View className="gap-5">
              {measurements.map((item) => (
                <View
                  key={item.id}
                  className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-3xl p-5"
                >
                  {/* Top row date/delete */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-zinc-900 dark:text-white text-sm font-black tracking-tight">
                      {new Date(item.measurementDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    <Pressable
                      onPress={() => handleDeleteLog(item.id, item.measurementDate)}
                      className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 justify-center items-center"
                    >
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </Pressable>
                  </View>

                  {/* Weight / Metrics Summary */}
                  <View className="flex-row flex-wrap gap-2.5 mb-4">
                    {item.bodyWeight ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">Weight</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.bodyWeight} {settings.weightUnit}</Text>
                      </View>
                    ) : null}

                    {item.chestSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">Chest</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.chestSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}
                    
                    {item.waistSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">Waist</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.waistSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}

                    {item.leftArmSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">L Arm</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.leftArmSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}

                    {item.rightArmSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">R Arm</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.rightArmSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}

                    {item.leftThighSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">L Thigh</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.leftThighSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}

                    {item.rightThighSize ? (
                      <View className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 px-3 py-1.5 rounded-xl">
                        <Text className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">R Thigh</Text>
                        <Text className="text-zinc-900 dark:text-white text-xs font-black">{item.rightThighSize} {settings.lengthUnit}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Physique Images Preview */}
                  {item.photos && (item.photos.front || item.photos.left || item.photos.right || item.photos.back) ? (
                    <View className="flex-row gap-2 mt-1">
                      {Object.entries(item.photos).map(([angle, path]) => {
                        if (!path) return null;
                        return (
                          <View
                            key={angle}
                            className="w-[60px] h-[80px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-xl overflow-hidden"
                          >
                            <Image source={{ uri: path }} className="w-full h-full object-cover" />
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800/60 border-dashed rounded-3xl p-12 justify-center items-center">
              <Ionicons name="scale-outline" size={36} color="#52525b" className="mb-2" />
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center">
                No logs recorded.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
