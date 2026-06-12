import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Href } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const setOnboarded = useUserStore((state) => state.setOnboarded);
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");

  const handleOnboardingComplete = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError("Please enter a valid age");
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      setError("Please enter a valid height");
      return;
    }
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    try {
      await setOnboarded({
        name: name.trim(),
        age: ageNum,
        gender,
        height: heightNum,
      });

      // Insert an initial weight measurement row into measurements table if needed, or handle it during dashboard loading.
      // But we can let them log measurements normally. The store will handle it.
      
      router.replace("/(tabs)/dashboard" as Href);
    } catch (e) {
      setError("An error occurred during onboarding.");
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
          <View className="flex-1 justify-center max-w-sm mx-auto w-full">
            <View className="mb-8">
              <Text className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Profile Setup
              </Text>
              <Text className="text-zinc-500 text-sm mt-1">
                Tell us about yourself to customize your experience.
              </Text>
            </View>

            {error ? (
              <View className="bg-destructive/15 border border-destructive/20 rounded-xl p-3 mb-6">
                <Text className="text-destructive text-sm text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="gap-5">
              {/* Name Input */}
              <View>
                <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setError("");
                  }}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#52525b"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
                />
              </View>

              {/* Age & Gender Row */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Age
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={(val) => {
                      setAge(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 25"
                    placeholderTextColor="#52525b"
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Gender
                  </Text>
                  <View className="flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-xl overflow-hidden h-[48px]">
                    <Pressable
                      onPress={() => setGender("male")}
                      className={`flex-1 justify-center items-center ${
                        gender === "male" ? "bg-emerald-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          gender === "male" ? "text-zinc-950" : "text-zinc-600 dark:text-zinc-400 dark:text-zinc-400"
                        }`}
                      >
                        Male
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setGender("female")}
                      className={`flex-1 justify-center items-center ${
                        gender === "female" ? "bg-emerald-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          gender === "female" ? "text-zinc-950" : "text-zinc-600 dark:text-zinc-400 dark:text-zinc-400"
                        }`}
                      >
                        Female
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Height & Weight Row */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Height (cm)
                  </Text>
                  <TextInput
                    value={height}
                    onChangeText={(val) => {
                      setHeight(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 175"
                    placeholderTextColor="#52525b"
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Weight (kg)
                  </Text>
                  <TextInput
                    value={weight}
                    onChangeText={(val) => {
                      setWeight(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 70"
                    placeholderTextColor="#52525b"
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleOnboardingComplete}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-6 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/20 mt-4 transition-all"
              >
                <Text className="text-zinc-950 font-bold text-base">
                  Save & Continue
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
