import { Text, View, Pressable } from "react-native";
import { Redirect, useRouter, Href } from "expo-router";
import { useUserStore } from "../store/userStore";
import { useEffect, useState } from "react";

// A small array of gym motivation quotes to display on wake up
const QUOTES = [
  { text: "Heavier today, stronger tomorrow.", author: "Heavier" },
  { text: "The only bad workout is the one that didn't happen.", author: "Kai Greene" },
  { text: "No citizen has a right to be an amateur in the matter of physical training...", author: "Socrates" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "Discipline is doing what needs to be done even if you don't want to.", author: "Unknown" },
];

export default function Index() {
  const { hasOnboarded } = useUserStore();
  const router = useRouter();
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    // Loop through different quotes each time user opens the app
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  if (hasOnboarded) {
    return <Redirect href={"/(tabs)/dashboard" as Href} />;
  }

  return (
    <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      {/* Decorative background glow */}
      <View className="absolute top-24 -left-12 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-10" />
      <View className="absolute bottom-24 -right-12 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-10" />

      <View className="items-center z-10 w-full max-w-sm">
        <Text className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
          HEAVIER
        </Text>
        <Text className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-12">
          Gym Progress Tracker
        </Text>

        {/* Motivational Quote Section */}
        <View className="bg-white dark:bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-800 rounded-2xl p-6 mb-12 w-full">
          <Text className="text-zinc-800 dark:text-zinc-300 text-base italic text-center leading-relaxed">
            “{quote.text}”
          </Text>
          <Text className="text-zinc-500 text-xs font-semibold text-right mt-3 uppercase tracking-wider">
            — {quote.author}
          </Text>
        </View>

        <Text className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm text-center font-medium max-w-xs mb-10 leading-relaxed">
          Your offline-first, local-only companion for tracking workouts, measurements, and physique progress.
        </Text>

        <Pressable 
          onPress={() => router.push("/onboarding" as Href)}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all w-full items-center"
        >
          <Text className="text-zinc-950 font-bold text-base tracking-tight">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


