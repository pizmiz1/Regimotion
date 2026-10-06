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
      <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", flex: 1 }} onPress={onPress} disabled={isSwitch || touchableDisabled}>
        <View style={{ width: "15%" }}>
          <View
            style={{
              backgroundColor: iconFillColor ? iconFillColor : colors.medium_grey,
              alignItems: "center",
              borderRadius: 5,
              padding: 5,
              alignSelf: "flex-start",
            }}
          >
            <MaterialCommunityIcons name={icon} size={22} color="white" />
          </View>
        </View>
        <View style={{ width: "64%" }}>
          <Text style={{ color: "white", fontSize: 17 }}>{text}</Text>
          {description && <Text style={{ color: colors.light_grey, fontSize: 11 }}>{description}</Text>}
        </View>
        {isSwitch && (
          <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
            <Switch value={switchValue} onValueChange={switchValueChange} disabled={switchDisabled} ios_backgroundColor={colors.light_grey} />
          </View>
        )}
      </TouchableOpacity>
      {!noDivider && <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: colors.medium_grey }} />}
    </>
  );
};

export default Setting;
