import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGlobalContext } from "../store/GlobalContext";
import LottieView from "lottie-react-native";
import { opacityLayout, scaleYLayout } from "../helpers/layouts";
import { NestableDraggableFlatList } from "react-native-draggable-flatlist";
import { ScrollView } from "react-native-gesture-handler";

// Custom Components
import { MaterialIconButton } from "../components/shared/IconButton";
import PageContainer from "../components/shared/PageContainer";
import DetailsModal from "../components/shared/DetailsModal";
import Exercise from "../components/moduleDetail/Exercise";
import AddExercise from "../components/moduleDetail/AddExercise";
import ReorderExercise from "../components/moduleDetail/ReorderExercise";

const ModuleDetailScreen = () => {
  const route = useRoute();
  // @ts-ignore
  const { moduleId }: { moduleId: string } = route.params;

  const { modules, patchModule, userSettings } = useGlobalContext();
  const module = modules.find((x) => x.id === moduleId)!;

  if (!module) {
    return (
      <PageContainer header="Deleted..." setBlurActive={() => {}}>
        <></>
      </PageContainer>
    );
  }

  const [blurActive, setBlurActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [disableScroll, setDisableScroll] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteTrigger, setDeleteTrigger] = useState(false);
  const [exerciseActive, setExerciseActive] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderExercises, setReorderExercises] = useState(module.exercises);
  const [saving, setSaving] = useState(false);

  const activeIndex = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const lottieAnimRef = useRef<LottieView>(null);
  const firstRender = useRef(true);
  const moveAnim = useRef(new Animated.Value(0)).current;
  const doneAnim = useRef(new Animated.Value(0)).current;
  const lottieAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(1)).current;
  const viewOpacities = useRef(module.exercises.map((curr) => new Animated.Value(curr.completed ? 0.4 : 1))).current;
  const circleOpacities = useRef(module.exercises.map((curr) => new Animated.Value(curr.completed ? 1 : 0))).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const reorderHideOpacity = useRef(new Animated.Value(0)).current;
  const restartCancelButtonOpacity = useRef(new Animated.Value(0)).current;
  const finishSaveButtonOpacity = useRef(new Animated.Value(0)).current;
  const moveScale = doneAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 4],
  });
  const moveOpacity = doneAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const borderColor = borderAnim.interpolate({
    inputRange: [0.2, 1],
    outputRange: ["rgba(255, 255, 255, .2)", colors.border_grey],
  });

  const navigation = useNavigation();

  const setMarkerStates = () => {
    const index = module.exercises.findIndex((item) => !item.completed);
    const finished = index === -1;

    const indexToSet = finished ? module.exercises.length : index;

    activeIndex.current = indexToSet;

    if (firstRender.current) {
      moveAnim.setValue(indexToSet * 80);
      doneAnim.setValue(finished || !exerciseActive ? 1 : 0);
      firstRender.current = false;
    } else {
      Animated.parallel([
        Animated.spring(moveAnim, {
          toValue: indexToSet * 80,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(doneAnim, {
          toValue: finished || !exerciseActive ? 1 : 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    switch (today) {
      case "Monday":
        setExerciseActive(module.days.mon);
        break;
      case "Tuesday":
        setExerciseActive(module.days.tues);
        break;
      case "Wednesday":
        setExerciseActive(module.days.wed);
        break;
      case "Thursday":
        setExerciseActive(module.days.thur);
        break;
      case "Friday":
        setExerciseActive(module.days.fri);
        break;
      case "Saturday":
        setExerciseActive(module.days.sat);
        break;
      case "Sunday":
        setExerciseActive(module.days.sun);
        break;
      default:
        break;
    }

    setReorderExercises(module.exercises);
    setMarkerStates();
  }, [module.exercises.length, module]);

  useEffect(() => {
    setMarkerStates();
  }, [exerciseActive]);

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: blurActive ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [blurActive]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(reorderHideOpacity, {
        toValue: reordering ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(restartCancelButtonOpacity, {
        toValue: reordering || (!adding && !(module.progress === 0) && exerciseActive) ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(finishSaveButtonOpacity, {
        toValue: reordering || (!adding && !(module.progress === 100) && !(module.exercises.length === 0) && exerciseActive) ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reordering, adding, module, exerciseActive]);

  const animateAll = (disable: boolean, refresh: boolean, finish: boolean) => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(borderAnim, {
        toValue: disable ? 0.2 : 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ];

    module.exercises.forEach((curr, index) => {
      if (disable) {
        animations.push(
          Animated.timing(viewOpacities[index], {
            toValue: 0.2,
            duration: 400,
            useNativeDriver: true,
          }),
        );
      } else {
        if (refresh) {
          animations.push(
            Animated.timing(viewOpacities[index], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          );
          animations.push(
            Animated.timing(circleOpacities[index], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          );
        } else if (finish) {
          animations.push(
            Animated.timing(viewOpacities[index], {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
          );
          animations.push(
            Animated.timing(circleOpacities[index], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          );
        } else {
          animations.push(
            Animated.timing(viewOpacities[index], {
              toValue: index < activeIndex.current ? 0.4 : 1,
              duration: 400,
              useNativeDriver: true,
            }),
          );
        }
      }
    });

    if (finish) {
      Animated.parallel(animations).start(() => {
        Animated.spring(moveAnim, {
          toValue: (activeIndex.current + 1) * 80,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      });
    } else {
      Animated.parallel(animations).start();
    }

    if (finish && userSettings.enableCompleteAnimation) {
      setDisableScroll(true);
      Animated.timing(lottieAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }).start(() => {
        lottieAnimRef.current!.play();
      });
    }
  };

  const completePress = async () => {
    const finished = activeIndex.current + 1 === module.exercises.length;

    const animations = [
      Animated.timing(viewOpacities[activeIndex.current], {
        toValue: 0.4,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacities[activeIndex.current], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ];

    if (finished) {
      animations.push(
        Animated.timing(doneAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      );
    } else {
      animations.push(
        Animated.spring(moveAnim, {
          toValue: (activeIndex.current + 1) * 80,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      );
    }

    Animated.parallel(animations, { stopTogether: false }).start(() => {
      if (finished && userSettings.enableCompleteAnimation) {
        setDisableScroll(true);
        Animated.timing(lottieAnim, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }).start(() => {
          lottieAnimRef.current!.play();
        });
      }
    });

    module.exercises[activeIndex.current].completed = true;
    module.progress = module.progress + 100 / module.exercises.length;

    const success = await patchModule(module);

    if (success) {
      activeIndex.current = activeIndex.current + 1;
    }
  };

  const refreshOrFinish = async (refresh: boolean) => {
    setEditing(true);
    module.exercises.forEach((curr) => (curr.completed = refresh ? false : true));
    module.progress = refresh ? 0 : 100;

    const success = await patchModule(module);

    if (success) {
      animateAll(false, refresh, !refresh);
      if (!refresh) {
        Animated.timing(doneAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setMarkerStates();
          setEditing(false);
        });
      } else {
        setMarkerStates();
        setEditing(false);
      }
    }
  };

  const cancelOrSave = async (save: boolean) => {
    let success = true;

    if (save) {
      setSaving(true);

      let newModule = module;
      newModule.exercises = reorderExercises;

      success = await patchModule(newModule);
    }

    if (success) {
      setReordering(false);
      setReorderExercises(module.exercises);
    }

    setSaving(false);
  };

  return (
    <PageContainer
      header={module.name}
      setBlurActive={setBlurActive}
      backButton={true}
      backButtonDisabled={editing}
      backButtonStyle={{ opacity: editing ? 0.4 : 1 }}
      disableScroll={disableScroll}
      scrollViewRef={scrollViewRef}
      keyboardPadding={200}
      reordering={reordering}
      screenOverlay={
        <Animated.View style={[styles.animationContainer, StyleSheet.absoluteFill, { opacity: lottieAnim }]}>
          <LottieView
            ref={lottieAnimRef}
            source={require("./../assets/Success.lottie")}
            style={styles.animation}
            loop={false}
            onAnimationFinish={() => {
              setDisableScroll(false);
              Animated.timing(lottieAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }).start();
            }}
            speed={1.5}
          />
        </Animated.View>
      }
    >
      <DetailsModal
        module={module}
        visible={modalVisible}
        setVisible={(deleted: boolean) => {
          if (deleted) {
            navigation.goBack();
          } else {
            setEditing(false);
          }
          setModalVisible(false);
        }}
      />

      <View style={styles.headerContainer}>
        <Animated.Text style={[styles.headerText, { fontSize: module.name.length < 10 ? 50 : 30, opacity: headerOpacity }]} numberOfLines={1}>
          {module.name}
        </Animated.Text>
        <Animated.View style={[styles.headerBtnContainer, { opacity: reorderHideOpacity }]}>
          <MaterialIconButton
            name="swap-vert"
            color={colors.light_primary}
            size={34}
            onPress={() => {
              setReordering(true);
            }}
            disabled={editing || reordering || exerciseActive || adding}
            style={[styles.reorderBtn, { opacity: blurActive || exerciseActive || adding ? 0 : editing ? 0.4 : 1 }]}
          />
          <MaterialIconButton
            name="edit"
            color={colors.light_primary}
            size={34}
            onPress={() => {
              setEditing(true);
              setModalVisible(true);
            }}
            disabled={editing || reordering}
            style={[styles.editBtn, { opacity: blurActive ? 0 : editing ? 0.4 : 1 }]}
          />
        </Animated.View>
      </View>

      <View style={styles.actionBtnContainer}>
        {saving ? (
          <>
            <ActivityIndicator size="small" color={colors.lightest_grey} style={styles.actionBtnInvisSpinner} />
            <ActivityIndicator size="small" color={colors.lightest_grey} style={styles.actionBtnSpinner} />
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionBtnContent}
              onPress={() => {
                if (reordering) {
                  cancelOrSave(false);
                } else {
                  refreshOrFinish(true);
                }
              }}
              disabled={!(reordering || (!adding && !(module.progress === 0) && exerciseActive))}
            >
              <Animated.Text style={[styles.actionBtn, { opacity: restartCancelButtonOpacity }]}>{reordering ? "Cancel" : "Restart"}</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnContent}
              onPress={() => {
                if (reordering) {
                  cancelOrSave(true);
                } else {
                  refreshOrFinish(false);
                }
              }}
              disabled={!(reordering || (!adding && !(module.progress === 100) && !(module.exercises.length === 0) && exerciseActive))}
            >
              <Animated.Text style={[styles.actionBtn, { opacity: finishSaveButtonOpacity }]}>{reordering ? "Save" : "Finish"}</Animated.Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.exerciseContainer}>
        {reordering ? (
          <NestableDraggableFlatList
            data={reorderExercises}
            onDragEnd={({ data }) => setReorderExercises(data)}
            keyExtractor={(item) => item.id!}
            renderItem={(props) => <ReorderExercise item={props.item} drag={props.drag} isActive={props.isActive} saving={saving} />}
            style={styles.reorder}
          />
        ) : (
          module.exercises.map((exercise, index) => (
            <Exercise
              key={exercise.id}
              exerciseId={exercise.id!}
              moduleId={module.id!}
              viewOpacity={viewOpacities[index]}
              circleOpacity={circleOpacities[index]}
              last={index === module.exercises.length - 1 && !adding}
              hideActive={doneAnim}
              active={activeIndex.current === index && exerciseActive}
              deleteCallback={(index: number) => {
                circleOpacities.splice(index, 1);
                viewOpacities.splice(index, 1);
                scaleYLayout();
                setDeleteTrigger(!deleteTrigger);
              }}
            />
          ))
        )}

        {adding && (
          <>
            {module.exercises.length !== 0 && <View style={styles.addExerciseDivider} />}
            <AddExercise
              moduleId={module.id!}
              done={(add: boolean) => {
                if (add) {
                  circleOpacities.push(new Animated.Value(0));
                  viewOpacities.push(new Animated.Value(1));
                }
                scaleYLayout();
                setAdding(false);
                animateAll(false, false, false);
              }}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.addExerciseContainer, { opacity: adding || reordering ? 0 : 1 }]}
          onPress={() => {
            scrollViewRef.current?.scrollToEnd();
            opacityLayout();
            setAdding(true);
            animateAll(true, false, false);
          }}
          disabled={adding || reordering}
        >
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.activeCircleContainer, { opacity: moveOpacity, transform: [{ translateY: moveAnim }, { scale: moveScale }] }]}>
          <TouchableOpacity onPress={completePress} disabled={activeIndex.current + 1 > module.exercises.length || adding || reordering}>
            <Animated.View style={[styles.activeCircle, { borderColor: borderColor }]} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </PageContainer>
  );
};

export default ModuleDetailScreen;

const styles = StyleSheet.create({
  animationContainer: {
    position: "absolute",
  },
  animation: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: "white",
    fontFamily: "Main-Font",
    fontStyle: "italic",
    fontWeight: "bold",
    width: "78%",
  },
  headerBtnContainer: {
    flexDirection: "row",
  },
  reorderBtn: {
    padding: "1%",
    marginRight: "5%",
  },
  editBtn: {
    padding: "1%",
  },
  actionBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  actionBtnInvisSpinner: {
    opacity: 0,
  },
  actionBtnSpinner: {
    marginRight: "5%",
    marginBottom: "1%",
  },
  actionBtnContent: {
    alignItems: "center",
  },
  actionBtn: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
  divider: {
    borderBottomColor: colors.border_grey,
    borderBottomWidth: 0.8,
    width: "100%",
    marginTop: 5,
  },
  exerciseContainer: {
    paddingHorizontal: "5%",
  },
  reorder: {
    overflow: "visible",
  },
  addExerciseDivider: {
    borderBottomColor: colors.border_grey,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  addExerciseContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  addExerciseText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
  activeCircleContainer: {
    position: "absolute",
    left: 27,
    top: 27,
    zIndex: 10,
  },
  activeCircle: {
    width: 30,
    height: 30,
    borderRadius: 300,
    borderWidth: 3,
    backgroundColor: colors.secondary,
    flex: 1,
  },
});
