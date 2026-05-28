import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import colors from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ModuleDto } from "../../../shared/moduledto";
import { ComponentProps } from "react";
import * as Progress from "react-native-progress";
import { useGlobalContext } from "../../store/globalContext";

interface ModuleProps {
  module: ModuleDto;
  style?: ViewStyle;
  onPress: () => void;
  disabled?: boolean;
  blank?: boolean;
  progress?: number;
  dailyMod: boolean;
}

const Module = ({ module, style, onPress, disabled = false, blank = false, progress, dailyMod }: ModuleProps) => {
  const { userSettings, accessToken, updateAccessToken, patchModule } = useGlobalContext();

  let color1;
  let color2 = module.color;
  if (blank) {
    color1 = colors.lightest_grey;
    color2 = colors.dark_grey;
  } else if (module.color === colors.primary) {
    color1 = colors.light_primary;
  } else if (module.color === colors.primary_orange_compliment) {
    color1 = colors.primary_orange_compliment_light;
  } else {
    color1 = colors.primary_blue_compliment_light;
  }

  if (dailyMod) {
    color1 = "#333438";
    color2 = "#333438";
  }

  const holdComplete = async () => {
    const prevProgress = module.progress;

    module.exercises.forEach((curr) => (curr.completed = true));
    module.progress = 100;

    const success = await patchModule(module);

    if (!success) {
      module.exercises.forEach((curr) => (curr.completed = false));
      module.progress = prevProgress;
    }
  };

  const dayDisplayer = () => {
    let dayDisplay = "";

    if (blank) {
      return dayDisplay;
    }

    if (module.days.mon) {
      dayDisplay = dayDisplay + "Mon, ";
    }
    if (module.days.tues) {
      dayDisplay = dayDisplay + "Tue, ";
    }
    if (module.days.wed) {
      dayDisplay = dayDisplay + "Wed, ";
    }
    if (module.days.thur) {
      dayDisplay = dayDisplay + "Thu, ";
    }
    if (module.days.fri) {
      dayDisplay = dayDisplay + "Fri, ";
    }
    if (module.days.sat) {
      dayDisplay = dayDisplay + "Sat, ";
    }
    if (module.days.sun) {
      dayDisplay = dayDisplay + "Sun, ";
    }

    if (module.days.mon && module.days.tues && module.days.wed && module.days.thur && module.days.fri && !module.days.sat && !module.days.sun) {
      dayDisplay = "Weekdays, ";
    }

    if (!module.days.mon && !module.days.tues && !module.days.wed && !module.days.thur && !module.days.fri && module.days.sat && module.days.sun) {
      dayDisplay = "Weekends, ";
    }

    if (module.days.mon && module.days.tues && module.days.wed && module.days.thur && module.days.fri && module.days.sat && module.days.sun) {
      dayDisplay = "Everyday, ";
    }

    dayDisplay = dayDisplay.slice(0, -2);

    return dayDisplay;
  };

  const ModuleContent = () => {
    if (blank)
      return (
        <LinearGradient
          colors={[color1, color2]}
          style={{
            width: 150,
            height: 150,
            borderRadius: 15,
            alignItems: "center",
            ...style,
          }}
        />
      );

    if (dailyMod)
      return (
        <LinearGradient
          colors={[color1, color2]}
          style={{
            width: "100%",
            borderRadius: 20,
            alignItems: "center",
            padding: "5%",
            ...style,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "flex-start",
            }}
          >
            <View style={{ alignItems: "flex-start", gap: 5 }}>
              <MaterialIcons name={module.icon as ComponentProps<typeof MaterialIcons>["name"]} size={30} color="white" />
              <Text
                style={{
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "Main-Font",
                  fontStyle: "italic",
                  fontSize: 17,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                {module.name}
              </Text>
            </View>
            {module.progress === 100 ? (
              <View style={{ backgroundColor: module.color, borderRadius: 100, padding: 5 }}>
                <MaterialIcons name="check" size={20} color="white" />
              </View>
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: module.color,
                  borderRadius: 20,
                  marginTop: 5,
                }}
              >
                <Text style={{ color: "white", paddingHorizontal: 10, paddingVertical: 2 }}>
                  {module.exercises.filter((curr) => curr.completed === true).length}/{module.exercises.length}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexGrow: 1, justifyContent: "center", width: "100%", paddingTop: "5%" }}>
            <Progress.Bar
              progress={progress ? progress / 100 : 0}
              height={15}
              color={module.color}
              unfilledColor="rgb(95, 95, 95)"
              borderWidth={0}
              width={null}
              borderRadius={300}
            />
          </View>
        </LinearGradient>
      );

    return (
      <LinearGradient
        colors={[color1, color2]}
        style={{
          width: 150,
          height: 150,
          borderRadius: 15,
          alignItems: "center",
          ...style,
        }}
      >
        <MaterialIcons
          name={module.icon as ComponentProps<typeof MaterialIcons>["name"]}
          size={150 / 2.7}
          color="white"
          style={{ paddingTop: "15%", paddingBottom: "2%" }}
        />
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Main-Font",
            fontStyle: "italic",
            fontSize: module.name != undefined && module.name.length > 10 ? 11 : 17,
            width: "95%",
            textAlign: "center",
            textTransform: "uppercase",
            marginTop: "5%",
          }}
        >
          {module.name}
        </Text>
        <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
          <Text style={{ marginBottom: "18%", color: colors.lightest_grey, textAlign: "center" }}>{dayDisplayer()}</Text>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{ overflow: "hidden" }}
        onLongPress={userSettings.enableHoldComplete ? holdComplete : undefined}
      >
        {ModuleContent()}
      </TouchableOpacity>
    </View>
  );
};

export default Module;
