import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  containerClassName?: string;
  titleClassName?: string;
  iconSize?: number;
}

export default function EmptyState({
  iconName,
  title,
  description,
  containerClassName = "bg-card dark:bg-muted/10 border border-border border-dashed rounded-3xl justify-center items-center p-12 mt-8",
  titleClassName = "text-muted-foreground text-sm font-bold text-center",
  iconSize = 42,
}: EmptyStateProps) {
  const { isDarkColorScheme } = useColorScheme();
  const mutedIconColor = isDarkColorScheme ? "#a1a1aa" : "#71717a";

  return (
    <View className={containerClassName}>
      {iconName && (
        <Ionicons name={iconName} size={iconSize} color={mutedIconColor} className="mb-2" />
      )}
      <Text className={titleClassName}>{title}</Text>
      {description && (
        <Text className="text-muted-foreground text-xs text-center mt-1">
          {description}
        </Text>
      )}
    </View>
  );
}
