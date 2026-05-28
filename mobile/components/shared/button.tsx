import { Text, TouchableOpacity, ViewStyle } from "react-native";
import colors from "../../constants/colors";

interface ButtonProps {
  style?: ViewStyle;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}

const Button = ({ style, label, onPress, color = colors.primary, size = 150, disabled = false }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: color,
        width: size,
        height: size / 2.9,
        borderRadius: 200,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={{ fontWeight: "bold", color: "white" }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;
