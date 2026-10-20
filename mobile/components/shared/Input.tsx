import { TextInput, Animated, Text, View, ViewStyle, KeyboardTypeOptions, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import { useEffect, useRef, useState } from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  baseBorderColor: string;
  onChangeText: (val: string) => void;
  style?: ViewStyle;
  reset: boolean;
  limit?: number;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
  startVal?: string;
  submit?: () => void;
}

const Input = ({ label, placeholder, baseBorderColor, onChangeText, style, reset, limit, keyboardType, disabled, startVal, submit }: InputProps) => {
  const [text, setText] = useState("");

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setText("");
  }, [reset]);

  useEffect(() => {
    if (!startVal) {
      return;
    }

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setText(startVal);
  }, [startVal]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [baseBorderColor, "white"],
  });

  const onChangeTextLocal = (newText: string) => {
    // @ts-ignore
    if (newText.length > 0 && animatedValue.__getValue() === 0) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      // @ts-ignore
    } else if (newText.length === 0 && animatedValue.__getValue() === 1) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    setText(newText);
    onChangeText(newText);
  };

  return (
    <View style={style}>
      <View style={styles.labelContainer}>
        {label && <Text style={styles.labelText}>{label}</Text>}
        {limit && (
          <Text style={{ color: text.length > 0 ? "white" : colors.light_grey }}>
            {text.length}/{limit}
          </Text>
        )}
      </View>
      <Animated.View style={[styles.inputContainer, { borderWidth: disabled ? 0 : 1, opacity: disabled ? 0.4 : 1, borderColor: borderColor }]}>
        <TextInput
          value={text}
          onChangeText={onChangeTextLocal}
          style={styles.input}
          placeholder={placeholder ? placeholder : "Type here"}
          placeholderTextColor="#aaa"
          maxLength={limit}
          keyboardType={keyboardType}
          editable={!disabled}
          submitBehavior="blurAndSubmit"
          onSubmitEditing={submit}
          returnKeyType={submit ? "go" : "default"}
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
  },
  input: {
    height: 40,
    padding: 10,
    borderRadius: 7,
    color: "white",
    backgroundColor: colors.dark_grey,
  },
});
