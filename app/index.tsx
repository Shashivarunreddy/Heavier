import { Text, View, Pressable } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-zinc-950 px-6 py-12">
      {/* Decorative background glow */}
      <View className="absolute top-24 -left-12 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20" />
      <View className="absolute bottom-24 -right-12 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-20" />

      <View className="items-center z-10">
        <Text className="text-5xl font-black text-white tracking-tighter mb-1">
          HEAVIER
        </Text>
        <Text className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-6">
          Gym Progress Tracker
        </Text>

        <Text className="text-zinc-400 text-base text-center font-medium max-w-xs mb-10 leading-relaxed">
          Your offline-first, local-only companion for tracking workouts, measurements, and physique progress.
        </Text>

        <Pressable className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all">
          <Text className="text-zinc-950 font-bold text-base tracking-tight">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

