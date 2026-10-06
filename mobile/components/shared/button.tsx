import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import colors from "../../constants/colors";

interface ButtonProps {
  style?: ViewStyle;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}

const Button = ({ style, label, onPress, color = colors.primary, size, disabled = false }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.btn, size !== undefined && { width: size, height: size / 2.9 }, { backgroundColor: color, opacity: disabled ? 0.4 : 1 }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    width: 150,
    height: 150 / 2.9,
    borderRadius: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontWeight: "bold",
    color: "white",
  },
});
