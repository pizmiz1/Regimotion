import { TextInput, Animated, Text, View, ViewStyle, KeyboardTypeOptions, StyleSheet, StyleProp } from "react-native";
import colors from "../../constants/colors";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  baseBorderColor: string;
  value: string;
  setValue: (val: string) => void;
  style?: StyleProp<ViewStyle>;
  limit?: number;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
  submit?: () => void;
  iconName?: ComponentProps<typeof MaterialIcons>["name"];
  clearable?: boolean;
}

const Input = ({
  label,
  placeholder,
  baseBorderColor,
  value,
  setValue,
  style,
  limit,
  keyboardType,
  disabled,
  submit,
  iconName,
  clearable,
}: InputProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [baseBorderColor, "white"],
  });

  useEffect(() => {
    const toValue = value.length > 0 ? 1 : 0;

    Animated.timing(animatedValue, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={style}>
      <View style={styles.labelContainer}>
        {label && <Text style={styles.labelText}>{label}</Text>}
        {limit && (
          <Text style={{ color: value.length > 0 ? "white" : colors.light_grey }}>
            {value.length}/{limit}
          </Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.inputContainer,
          { height: iconName ? 44 : 40, borderWidth: disabled ? 0 : 1, opacity: disabled ? 0.4 : 1, borderColor: borderColor },
        ]}
      >
        {iconName && <MaterialIcons name={iconName} size={24} color={colors.light_grey} style={{ paddingLeft: 10 }} />}

        <TextInput
          value={value}
          onChangeText={setValue}
          style={styles.input}
          placeholder={placeholder ? placeholder : "Type here"}
          placeholderTextColor="#aaa"
          maxLength={limit}
          keyboardType={keyboardType}
          editable={!disabled}
          submitBehavior="blurAndSubmit"
          onSubmitEditing={submit}
          returnKeyType={submit ? "go" : "default"}
          clearButtonMode={clearable ? "always" : undefined}
        />
      </Animated.View>
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    justifyContent: "space-between",
  },
  labelText: {
    color: "white",
    fontFamily: "Main-Font",
    fontWeight: "500",
    fontSize: 20,
  },
  inputContainer: {
    borderRadius: 7,
    backgroundColor: colors.dark_grey,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: "white",
  },
});
