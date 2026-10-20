import { Animated, StyleSheet, Text } from "react-native";
import { useRef, useEffect, useState } from "react";
import colors from "../constants/colors";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useGlobalContext } from "../store/GlobalContext";
import { get } from "../helpers/fetch";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import routeNames from "../constants/routeNames";
import { errorAlert } from "../helpers/alert";
import { JsonDto } from "../../shared/jsondto";
import { LinearGradient } from "expo-linear-gradient";

const SplashScreen = () => {
  const { updateAccessToken, updateAppLoading } = useGlobalContext();

  const [initialAnim, setInitialAnim] = useState(true);
  const [dots, setDots] = useState("");

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
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
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
    }, 1080);

    return () => clearInterval(interval);
  }, [initialAnim]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const load = async () => {
      const email = await SecureStore.getItemAsync(storageKeys.email);
      const passkey = await SecureStore.getItemAsync(storageKeys.passkey);
      const token = await SecureStore.getItemAsync(storageKeys.token);

      if (!email || !passkey || !token) {
        updateAppLoading(false);
        return;
      }

      // Wake up server/refresh access token
      const response: JsonDto<any> = await get("/", { accessToken: token, updateAccessToken: updateAccessToken }, undefined, true);
      if (response.error) {
        errorAlert(response.error);
        SecureStore.deleteItemAsync(storageKeys.email);
        SecureStore.deleteItemAsync(storageKeys.passkey);
        SecureStore.deleteItemAsync(storageKeys.token);
      }

      updateAppLoading(false);
    };

    load();
  }, [loaded]);

  return (
    <LinearGradient style={styles.container} colors={[colors.primary_full_gradient_top, colors.primary_full_gradient_bottom]}>
      <StatusBar style="light" />
      <Animated.Image
        style={[styles.img, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        source={require("./../assets/logo-clear.png")}
      ></Animated.Image>
      <Text style={[styles.loadingText, { opacity: initialAnim ? 0 : 1 }]}>Hang tight{dots}</Text>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "0%",
    height: "35%",
    aspectRatio: 1,
  },
  loadingText: {
    fontFamily: "Main-Font",
    fontSize: 20,
    color: colors.lightest_grey,
    marginTop: -45,
    marginBottom: 100,
  },
});
