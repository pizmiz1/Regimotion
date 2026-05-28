import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Animated, TouchableOpacity, ViewStyle } from "react-native";

interface MaterialIconButtonProps {
  name: ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  size: number;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const MaterialIconButton = ({ name, color, size, onPress, style, disabled }: MaterialIconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ ...style }} disabled={disabled}>
      <MaterialIcons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
};

interface EntypoIconButtonProps {
  name: ComponentProps<typeof Entypo>["name"];
  color: string;
  size: number;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const EntypoIconButton = ({ name, color, size, onPress, style, disabled }: EntypoIconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ ...style }} disabled={disabled}>
      <Entypo name={name} size={size} color={color} />
    </TouchableOpacity>
  );
};
