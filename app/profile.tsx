import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const { profile, updateProfile } = useUserStore();
  const router = useRouter();

  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [height, setHeight] = useState(profile?.height?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "male");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      setSuccess(false);
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError("Please enter a valid age");
      setSuccess(false);
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      setError("Please enter a valid height");
      setSuccess(false);
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        age: ageNum,
        gender,
        height: heightNum,
      });

      setSuccess(true);
      setError("");
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (e) {
      setError("Failed to update profile info.");
      setSuccess(false);
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-4">
          
          {/* Header Row */}
          <View className="flex-row justify-between items-center mb-8">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 justify-center items-center active:scale-95 transition-all"
            >
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </Pressable>
            <Text className="text-zinc-900 dark:text-white text-lg font-black tracking-tight">Edit Profile</Text>
            <View className="w-10 h-10" /> {/* Spacer */}
          </View>

          <View className="flex-1 max-w-sm mx-auto w-full justify-center">
            {error ? (
              <View className="bg-destructive/15 border border-destructive/20 rounded-xl p-3 mb-6">
                <Text className="text-destructive text-sm text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            {success ? (
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6">
                <Text className="text-emerald-400 text-sm text-center font-bold">
                  Profile updated successfully!
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
                  placeholder="John Doe"
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
                    placeholder="25"
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

              {/* Height Input */}
              <View>
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
                  placeholder="175"
                  placeholderTextColor="#52525b"
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-xl focus:border-emerald-500 font-medium"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSave}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-6 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/20 mt-4 transition-all"
              >
                <Text className="text-zinc-950 font-bold text-base">
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
