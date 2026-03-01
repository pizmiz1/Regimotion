import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIconButton } from "../components/shared/IconButton";
import PageContainer from "../components/shared/pageContainer";
import DetailsModal from "../components/shared/detailsModal";
import { useGlobalContext } from "../store/globalContext";
import Exercise from "../components/moduleDetail/exercise";
import LottieView from "lottie-react-native";
import { opacityLayout, scaleYLayout } from "../helpers/layouts";
import AddExercise from "../components/moduleDetail/addExercise";

const ModuleDetailScreen = () => {
  const route = useRoute();
  // @ts-ignore
  const { moduleId, prevRoute }: { moduleId: string; prevRoute: string } = route.params;

  const { modules, patchModule } = useGlobalContext();
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
  const currentY = useRef(0);
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

    setMarkerStates();
  }, [module.exercises.length, module]);

  useEffect(() => {
    setMarkerStates();
  }, [exerciseActive]);

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

    if (finish) {
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
      if (finished) {
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

  return (
    <PageContainer
      header={module.name}
      setBlurActive={setBlurActive}
      backButton={true}
      backButtonRoute={prevRoute}
      backButtonDisabled={editing}
      backButtonStyle={{ opacity: editing ? 0.4 : 1 }}
      disableScroll={disableScroll}
      scrollViewRef={scrollViewRef}
      keyboardPadding={200}
      screenOverlay={
        <Animated.View style={{ ...StyleSheet.absoluteFillObject, position: "absolute", opacity: lottieAnim }}>
          <LottieView
            ref={lottieAnimRef}
            source={require("./../assets/Success.lottie")}
            style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)" }}
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
      setCurrentY={(y) => {
        currentY.current = y;
      }}
    >
      <DetailsModal
        module={module}
        visible={modalVisible}
        setVisible={(deleted: boolean) => {
          if (deleted) {
            navigation.navigate(prevRoute as never);
          } else {
            setEditing(false);
          }
          setModalVisible(false);
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            color: "white",
            fontSize: module.name.length < 10 ? 50 : 30,
            fontFamily: "Main-Font",
            fontStyle: "italic",
            fontWeight: "bold",
            opacity: blurActive ? 0 : 1,
            width: "80%",
          }}
          numberOfLines={1}
        >
          {module.name}
        </Text>
        <MaterialIconButton
          name="edit"
          color={colors.light_primary}
          size={34}
          onPress={() => {
            setEditing(true);
            setModalVisible(true);
          }}
          disabled={editing}
          style={{ opacity: blurActive ? 0 : editing ? 0.4 : 1, padding: "1%" }}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5, paddingTop: 10 }}>
        <TouchableOpacity
          style={{ alignItems: "center", opacity: adding || module.progress === 0 || !exerciseActive ? 0 : 1 }}
          onPress={() => {
            refreshOrFinish(true);
          }}
          disabled={adding || module.progress === 0 || !exerciseActive}
        >
          <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 20 }}>Restart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", opacity: adding || module.progress === 100 || module.exercises.length === 0 || !exerciseActive ? 0 : 1 }}
          onPress={() => {
            refreshOrFinish(false);
          }}
          disabled={adding || module.progress === 100 || module.exercises.length === 0 || !exerciseActive}
        >
          <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 20 }}>Finish</Text>
        </TouchableOpacity>
      </View>

      <View style={{ borderBottomColor: colors.border_grey, borderBottomWidth: StyleSheet.hairlineWidth, width: "100%", marginTop: 5 }} />

      <View style={{ paddingHorizontal: "5%" }}>
        {module.exercises.map((exercise, index) => (
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
        ))}

        {adding && (
          <>
            {module.exercises.length !== 0 && (
              <View style={{ borderBottomColor: colors.border_grey, borderBottomWidth: StyleSheet.hairlineWidth, width: "100%" }} />
            )}
            <AddExercise
              moduleId={module.id!}
              done={(add: boolean) => {
                currentY.current = Math.max(0, currentY.current - 100);
                scrollViewRef.current?.scrollTo({ y: currentY.current, animated: true });
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
          style={{ paddingHorizontal: 10, paddingVertical: 20, alignItems: "center", opacity: adding ? 0 : 1 }}
          onPress={() => {
            scrollViewRef.current?.scrollToEnd();
            opacityLayout();
            setAdding(true);
            animateAll(true, false, false);
          }}
          disabled={adding}
        >
          <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 20 }}>Add Exercise</Text>
        </TouchableOpacity>

        <Animated.View
          style={{
            position: "absolute",
            left: 27,
            top: 27,
            zIndex: 10,
            opacity: moveOpacity,
            transform: [{ translateY: moveAnim }, { scale: moveScale }],
          }}
        >
          <TouchableOpacity onPress={completePress} disabled={activeIndex.current + 1 > module.exercises.length || adding}>
            <Animated.View
              style={{
                width: 30,
                height: 30,
                borderRadius: 300,
                borderWidth: 3,
                borderColor: borderColor,
                backgroundColor: colors.secondary,
                flex: 1,
              }}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </PageContainer>
  );
};

export default ModuleDetailScreen;
