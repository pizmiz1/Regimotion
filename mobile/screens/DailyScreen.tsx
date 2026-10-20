import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../store/GlobalContext";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../constants/routeNames";
import { ModuleDto } from "../../shared/moduledto";
import { opacityLayout } from "../helpers/layouts";
import { JsonDto } from "../../shared/jsondto";
import { get } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import { UserSettingsDto } from "../../shared/usersettingsdto";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Custom Components
import { MaterialIconButton } from "../components/shared/IconButton";
import PageContainer from "../components/shared/PageContainer";
import DetailsModal from "../components/shared/DetailsModal";
import NoModules from "../components/daily/NoModules";
import Module from "../components/shared/Module";

const DailyScreen = () => {
  const { modules, accessToken, updateAccessToken, updateModules, updateUserSettings } = useGlobalContext();

  const [blurActive, setBlurActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(modules.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  const date = new Date();

  const navigation = useNavigation();

  const load = async () => {
    const responseModule: JsonDto<ModuleDto[]> = await get("/module", { accessToken: accessToken, updateAccessToken: updateAccessToken });
    if (responseModule.error) {
      errorAlert(responseModule.error);
      return;
    }

    const responseUserSettings: JsonDto<UserSettingsDto> = await get("/userSettings", {
      accessToken: accessToken,
      updateAccessToken: updateAccessToken,
    });
    if (responseUserSettings.error) {
      errorAlert(responseUserSettings.error);
      return;
    }

    updateModules(responseModule.data!);
    updateUserSettings(responseUserSettings.data!);
    opacityLayout();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dayMapping = ["sun", "mon", "tues", "wed", "thur", "fri", "sat"] as const;
  const currentDayKey = dayMapping[date.getDay()];
  const todaysModules = modules.filter((curr) => curr.days[currentDayKey]);
  const anyModulesToday = todaysModules.length > 0;

  if (anyModulesToday) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }

  Animated.timing(headerOpacity, {
    toValue: blurActive ? 0 : 1,
    duration: 200,
    useNativeDriver: true,
  }).start();

  if (loading)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  return (
    <PageContainer
      header={modules.length > 0 ? date.toLocaleDateString("en-US", { weekday: "long" }) : ""}
      setBlurActive={setBlurActive}
      userButton={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <DetailsModal
        visible={modalVisible}
        setVisible={(deleted: boolean) => {
          setModalVisible(false);
        }}
      />
      {modules.length > 0 ? (
        <>
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                {date.toLocaleDateString("en-US", { weekday: "long" })}
              </Animated.Text>
              <Animated.Text style={[styles.headerDescriptionText, { opacity: headerOpacity }]}>
                {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </Animated.Text>
            </View>

            <MaterialIconButton
              name="format-list-bulleted"
              color={colors.light_primary}
              size={34}
              style={[styles.headerBtn, { opacity: blurActive ? 0 : 1 }]}
              onPress={() => {
                navigation.navigate(routeNames.module);
              }}
            />
          </View>
          {anyModulesToday ? (
            <View style={styles.modulesContainer}>
              {todaysModules.map((module) => (
                <Module
                  key={module.id}
                  module={module}
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate(routeNames.moduleDetail, { moduleId: module.id });
                  }}
                  progress={module.progress}
                  dailyMod={true}
                />
              ))}
            </View>
          ) : (
            <View style={styles.nothingTodayContainer}>
              <View style={styles.nothingTodayIconContainer}>
                <Animated.View style={[[styles.nothingTodayIconEffect, { opacity: iconOpacity }]]} />
              </View>
              <MaterialCommunityIcons name="weather-night" size={100} color="white" style={styles.nothingTodayIcon} />
              <Text style={styles.nothingTodayText}>Nothing Here</Text>
              <Text style={styles.nothingTodayDescriptionText}>It looks like you have no modules for today!</Text>
            </View>
          )}
        </>
      ) : (
        <NoModules
          addPress={() => {
            setModalVisible(true);
          }}
        />
      )}
    </PageContainer>
  );
};

export default DailyScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    width: "75%",
  },
  headerText: {
    color: "white",
    fontSize: 47,
    fontFamily: "Main-Font",
    fontStyle: "italic",
    fontWeight: "bold",
  },
  headerDescriptionText: {
    color: colors.lighter_grey,
    fontSize: 20,
    fontFamily: "Main-Font",
  },
  headerBtn: {
    padding: "2%",
  },
  modulesContainer: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    marginTop: 20,
  },
  nothingTodayContainer: {
    flex: 1,
    alignItems: "center",
  },
  nothingTodayIconContainer: {
    marginTop: 120,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  nothingTodayIconEffect: {
    experimental_backgroundImage:
      "radial-gradient(circle at center, rgba(104, 85, 213, 0.85) 0%, rgba(104, 85, 213, 0.35) 18%, rgba(104, 85, 213, 0.1) 32%, rgba(104, 85, 213, 0.03) 42%, rgba(0, 0, 0, 0) 50%)",
    filter: [{ blur: 35 }],
    borderRadius: "50%",
    width: 260,
    height: 260,
    position: "absolute",
  },
  nothingTodayIcon: {
    marginTop: 120,
  },
  nothingTodayText: {
    color: "white",
    fontSize: 40,
    fontWeight: 600,
    textAlign: "center",
  },
  nothingTodayDescriptionText: {
    color: colors.light_grey,
    fontSize: 20,
    textAlign: "center",
    marginTop: 5,
  },
});
