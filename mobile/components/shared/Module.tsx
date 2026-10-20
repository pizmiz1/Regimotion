import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import colors from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ModuleDto } from "../../../shared/moduledto";
import { ComponentProps } from "react";
import * as Progress from "react-native-progress";
import { useGlobalContext } from "../../store/GlobalContext";

interface ModuleProps {
  module: ModuleDto;
  style?: ViewStyle;
  onPress: () => void;
  disabled?: boolean;
  blank?: boolean;
  progress?: number;
  dailyMod?: boolean;
}

const Module = ({ module, style, onPress, disabled = false, blank = false, progress, dailyMod }: ModuleProps) => {
  const { userSettings, patchModule } = useGlobalContext();

  let color1;
  let color2;

  if (blank) {
    color1 = colors.lightest_grey;
    color2 = colors.dark_grey;
  } else if (module.color === colors.primary) {
    color1 = colors.primary_gradient_top;
    color2 = colors.primary_gradient_bottom;

    if (!Object.values(module.days).some((val) => val === true)) {
      color1 = "#1C1936";
      color2 = "#2F2A59";
    }
  } else if (module.color === colors.orange_compliment) {
    color1 = colors.orange_gradient_top;
    color2 = colors.orange_gradient_bottom;

    if (!Object.values(module.days).some((val) => val === true)) {
      color1 = "#241715";
      color2 = "#3D2824";
    }
  } else {
    color1 = colors.blue_gradient_top;
    color2 = colors.blue_gradient_bottom;

    if (!Object.values(module.days).some((val) => val === true)) {
      color1 = "#141A33";
      color2 = "#242C54";
    }
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

  if (blank) {
    return <LinearGradient colors={[color1, color2]} style={[styles.blankContainer, style]} />;
  }

  const RegularModuleContent = () => {
    return (
      <>
        <MaterialIcons name={module.icon as ComponentProps<typeof MaterialIcons>["name"]} size={150 / 2.7} color="white" style={styles.regIcon} />
        <Text style={[styles.regHeaderText, { fontSize: module.name != undefined && module.name.length > 10 ? 11 : 17 }]}>{module.name}</Text>
        <View style={styles.regDaysTextContainer}>
          <Text style={styles.regDaysText}>{dayDisplayer()}</Text>
        </View>
      </>
    );
  };

  const ModuleContent = () => {
    if (dailyMod) {
      return (
        <LinearGradient colors={[color1, color2]} style={[styles.dailyContainer, { opacity: module.progress === 100 ? 0.5 : 1 }, style]}>
          <View style={styles.dailyInfoContainer}>
            <View style={styles.dailyHeaderContainer}>
              <MaterialIcons name={module.icon as ComponentProps<typeof MaterialIcons>["name"]} size={30} color="white" />
              <Text style={styles.dailyHeaderText}>{module.name}</Text>
            </View>
            {module.progress === 100 ? (
              <View style={[styles.dailyBadge, { backgroundColor: module.color }]}>
                <MaterialIcons name="check" size={20} color="white" />
              </View>
            ) : (
              <View style={[styles.dailyTrackerContainer, { borderColor: module.color }]}>
                <Text style={styles.dailyTrackerText}>
                  {module.exercises.filter((curr) => curr.completed === true).length}/{module.exercises.length}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.dailyProgressContainer}>
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
    }

    if (!Object.values(module.days).some((val) => val === true)) {
      return (
        <View style={[styles.disabledContainer, { backgroundColor: color1, borderColor: color2 }, style]}>
          <RegularModuleContent />
        </View>
      );
    }

    return (
      <LinearGradient colors={[color1, color2]} style={[styles.regContainer, style]}>
        <RegularModuleContent />
      </LinearGradient>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
      onLongPress={userSettings.enableHoldComplete ? holdComplete : undefined}
    >
      <ModuleContent />
    </TouchableOpacity>
  );
};

export default Module;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  blankContainer: {
    width: 150,
    height: 150,
    borderRadius: 15,
    alignItems: "center",
  },
  dailyContainer: {
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    padding: "5%",
  },
  dailyInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "flex-start",
  },
  dailyHeaderContainer: {
    alignItems: "flex-start",
    gap: 5,
  },
  dailyHeaderText: {
    fontWeight: "bold",
    color: "white",
    fontFamily: "Main-Font",
    fontStyle: "italic",
    fontSize: 17,
    textAlign: "center",
    textTransform: "uppercase",
  },
  dailyBadge: {
    borderRadius: 100,
    padding: 5,
  },
  dailyTrackerContainer: {
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 5,
  },
  dailyTrackerText: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  dailyProgressContainer: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    paddingTop: "5%",
  },
  regContainer: {
    width: 150,
    height: 150,
    borderRadius: 15,
    alignItems: "center",
  },
  regIcon: {
    paddingTop: "15%",
    paddingBottom: "2%",
  },
  regHeaderText: {
    fontWeight: "bold",
    color: "white",
    fontFamily: "Main-Font",
    fontStyle: "italic",
    width: "95%",
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: "5%",
  },
  regDaysTextContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  regDaysText: {
    marginBottom: "18%",
    color: colors.lightest_grey,
    textAlign: "center",
  },
  disabledContainer: {
    width: 150,
    height: 150,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
  },
});
