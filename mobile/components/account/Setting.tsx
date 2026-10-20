import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import colors from "../../constants/colors";

interface SettingsProps {
  isSwitch: boolean;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  text: string;
  description?: string;
  iconFillColor?: string;
  switchValue?: boolean;
  switchValueChange?: ((value: boolean) => void | Promise<void>) | null | undefined;
  switchDisabled?: boolean;
  onPress?: () => void;
  touchableDisabled?: boolean;
  noDivider?: boolean;
}

const Setting = ({
  isSwitch,
  icon,
  text,
  description,
  iconFillColor,
  switchValue,
  switchValueChange,
  switchDisabled,
  onPress,
  touchableDisabled,
  noDivider,
}: SettingsProps) => {
  return (
    <>
      <TouchableOpacity style={styles.content} onPress={onPress} disabled={isSwitch || touchableDisabled}>
        <View style={styles.iconContainer}>
          <View style={[styles.icon, { backgroundColor: iconFillColor ? iconFillColor : colors.medium_grey }]}>
            <MaterialCommunityIcons name={icon} size={22} color="white" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.labelText}>{text}</Text>
          {description && <Text style={styles.descriptionText}>{description}</Text>}
        </View>
        {isSwitch && (
          <View style={styles.switchContainer}>
            <Switch value={switchValue} onValueChange={switchValueChange} disabled={switchDisabled} ios_backgroundColor={colors.light_grey} />
          </View>
        )}
      </TouchableOpacity>
      {!noDivider && <View style={styles.divider} />}
    </>
  );
};

export default Setting;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: "15%",
  },
  icon: {
    alignItems: "center",
    borderRadius: 5,
    padding: 5,
    alignSelf: "flex-start",
  },
  textContainer: {
    width: "64%",
  },
  labelText: {
    color: "white",
    fontSize: 17,
  },
  descriptionText: {
    color: colors.light_grey,
    fontSize: 11,
  },
  switchContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: colors.medium_grey,
    width: "100%",
  },
});
