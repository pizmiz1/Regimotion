import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useGlobalContext } from "../../store/GlobalContext";
import { ExerciseDto } from "../../../shared/moduledto";
import { useRef, useState } from "react";

// Custom Components
import Button from "../shared/Button";

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
      <View style={styles.inputContainer}>
        <View>
          <View style={styles.topDivider}>
            <View style={styles.divider} />
          </View>
          <View style={styles.activeCircleContainer}>
            <View style={styles.activeCircle} />
          </View>
          <View style={styles.invisTopDivider}>
            <View style={styles.divider} />
          </View>
        </View>
        <View style={styles.inputsContainer}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
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
          <View style={styles.descriptionsInputContainer}>
            <TextInput
              ref={text1Ref}
              value={text1}
              onChangeText={setText1}
              style={styles.descriptionInput}
              placeholderTextColor="#6b6b6b"
              placeholder="Text..."
              editable={!saving}
              returnKeyType="go"
              onSubmitEditing={savePress}
              enablesReturnKeyAutomatically={true}
            />
            <View style={styles.descriptionDivider} />
            <TextInput
              value={text2}
              onChangeText={setText2}
              style={styles.descriptionInput}
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
      <View style={styles.btnContainer}>
        {saving ? (
          <ActivityIndicator size="large" color={colors.lightest_grey} />
        ) : (
          <>
            <Button
              label="Cancel"
              onPress={() => {
                done(false);
              }}
              style={styles.btn}
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

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
  },
  topDivider: {
    width: 49,
    alignItems: "center",
    zIndex: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border_grey,
    height: 40,
  },
  activeCircleContainer: {
    position: "absolute",
    top: 27,
    zIndex: 1,
  },
  activeCircle: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 300,
    borderWidth: 3,
    borderColor: colors.border_grey,
    backgroundColor: colors.secondary,
    flex: 1,
  },
  invisTopDivider: {
    width: 49,
    alignItems: "center",
    zIndex: 0,
    opacity: 0,
  },
  inputsContainer: {
    justifyContent: "center",
    flex: 1,
    gap: 7,
    marginLeft: 15,
  },
  nameInput: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  descriptionsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  descriptionInput: {
    color: colors.lightest_grey,
    width: "40%",
  },
  descriptionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border_grey,
    height: 20,
    marginHorizontal: 20,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  btn: {
    backgroundColor: colors.dark_grey,
  },
});
