import { Keyboard, Modal, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { ModuleDto } from "../../../shared/moduledto";
import { MaterialIconButton } from "../shared/IconButton";
import colors from "../../constants/colors";
import { useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import Button from "../shared/Button";
import { useGlobalContext } from "../../store/GlobalContext";
import { JsonDto } from "../../../shared/jsondto";
import { get } from "../../helpers/fetch";
import { errorAlert } from "../../helpers/alert";

interface Text2ModalProps {
  visible: boolean;
  setVisible: (newVisible: boolean) => void;
  moduleId: string;
  exerciseId: string;
  onText2EditSave: () => void;
}

const Text2Modal = ({ visible, setVisible, moduleId, exerciseId, onText2EditSave }: Text2ModalProps) => {
  const { modules, patchModule, updateModules, accessToken, updateAccessToken } = useGlobalContext();
  const module = modules.find((x) => x.id === moduleId)!;
  const exercise = module.exercises.find((exercise) => exercise.id === exerciseId)!;

  const [text, setText] = useState(exercise.text2 ? exercise.text2 : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    let newExercise = exercise!;
    newExercise.text2 = text;

    const index = module.exercises.findIndex((curr) => curr.id === exercise.id);
    module.exercises[index] = newExercise;

    const success = await patchModule(module);

    if (success) {
      const linkedModule = module.exercises.some((curr) => curr.linkId !== undefined);

      if (linkedModule) {
        const responseModule: JsonDto<ModuleDto[]> = await get("/module", { accessToken: accessToken, updateAccessToken: updateAccessToken });
        if (responseModule.error) {
          errorAlert(responseModule.error);
          return;
        }

        updateModules(responseModule.data!);
      }

      onText2EditSave();
      closeModal();
    } else {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setSaving(false);
    setVisible(false);
  };

  useEffect(() => {
    setText(exercise.text2 ?? "");
  }, [exercise.text2]);

  return (
    <Modal animationType="fade" visible={visible} transparent={true}>
      <TouchableWithoutFeedback onPressOut={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={styles.content}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", alignItems: "center" }}>
              <MaterialIconButton
                name="close"
                color={colors.light_grey}
                size={24}
                onPress={closeModal}
                style={[styles.headerBtn, { opacity: 0 }]}
                disabled={true}
              />
              <Text style={{ color: "white", fontFamily: "Main-Font", fontWeight: "bold", fontSize: 20 }}>{exercise.name}</Text>
              <MaterialIconButton
                name="close"
                color={colors.light_grey}
                size={24}
                onPress={closeModal}
                style={[styles.headerBtn, { opacity: saving ? 0.4 : 1 }]}
                disabled={saving}
              />
            </View>

            <TextInput
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              style={{ color: "white", width: "90%", height: 160, marginTop: 10 }}
              multiline={true}
            />

            <View style={styles.btnContainer}>
              <Button
                label="Reset"
                onPress={() => {
                  setText("");
                }}
                disabled={saving || text.length === 0}
                style={styles.btn}
                size={100}
              />
              <Button label={saving ? "Saving..." : "Save"} onPress={save} disabled={saving} size={100} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Text2Modal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: "#191d26",
    borderRadius: 20,
    alignItems: "center",
    height: 280,
    width: "70%",
    marginBottom: 200,
    paddingTop: 5,
  },
  headerBtn: {
    alignSelf: "flex-end",
    paddingVertical: "3%",
    paddingHorizontal: "1%",
  },
  btnContainer: {
    marginTop: 20,
    justifyContent: "space-evenly",
    flexDirection: "row",
    width: "100%",
  },
  btn: {
    backgroundColor: colors.dark_grey,
  },
});
