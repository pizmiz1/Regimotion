import { ActivityIndicator, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useState } from "react";
import Button from "../shared/button";
import { ExerciseDto } from "../../../shared/moduledto";
import { useGlobalContext } from "../../store/globalContext";
import { opacityLayout } from "../../helpers/layouts";

interface AltModalProps {
  visible: boolean;
  setVisible: (newVisible: boolean) => void;
  moduleId: string;
  exerciseId: string;
  saveFinished: () => void;
}

const AltModal = ({ visible, setVisible, moduleId, exerciseId, saveFinished }: AltModalProps) => {
  const { modules, patchModule } = useGlobalContext();
  const module = modules.find((x) => x.id === moduleId)!;
  const exercise = module.exercises.find((exercise) => exercise.id === exerciseId);

  const [name, setName] = useState(exercise?.altName);
  const [text1, setText1] = useState(exercise?.altText1);
  const [text2, setText2] = useState(exercise?.altText2);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    opacityLayout();
    setSaving(true);

    let updatedExercise = exercise!;
    updatedExercise.altActive = false;
    updatedExercise.altName = name;
    updatedExercise.altText1 = text1;
    updatedExercise.altText2 = text2;

    const index = module.exercises.findIndex((curr) => curr.id === updatedExercise?.id);
    module.exercises[index] = updatedExercise!;

    const success = await patchModule(module);

    if (success) {
      closeModal();
      saveFinished();
    }

    setSaving(false);
  };

  const closeModal = () => {
    setVisible(false);
    if (exercise?.altActive === undefined) {
      setName("");
      setText1("");
      setText2("");
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1, justifyContent: "center", alignItems: "center" }}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View
          style={{
            height: 220,
            width: 250,
            backgroundColor: colors.dark_grey,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 20,
            marginBottom: 100,
            alignItems: "center",
            gap: 30,
          }}
        >
          <Text style={{ color: "white", fontSize: 23, fontWeight: "bold" }}>Alternative Exercise</Text>

          <View style={{ justifyContent: "center", gap: 10, width: "90%" }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{ color: "white", fontWeight: "bold", fontSize: 20, opacity: saving ? 0.6 : 1 }}
              placeholderTextColor={colors.light_grey}
              placeholder="Name..."
              editable={!saving}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={text1}
                onChangeText={setText1}
                style={{ color: colors.lightest_grey, width: "40%", opacity: saving ? 0.6 : 1 }}
                placeholderTextColor={colors.light_grey}
                placeholder="Text..."
                editable={!saving}
              />
              <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border_grey, height: 20, marginHorizontal: 20 }} />
              <TextInput
                value={text2}
                onChangeText={setText2}
                style={{ color: colors.lightest_grey, width: "40%", opacity: saving ? 0.6 : 1 }}
                placeholderTextColor={colors.light_grey}
                placeholder="Optional..."
                editable={!saving}
              />
            </View>
          </View>

          <View style={{ justifyContent: "space-around", flexDirection: "row", width: "100%" }}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.lightest_grey} style={{ marginTop: "3%" }} />
            ) : (
              <>
                <Button label="Close" onPress={closeModal} style={{ backgroundColor: colors.light_grey }} size={100} />
                <Button label="Save" onPress={save} size={100} disabled={name === "" || text1 === ""} />
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default AltModal;
