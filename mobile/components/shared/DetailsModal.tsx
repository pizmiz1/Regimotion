import { ComponentProps, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useGlobalContext } from "../../store/GlobalContext";
import colors from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { GlobalContextType } from "../../types/globalContextType";
import { DaysDto } from "../../../shared/moduledto";
import { ModuleDto } from "../../../shared/moduledto";
import { deleteFetch, post } from "../../helpers/fetch";
import { deleteAlert, errorAlert } from "../../helpers/alert";
import { JsonDto } from "../../../shared/jsondto";
import { MaterialIconButton } from "./IconButton";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../../constants/routeNames";

// Custom Components
import Input from "./Input";
import Button from "./Button";
import Day from "./Day";

const initialDays: DaysDto = {
  mon: false,
  tues: false,
  wed: false,
  thur: false,
  fri: false,
  sat: false,
  sun: false,
};

interface DetailsModalProps {
  visible: boolean;
  setVisible: (deleted: boolean) => void;
  module?: ModuleDto;
}

const DetailsModal = ({ visible, setVisible, module }: DetailsModalProps) => {
  const { modules, updateModules, accessToken, updateAccessToken, patchModule }: GlobalContextType = useGlobalContext();

  const [days, setDays] = useState(initialDays);
  const [resetInput, setResetInput] = useState(false);
  const [resetDay, setResetDay] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState("");

  const { height: screenHeight } = useWindowDimensions();

  const navigation = useNavigation();

  const flatListRef = useRef<FlatList<string>>(null);
  const opacityAnim1 = useRef(new Animated.Value(0.4)).current;
  const opacityAnim2 = useRef(new Animated.Value(0.4)).current;
  const opacityAnim3 = useRef(new Animated.Value(0.4)).current;
  const borderAnimVal1 = opacityAnim1.interpolate({
    inputRange: [0.4, 1],
    outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
  });
  const borderAnimVal2 = opacityAnim2.interpolate({
    inputRange: [0.4, 1],
    outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
  });
  const borderAnimVal3 = opacityAnim3.interpolate({
    inputRange: [0.4, 1],
    outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
  });

  const availableIcons = [
    "fitness-center",
    "directions-bike",
    "directions-run",
    "sports-soccer",
    "sports-basketball",
    "sports-volleyball",
    "sports-hockey",
    "water",
    "eco",
    "landscape",
    "pets",
    "personal-injury",
    "sentiment-very-satisfied",
    "local-hospital",
    "medical-services",
    "health-and-safety",
    "accessibility",
    "stream",
    "star",
    "cloud",
    "camera",
    "360",
    "all-inclusive",
    "api",
  ];

  useEffect(() => {
    if (!module || !visible) {
      return;
    }

    setName(module.name);
    setIcon(module.icon);
    setDays(module.days);
    colorPress(module.color);

    const index = availableIcons.indexOf(module.icon);
    let offset;
    if (index < 8) {
      offset = 0;
    } else if (index < 12) {
      offset = 105;
    } else if (index < 16) {
      offset = 190;
    } else if (index < 20) {
      offset = 275;
    } else {
      offset = 300;
    }

    flatListRef.current?.scrollToOffset({ offset: offset, animated: false });
  }, [visible]);

  const mapDayToLabel = (dayKey: string) => {
    const dayKeys = Object.keys(days);

    switch (dayKey) {
      case dayKeys[0]:
        return "M";
      case dayKeys[1]:
        return "T";
      case dayKeys[2]:
        return "W";
      case dayKeys[3]:
        return "T";
      case dayKeys[4]:
        return "F";
      case dayKeys[5]:
        return "S";
      case dayKeys[6]:
        return "S";
      default:
        return "M";
    }
  };

  const toggleDay = (dayKey: string) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey as keyof typeof days],
    }));
  };

  const resetState = () => {
    setResetDay(!resetDay);
    setResetInput(!resetInput);
    setName("");
    setIcon("");
    colorPress("");
    setDays(initialDays);
    setSaving(false);
  };

  const closeModal = (deleted: boolean) => {
    if (saving) {
      return;
    }
    resetState();
    setVisible(deleted);
  };

  const savePress = async () => {
    setSaving(true);

    let moduleDto: ModuleDto = {
      name: name,
      icon: icon,
      color: color,
      days: days,
      progress: 0,
      exercises: module ? module.exercises : [],
    };

    let newModules: ModuleDto[] = [];
    if (module) {
      moduleDto.id = module.id;

      await patchModule(moduleDto);
    } else {
      const response: JsonDto<ModuleDto> = await post("/module", moduleDto, { accessToken: accessToken, updateAccessToken: updateAccessToken });
      if (response.error) {
        errorAlert(response.error);
        setSaving(false);
        return;
      }

      newModules = [...modules, response.data!];

      updateModules(newModules);
      // @ts-ignore
      navigation.navigate(routeNames.moduleDetail, { moduleId: response.data.id });
    }

    closeModal(false);
  };

  const deletePress = () => {
    const deleteModule = async () => {
      setSaving(true);

      const response = await deleteFetch("/module", { accessToken, updateAccessToken }, module!.id!);
      if (response.error) {
        errorAlert(response.error);
      } else {
        const newModules = modules.filter((curr) => curr.id !== module!.id);
        updateModules(newModules);
      }

      closeModal(true);
    };

    deleteAlert("Module", deleteModule);
  };

  const colorPress = (color: string) => {
    let var1 = 0.4;
    let var2 = 0.4;
    let var3 = 0.4;
    if (color === colors.primary) {
      var1 = 1;
    } else if (color === colors.orange_compliment) {
      var2 = 1;
    } else if (color === colors.blue_compliment) {
      var3 = 1;
    }

    Animated.parallel([
      Animated.timing(opacityAnim1, {
        toValue: var1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim2, {
        toValue: var2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim3, {
        toValue: var3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setColor(color);
  };

  const ColorInput = ({
    backgroundColor,
    opacityAnim,
    borderAnim,
  }: {
    backgroundColor: string;
    opacityAnim: Animated.Value;
    borderAnim: Animated.AnimatedInterpolation<string | number>;
  }) => {
    return (
      <Pressable
        onPress={() => {
          colorPress(backgroundColor);
        }}
        disabled={saving}
      >
        <Animated.View
          style={[
            styles.colorInput,
            { backgroundColor: backgroundColor, opacity: saving ? (color === backgroundColor ? 0.7 : 0.4) : opacityAnim, borderColor: borderAnim },
          ]}
        />
      </Pressable>
    );
  };

  const RenderIconItem = ({ item }: { item: string }) => (
    <Pressable
      disabled={saving}
      onPress={() => setIcon(item)}
      style={({ pressed }) => [
        styles.iconInput,
        { backgroundColor: icon === item ? "#fff" : colors.light_grey, opacity: saving ? 0.4 : pressed ? 0.5 : 1 },
      ]}
    >
      <MaterialIcons name={item as ComponentProps<typeof MaterialIcons>["name"]} size={30} color="#000" />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        closeModal(false);
      }}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <MaterialIconButton
              name="delete"
              color={colors.warning}
              size={24}
              onPress={deletePress}
              disabled={saving || !module}
              style={[styles.headerBtn, { opacity: saving || !module ? 0 : 1 }]}
            />
            <Text style={[styles.headerText, { fontSize: module && module.name.length < 10 ? 35 : 24 }]}>{module ? module.name : "New Module"}</Text>
            <MaterialIconButton
              name="close"
              color={colors.light_grey}
              size={24}
              onPress={() => {
                closeModal(false);
              }}
              style={[styles.headerBtn, { opacity: saving ? 0 : 1 }]}
              disabled={saving}
            />
          </View>

          <Input
            label="Name"
            onChangeText={setName}
            style={styles.nameInput}
            reset={resetInput}
            baseBorderColor={colors.light_secondary}
            limit={15}
            disabled={saving}
            startVal={module ? module.name : ""}
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorInputContainer}>
            <ColorInput backgroundColor={colors.primary} opacityAnim={opacityAnim1} borderAnim={borderAnimVal1} />
            <ColorInput backgroundColor={colors.orange_compliment} opacityAnim={opacityAnim2} borderAnim={borderAnimVal2} />
            <ColorInput backgroundColor={colors.blue_compliment} opacityAnim={opacityAnim3} borderAnim={borderAnimVal3} />
          </View>

          <Text style={styles.label}>Icon</Text>
          <View style={[styles.iconInputContainer, { height: screenHeight < 700 ? 150 : 310 }]}>
            <FlatList
              ref={flatListRef}
              data={availableIcons}
              renderItem={RenderIconItem}
              keyExtractor={(item) => item}
              numColumns={4}
              scrollEnabled={!saving}
            />
          </View>

          <Text style={styles.daysLabel}>Days Active</Text>
          <View style={styles.daysInputContainer}>
            {Object.entries(days).map(([key, value]) => (
              <Day
                key={key}
                label={mapDayToLabel(key)}
                size={35}
                baseColor={colors.dark_grey}
                reset={resetDay}
                onPress={() => {
                  toggleDay(key);
                }}
                disabled={saving}
                startActive={module ? value : false}
              />
            ))}
          </View>

          {saving ? (
            <ActivityIndicator size="large" color={colors.lightest_grey} style={styles.spinner} />
          ) : (
            <View style={styles.btnContainer}>
              <Button label="Reset" onPress={resetState} disabled={name === "" && icon === "" && color === ""} style={styles.btn} />
              <Button label="Save" onPress={savePress} disabled={name === "" || icon === "" || color === ""} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DetailsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: colors.light_secondary,
    flex: 1,
    padding: 15,
    justifyContent: "flex-start",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2%",
  },
  headerBtn: {
    paddingVertical: "3%",
    paddingHorizontal: "1%",
  },
  headerText: {
    color: "white",
    fontFamily: "Main-Font",
    fontStyle: "italic",
    textAlign: "center",
    width: "80%",
  },
  nameInput: {
    marginTop: 5,
  },
  label: {
    color: "white",
    fontFamily: "Main-Font",
    fontWeight: "500",
    fontSize: 20,
    marginTop: 15,
  },
  colorInputContainer: {
    marginTop: 5,
    flexDirection: "row",
    gap: 20,
  },
  colorInput: {
    borderRadius: 5,
    height: 40,
    width: 40,
    borderWidth: 1,
  },
  iconInputContainer: {
    marginTop: 5,
  },
  iconInput: {
    padding: "4.6%",
    margin: "3%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  daysLabel: {
    color: "white",
    fontFamily: "Main-Font",
    fontWeight: "500",
    fontSize: 20,
    marginTop: 25,
  },
  daysInputContainer: {
    width: "100%",
    backgroundColor: colors.dark_grey,
    paddingVertical: 17,
    paddingHorizontal: 10,
    borderRadius: 25,
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  spinner: {
    marginTop: "10%",
  },
  btnContainer: {
    alignItems: "flex-end",
    flexGrow: 1,
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  btn: {
    backgroundColor: colors.dark_grey,
  },
});
