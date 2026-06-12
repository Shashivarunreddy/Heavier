import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import Input from "../components/Input";

export default function Profile() {
  const { profile, updateProfile } = useUserStore();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [height, setHeight] = useState(profile?.height?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "male");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const iconColor = isDarkColorScheme ? "#ffffff" : "#18181b";

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-4">
          
          {/* Header Row */}
          <View className="flex-row justify-between items-center mb-8">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-card border border-border justify-center items-center active:scale-95 transition-all"
            >
              <Ionicons name="chevron-back" size={20} color={iconColor} />
            </Pressable>
            <Text className="text-foreground text-lg font-black tracking-tight">Edit Profile</Text>
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
              <View className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6">
                <Text className="text-accent text-sm text-center font-bold">
                  Profile updated successfully!
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
                  placeholder="John Doe"
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
                    placeholder="25"
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

              {/* Height Input */}
              <View>
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
                  placeholder="175"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSave}
                className="bg-accent hover:bg-accent/90 active:scale-95 px-6 py-4 rounded-xl items-center shadow-lg shadow-accent/20 mt-4 transition-all"
              >
                <Text className="text-accent-foreground font-bold text-base">
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
