import { Stack } from "expo-router";
import { GlobalProvider, useGlobalContext } from "../store/GlobalContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import routeNames from "../constants/routeNames";
import colors from "../constants/colors";

const RootLayoutContent = () => {
  const { appLoading, accessToken } = useGlobalContext();

  const notAuthenticated = !appLoading && accessToken === "";
  const authenticated = !appLoading && accessToken !== "";

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: colors.secondary },
        }}
      >
        <Stack.Screen name={routeNames.index} />

        <Stack.Protected guard={notAuthenticated}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        </Stack.Protected>

        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(app)" options={{ animation: "fade" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalProvider>
          <RootLayoutContent />
        </GlobalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default RootLayout;
