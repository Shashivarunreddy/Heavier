import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Href } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../components/Input";

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
          <View className="flex-1 justify-center max-w-sm mx-auto w-full">
            <View className="mb-8">
              <Text className="text-3xl font-black text-foreground tracking-tight">
                Profile Setup
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
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
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                  Full Name
                </Text>
                <Input
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setError("");
                  }}
                  placeholder="e.g. John Doe"
                />
              </View>

              {/* Age & Gender Row */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                    Age
                  </Text>
                  <Input
                    value={age}
                    onChangeText={(val) => {
                      setAge(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 25"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                    Gender
                  </Text>
                  <View className="flex-row bg-card border border-border rounded-xl overflow-hidden h-[48px]">
                    <Pressable
                      onPress={() => setGender("male")}
                      className={`flex-1 justify-center items-center ${
                        gender === "male" ? "bg-accent" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          gender === "male" ? "text-accent-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Male
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setGender("female")}
                      className={`flex-1 justify-center items-center ${
                        gender === "female" ? "bg-accent" : ""
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          gender === "female" ? "text-accent-foreground" : "text-muted-foreground"
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
                  <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                    Height (cm)
                  </Text>
                  <Input
                    value={height}
                    onChangeText={(val) => {
                      setHeight(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 175"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                    Weight (kg)
                  </Text>
                  <Input
                    value={weight}
                    onChangeText={(val) => {
                      setWeight(val);
                      setError("");
                    }}
                    keyboardType="numeric"
                    placeholder="e.g. 70"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleOnboardingComplete}
                className="bg-accent hover:bg-accent/90 active:scale-95 px-6 py-4 rounded-xl items-center shadow-lg shadow-accent/20 mt-4 transition-all"
              >
                <Text className="text-accent-foreground font-bold text-base">
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
