import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../store/globalContext";
import Module from "../components/shared/module";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../constants/routeNames";
import DetailsModal from "../components/shared/detailsModal";
import NoModules from "../components/daily/noModules";
import { ModuleDto } from "../../shared/moduledto";
import { opacityLayout } from "../helpers/layouts";
import { JsonDto } from "../../shared/jsondto";
import { get } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import { MaterialIconButton } from "../components/shared/iconButton";
import PageContainer from "../components/shared/pageContainer";
import { UserSettingsDto } from "../../shared/usersettingsdto";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DailyScreen = () => {
  const { modules, accessToken, updateAccessToken, updateModules, updateUserSettings } = useGlobalContext();

  const [blurActive, setBlurActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [todaysModules, setTodaysModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(modules.length === 0);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  const date = new Date();

  const navigation = useNavigation();

  useEffect(() => {
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

    if (modules.length === 0) {
      load();
    }
  }, []);

  useEffect(() => {
    const today = date.toLocaleDateString("en-US", { weekday: "long" });

    switch (today) {
      case "Monday":
        setTodaysModules(modules.filter((curr) => curr.days.mon));
        return;
      case "Tuesday":
        setTodaysModules(modules.filter((curr) => curr.days.tues));
        return;
      case "Wednesday":
        setTodaysModules(modules.filter((curr) => curr.days.wed));
        return;
      case "Thursday":
        setTodaysModules(modules.filter((curr) => curr.days.thur));
        return;
      case "Friday":
        setTodaysModules(modules.filter((curr) => curr.days.fri));
        return;
      case "Saturday":
        setTodaysModules(modules.filter((curr) => curr.days.sat));
        return;
      case "Sunday":
        setTodaysModules(modules.filter((curr) => curr.days.sun));
        return;
      default:
        return;
    }
  }, [modules]);

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: blurActive ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [blurActive]);

  useEffect(() => {
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
  }, [iconOpacity]);

  if (loading)
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.secondary }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  return (
    <PageContainer
      header={modules.length > 0 ? date.toLocaleDateString("en-US", { weekday: "long" }) : ""}
      setBlurActive={setBlurActive}
      userButton={true}
    >
      <DetailsModal
        visible={modalVisible}
        setVisible={(deleted: boolean) => {
          setModalVisible(false);
        }}
      />
      {modules.length > 0 ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ width: "75%" }}>
              <Animated.Text
                style={{
                  color: "white",
                  fontSize: 50,
                  fontFamily: "Main-Font",
                  fontStyle: "italic",
                  fontWeight: "bold",
                  opacity: headerOpacity,
                }}
              >
                {date.toLocaleDateString("en-US", { weekday: "long" })}
              </Animated.Text>
              <Animated.Text
                style={{
                  color: colors.lighter_grey,
                  fontSize: 20,
                  fontFamily: "Main-Font",
                  opacity: headerOpacity,
                }}
              >
                {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </Animated.Text>
            </View>

            <MaterialIconButton
              name="format-list-bulleted"
              color={colors.light_primary}
              size={34}
              style={{ padding: "2%", opacity: blurActive ? 0 : 1 }}
              onPress={() => {
                navigation.navigate(routeNames.module);
              }}
            />
          </View>
          {todaysModules.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
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
            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={{ marginTop: 120, width: 100, height: 100, justifyContent: "center", alignItems: "center", position: "absolute" }}>
                <Animated.View
                  style={{
                    experimental_backgroundImage:
                      "radial-gradient(circle at center, rgba(104, 85, 213, 0.85) 0%, rgba(104, 85, 213, 0.35) 18%, rgba(104, 85, 213, 0.1) 32%, rgba(104, 85, 213, 0.03) 42%, rgba(0, 0, 0, 0) 50%)",
                    filter: [{ blur: 35 }],
                    borderRadius: "50%",
                    width: 260,
                    height: 260,
                    position: "absolute",
                    opacity: iconOpacity,
                  }}
                />
              </View>
              <MaterialCommunityIcons name="weather-night" size={100} color="white" style={{ marginTop: 120 }} />
              <Text style={{ color: "white", fontSize: 40, fontWeight: 600, textAlign: "center" }}>Nothing Here</Text>
              <Text style={{ color: colors.light_grey, fontSize: 20, textAlign: "center", marginTop: 5 }}>
                It looks like you have no modules for today!
              </Text>
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
