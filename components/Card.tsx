import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <View className={`bg-card border border-border rounded-3xl p-5 ${className}`} {...props}>
      {children}
    </View>
  );
}
