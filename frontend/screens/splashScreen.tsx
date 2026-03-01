import { Alert, Animated, Text, View } from "react-native";
import { useRef, useEffect, useState } from "react";
import colors from "./../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useGlobalContext } from "../store/globalContext";
import { get } from "../helpers/fetch";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import routeNames from "../constants/routeNames";
import { errorAlert } from "../helpers/alert";
import { JsonDto } from "../../shared/jsondto";
import { Asset } from "expo-asset";

const SplashScreen = () => {
  const { updateAccessToken } = useGlobalContext();

  const [initialAnim, setInitialAnim] = useState(true);
  const [dots, setDots] = useState("");

  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const [loaded, error] = useFonts({
    "Main-Font": require("./../assets/Helvetica.ttf"),
  });

  const firstAnim = Animated.loop(
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]),
  );

  const secondAnim = Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]),
  );

  useEffect(() => {
    const handleTimerEnd = () => {
      setInitialAnim(false);
    };

    const timerId = setTimeout(handleTimerEnd, 8000);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (initialAnim) {
      firstAnim.start();
      return;
    }

    firstAnim.stop();
    secondAnim.start();

    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 1600);

    return () => clearInterval(interval);
  }, [initialAnim]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const load = async () => {
      const email = await SecureStore.getItemAsync(storageKeys.email);
      const passkey = await SecureStore.getItemAsync(storageKeys.passkey);

      if (!email || !passkey) {
        navigation.navigate(routeNames.signup);
        return;
      }

      const token = await SecureStore.getItemAsync(storageKeys.token);

      if (!token) {
        navigation.navigate(routeNames.signup);
        return;
      }

      // Wake up server/refresh access token
      const response: JsonDto<any> = await get("/", { accessToken: token, updateAccessToken: updateAccessToken }, undefined, true);
      if (response.error) {
        errorAlert(response.error);
        return;
      }

      navigation.navigate(routeNames.daily);
    };

    load();
  }, [loaded]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}>
      <StatusBar style="light" />
      <Animated.Image
        style={{ width: "0%", height: "50%", aspectRatio: 1, marginBottom: "10%", transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
        source={require("./../assets/logo-clear.png")}
      ></Animated.Image>
      <Text style={{ fontFamily: "Main-Font", fontSize: 20, color: colors.lightest_grey, opacity: initialAnim ? 0 : 1 }}>Hang tight{dots}</Text>
    </View>
  );
};

export default SplashScreen;
