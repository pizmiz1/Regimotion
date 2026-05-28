import { ActivityIndicator, Animated, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { MaterialIconButton } from "../shared/iconButton";
import { useGlobalContext } from "../../store/globalContext";
import { ExerciseDto } from "../../../shared/moduledto";
import { useRef, useState } from "react";
import Button from "../shared/button";

interface AddExerciseProps {
  moduleId: string;
  done: (add: boolean) => void;
}

const AddExercise = ({ moduleId, done }: AddExerciseProps) => {
  const { modules, patchModule } = useGlobalContext();
  const module = modules.find((x) => x.id === moduleId)!;

  const [name, setName] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [saving, setSaving] = useState(false);

  const text1Ref = useRef<TextInput>(null);

  const savePress = async () => {
    setSaving(true);

    const exercise: ExerciseDto = {
      name: name,
      text1: text1,
      text2: text2,
      completed: false,
    };

    module.exercises.push(exercise);
    module.progress = module.progress - 100 / module.exercises.length;

    const success = await patchModule(module);

    if (success) {
      done(true);
    }

    setSaving(false);
  };

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        <View>
          <View style={{ width: 49, alignItems: "center", zIndex: 0 }}>
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border_grey, height: 40 }} />
          </View>
          <View style={{ position: "absolute", top: 27, zIndex: 1 }}>
            <View
              style={{
                marginLeft: 10,
                width: 30,
                height: 30,
                borderRadius: 300,
                borderWidth: 3,
                borderColor: colors.border_grey,
                backgroundColor: colors.secondary,
                flex: 1,
              }}
            />
          </View>
          <View style={{ width: 49, alignItems: "center", zIndex: 0, opacity: 0 }}>
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border_grey, height: 40 }} />
          </View>
        </View>
        <View style={{ justifyContent: "center", flex: 1, gap: 7, marginLeft: 15 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
            placeholderTextColor="#6b6b6b"
            placeholder="Name..."
            editable={!saving}
            autoFocus={true}
            returnKeyType="next"
            submitBehavior={text1.length === 0 ? "submit" : "blurAndSubmit"}
            onSubmitEditing={() => {
              if (text1.length === 0) {
                text1Ref.current?.focus();
              }
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              ref={text1Ref}
              value={text1}
              onChangeText={setText1}
              style={{ color: colors.lightest_grey, width: "40%" }}
              placeholderTextColor="#6b6b6b"
              placeholder="Text..."
              editable={!saving}
              returnKeyType="go"
              onSubmitEditing={savePress}
              enablesReturnKeyAutomatically={true}
            />
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border_grey, height: 20, marginHorizontal: 20 }} />
            <TextInput
              value={text2}
              onChangeText={setText2}
              style={{ color: colors.lightest_grey, width: "40%" }}
              placeholderTextColor="#6b6b6b"
              placeholder="Optional..."
              editable={!saving}
              returnKeyType="go"
              submitBehavior={text1.length === 0 || name.length === 0 ? "submit" : "blurAndSubmit"}
              onSubmitEditing={() => {
                if (text1.length > 0 && name.length > 0) {
                  savePress();
                }
              }}
            />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
        {saving ? (
          <ActivityIndicator size="large" color={colors.lightest_grey} />
        ) : (
          <>
            <Button
              label="Cancel"
              onPress={() => {
                done(false);
              }}
              style={{ backgroundColor: colors.dark_grey }}
              size={120}
            />
            <Button label="Save" onPress={savePress} size={120} disabled={name.length === 0 || text1.length === 0} />
          </>
        )}
      </View>
    </>
  );
};

export default AddExercise;
