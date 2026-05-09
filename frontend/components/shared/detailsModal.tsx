import { ComponentProps, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useGlobalContext } from "../../store/globalContext";
import colors from "../../constants/colors";
import Input from "./input";
import { MaterialIcons } from "@expo/vector-icons";
import Button from "./button";
import Day from "./day";
import { GlobalContextType } from "../../types/globalContextType";
import { DaysDto } from "../../../shared/moduledto";
import { ModuleDto } from "../../../shared/moduledto";
import { deleteFetch, patch, post } from "../../helpers/fetch";
import { deleteAlert, errorAlert } from "../../helpers/alert";
import { JsonDto } from "../../../shared/jsondto";
import { MaterialIconButton } from "./iconButton";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../../constants/routeNames";

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
    } else if (color === colors.primary_orange_compliment) {
      var2 = 1;
    } else if (color === colors.primary_blue_compliment) {
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

  const renderIconItem = ({ item }: { item: string }) => (
    <Pressable
      disabled={saving}
      onPress={() => setIcon(item)}
      style={({ pressed }) => [
        {
          backgroundColor: icon === item ? "#fff" : colors.light_grey,
          opacity: saving ? 0.4 : pressed ? 0.5 : 1,
          padding: "4.6%",
          margin: "3%",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
        },
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
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.light_secondary,
            flex: 1,
            padding: 15,
            justifyContent: "flex-start",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: "2%" }}>
            <MaterialIconButton
              name="delete"
              color={colors.warning}
              size={24}
              onPress={deletePress}
              disabled={saving || !module}
              style={{ paddingVertical: "3%", paddingHorizontal: "1%", opacity: saving || !module ? 0 : 1 }}
            />
            <Text
              style={{
                color: "white",
                fontSize: module && module.name.length < 10 ? 35 : 24,
                fontFamily: "Main-Font",
                fontStyle: "italic",
                textAlign: "center",
                width: "80%",
              }}
            >
              {module ? module.name : "New Module"}
            </Text>
            <MaterialIconButton
              name="close"
              color={colors.light_grey}
              size={24}
              onPress={() => {
                closeModal(false);
              }}
              style={{ paddingVertical: "3%", paddingHorizontal: "1%", opacity: saving ? 0 : 1 }}
              disabled={saving}
            />
          </View>

          <Input
            label="Name"
            onChangeText={setName}
            style={{ marginTop: 5 }}
            reset={resetInput}
            baseBorderColor={colors.light_secondary}
            limit={15}
            disabled={saving}
            startVal={module ? module.name : ""}
          />

          <Text style={{ color: "white", fontFamily: "Main-Font", fontWeight: "500", fontSize: 20, marginTop: 15 }}>Color</Text>
          <View style={{ marginTop: 5, flexDirection: "row", gap: 20 }}>
            <Pressable
              onPress={() => {
                colorPress(colors.primary);
              }}
              disabled={saving}
            >
              <Animated.View
                style={{
                  borderRadius: 5,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.primary,
                  opacity: saving ? (color === colors.primary ? 0.7 : 0.4) : opacityAnim1,
                  borderColor: borderAnimVal1,
                  borderWidth: 1,
                }}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                colorPress(colors.primary_orange_compliment);
              }}
              disabled={saving}
            >
              <Animated.View
                style={{
                  borderRadius: 5,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.primary_orange_compliment,
                  opacity: saving ? (color === colors.primary_orange_compliment ? 0.7 : 0.4) : opacityAnim2,
                  borderColor: borderAnimVal2,
                  borderWidth: 1,
                }}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                colorPress(colors.primary_blue_compliment);
              }}
              disabled={saving}
            >
              <Animated.View
                style={{
                  borderRadius: 5,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.primary_blue_compliment,
                  opacity: saving ? (color === colors.primary_blue_compliment ? 0.7 : 0.4) : opacityAnim3,
                  borderColor: borderAnimVal3,
                  borderWidth: 1,
                }}
              />
            </Pressable>
          </View>

          <Text style={{ color: "white", fontFamily: "Main-Font", fontWeight: "500", fontSize: 20, marginTop: 15 }}>Icon</Text>
          <View style={{ marginTop: 5, height: 150 }}>
            <FlatList
              ref={flatListRef}
              data={availableIcons}
              renderItem={renderIconItem}
              keyExtractor={(item) => item}
              numColumns={4}
              scrollEnabled={!saving}
            />
          </View>

          <Text style={{ color: "white", fontFamily: "Main-Font", fontWeight: "500", fontSize: 20, marginTop: 25 }}>Days Active</Text>
          <View
            style={{
              width: "100%",
              backgroundColor: colors.dark_grey,
              paddingVertical: 17,
              paddingHorizontal: 10,
              borderRadius: 25,
              marginTop: 7,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
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
            <ActivityIndicator size="large" color={colors.lightest_grey} style={{ marginTop: "10%" }} />
          ) : (
            <View style={{ alignItems: "flex-end", flexGrow: 1, justifyContent: "space-evenly", flexDirection: "row" }}>
              <Button
                label="Reset"
                onPress={resetState}
                disabled={name === "" && icon === "" && !Object.values(days).some((val) => val === true) && color === ""}
                style={{ backgroundColor: colors.dark_grey }}
              />
              <Button
                label="Save"
                onPress={savePress}
                disabled={name === "" || icon === "" || !Object.values(days).some((val) => val === true) || color === ""}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DetailsModal;
