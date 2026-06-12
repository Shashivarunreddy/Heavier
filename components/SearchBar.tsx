import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerClassName?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  containerClassName = "",
}: SearchBarProps) {
  return (
    <View className={`flex-row bg-card border border-border rounded-xl px-4 py-2.5 items-center ${containerClassName}`}>
      <Ionicons name="search" size={16} color="#71717a" className="mr-2" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        className="text-foreground flex-grow p-0 m-0 font-medium"
      />
    </View>
  );
}
