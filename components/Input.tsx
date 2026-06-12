import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  variant?: "default" | "dense";
  className?: string;
}

export default function Input({ variant = "default", className = "", ...props }: InputProps) {
  const baseStyle = variant === "dense"
    ? "bg-card border border-border text-foreground px-3 py-2 rounded-xl text-center font-bold text-xs focus:border-accent"
    : "bg-card border border-border text-foreground px-4 py-3 rounded-xl focus:border-accent font-medium";

  return (
    <TextInput
      className={`${baseStyle} ${className}`}
      placeholderTextColor="#71717a"
      {...props}
    />
  );
}
