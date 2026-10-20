import { ActivityIndicator, Animated, StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import { useGlobalContext } from "../../store/GlobalContext";
import { useRef, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { opacityLayout } from "../../helpers/layouts";

// Custom Components
import { MaterialIconButton } from "../shared/IconButton";
import AltModal from "./AltModal";

interface ExerciseProps {
  exerciseId: string;
  moduleId: string;
  viewOpacity: Animated.Value;
  circleOpacity: Animated.Value;
  last: boolean;
  hideActive: Animated.Value;
  active: boolean;
  deleteCallback: (index: number) => void;
}

const Exercise = ({ exerciseId, moduleId, viewOpacity, circleOpacity, last, hideActive, active, deleteCallback }: ExerciseProps) => {
  const { modules, patchModule } = useGlobalContext();
  const module = modules.find((x) => x.id === moduleId)!;
  const exercise = module.exercises.find((exercise) => exercise.id === exerciseId);

  const [altModalVisible, setAltModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(exercise?.name);
  const [text1, setText1] = useState(exercise?.text1);
  const [text2, setText2] = useState(exercise?.text2);
  const [swiped, setSwiped] = useState(false);

  const swipeableRef = useRef<Swipeable>(null);
  const text1Ref = useRef<TextInput>(null);

  const deleteExercise = async () => {
    setSaving(true);

    const oldIndex = module.exercises.findIndex((curr) => curr.id === exerciseId);
    module.exercises = module.exercises.filter((curr) => curr.id !== exerciseId);
    module.progress = module.progress - 100 / module.exercises.length;

    const success = await patchModule(module);

    if (success) {
      deleteCallback(oldIndex);
    }

    setSaving(false);
  };

  const updateExercise = async () => {
    setSaving(true);

    let newExercise = exercise!;
    newExercise.name = name!;
    newExercise.text1 = text1!;
    newExercise.text2 = text2;

    const index = module.exercises.findIndex((curr) => curr.id === exercise?.id);
    module.exercises[index] = newExercise;

    const success = await patchModule(module);

    setSaving(false);

    if (success) {
      if (active) {
        Animated.timing(hideActive, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }
      setEditing(false);
    }
  };

  const RightAction = (progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.actionContainer, { opacity: progress, transform: [{ translateX }] }]}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.lightest_grey} />
        ) : (
          <>
            {editing ? (
              <></>
            ) : (
              <>
                <MaterialIconButton
                  name={exercise?.altName ? "do-not-disturb-on-total-silence" : "radio-button-unchecked"}
                  color={colors.light_primary}
                  size={34}
                  onPress={() => {
                    setAltModalVisible(true);
                  }}
                  style={styles.actionBtn}
                />
                <MaterialIconButton
                  name="edit"
                  color={colors.light_primary}
                  size={34}
                  onPress={() => {
                    opacityLayout();
                    setEditing(true);
                    swipeableRef.current!.close();
                  }}
                  style={styles.actionBtn}
                />
                <MaterialIconButton name="delete" color={colors.warning} size={34} onPress={deleteExercise} style={styles.actionBtn} />
              </>
            )}
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={RightAction}
      friction={2}
      onSwipeableOpenStartDrag={() => {
        opacityLayout();
        setSwiped(true);
        if (active) {
          Animated.timing(hideActive, {
            toValue: 0.5,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
      }}
      onSwipeableClose={() => {
        setSwiped(false);
        if (active && !editing) {
          Animated.timing(hideActive, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
      }}
      enabled={!saving && !editing}
    >
      <AltModal
        visible={altModalVisible}
        setVisible={setAltModalVisible}
        moduleId={moduleId}
        exerciseId={exerciseId}
        saveFinished={() => {
          swipeableRef.current!.close();
        }}
      />
      <Animated.View style={[styles.content, { opacity: viewOpacity }]}>
        <View>
          <View style={styles.topDividerContainer}>
            <View style={styles.divider} />
          </View>
          <Animated.View style={[styles.completeCircleContainer, { opacity: circleOpacity }]}>
            <MaterialIconButton name="circle" color={"white"} size={30} onPress={() => {}} style={styles.completeCircle} disabled={true} />
          </Animated.View>
          <View style={[styles.bottomDividerContainer, { opacity: last ? 0 : 1 }]}>
            <View style={styles.divider} />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.nameText}
                placeholderTextColor="#6b6b6b"
                placeholder="Name..."
                editable={!saving}
                autoFocus={true}
                returnKeyType="next"
                submitBehavior={text1!.length === 0 ? "submit" : "blurAndSubmit"}
                onSubmitEditing={() => {
                  if (text1!.length === 0) {
                    text1Ref.current?.focus();
                  }
                }}
              />
            ) : (
              <Text style={styles.nameText} numberOfLines={1}>
                {exercise?.altActive ? exercise.altName : exercise?.name}
              </Text>
            )}
            <View style={styles.descriptionsContainer}>
              {editing ? (
                <TextInput
                  ref={text1Ref}
                  value={text1}
                  onChangeText={setText1}
                  style={styles.text1Text}
                  placeholderTextColor="#6b6b6b"
                  placeholder="Text..."
                  editable={!saving}
                  returnKeyType="go"
                  onSubmitEditing={updateExercise}
                  enablesReturnKeyAutomatically={true}
                />
              ) : (
                <Text style={styles.text1Text} numberOfLines={1}>
                  {exercise?.altActive ? exercise.altText1 : exercise?.text1}
                </Text>
              )}
              <View style={[styles.descriptionDivider, { opacity: exercise?.text2 || editing ? 1 : 0 }]} />
              {editing ? (
                <>
                  <TextInput
                    value={text2}
                    onChangeText={setText2}
                    style={styles.text2Input}
                    placeholderTextColor="#6b6b6b"
                    placeholder="Optional..."
                    editable={!saving}
                    returnKeyType="go"
                    submitBehavior={text1?.length === 0 || name?.length === 0 ? "submit" : "blurAndSubmit"}
                    onSubmitEditing={() => {
                      if (text1!.length > 0 && name!.length > 0) {
                        updateExercise();
                      }
                    }}
                  />
                </>
              ) : (
                exercise?.text2 && (
                  <>
                    <Text style={styles.text1Text} numberOfLines={1}>
                      {exercise.altActive ? exercise.altText2 : exercise.text2}
                    </Text>
                  </>
                )
              )}
            </View>
          </View>

          <View style={[styles.altContainer, { opacity: !swiped && exercise?.altActive === true && !editing ? 1 : 0 }]}>
            <Text style={styles.altText}>Alt</Text>
          </View>
        </View>

        {editing && (
          <View style={styles.btnContainer}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.lightest_grey} />
            ) : (
              <MaterialIconButton
                name="check"
                color={colors.primary}
                size={30}
                onPress={updateExercise}
                style={{ opacity: name?.length === 0 || text1?.length === 0 ? 0.4 : 1 }}
                disabled={name?.length === 0 || text1?.length === 0}
              />
            )}
          </View>
        )}
      </Animated.View>
    </Swipeable>
  );
};

export default Exercise;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    overflow: "hidden",
  },
  topDividerContainer: {
    width: 49,
    alignItems: "center",
    zIndex: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border_grey,
    height: 40,
  },
  completeCircleContainer: {
    position: "absolute",
    top: 27,
    zIndex: 1,
  },
  completeCircle: {
    paddingHorizontal: 10,
    width: 50,
  },
  bottomDividerContainer: {
    width: 49,
    alignItems: "center",
    zIndex: 0,
  },
  infoContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
    gap: 7,
    marginLeft: 15,
  },
  nameText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  descriptionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text1Text: {
    color: colors.lightest_grey,
    width: "40%",
  },
  descriptionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border_grey,
    height: 20,
    marginHorizontal: 20,
  },
  text2Input: {
    color: colors.lightest_grey,
    width: "30%",
  },
  altContainer: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    marginTop: 5,
    backgroundColor: colors.primary,
  },
  altText: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  btnContainer: {
    position: "absolute",
    right: 0,
    top: 30,
  },
  actionContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 10,
    width: 140,
  },
  actionBtn: {
    padding: "1%",
  },
});
