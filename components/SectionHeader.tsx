import { View, Text } from "react-native";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  rightElement?: ReactNode;
  containerClassName?: string;
  textClassName?: string;
}

export default function SectionHeader({
  title,
  rightElement,
  containerClassName = "mb-3",
  textClassName = "text-muted-foreground text-xs font-semibold uppercase tracking-wider",
}: SectionHeaderProps) {
  if (rightElement) {
    return (
      <View className={`flex-row justify-between items-center ${containerClassName}`}>
        <Text className={textClassName}>{title}</Text>
        {rightElement}
      </View>
    );
  }

  return (
    <View className={containerClassName}>
      <Text className={textClassName}>{title}</Text>
    </View>
  );
}
