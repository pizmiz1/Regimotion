import { Stack } from "expo-router";
import routeNames from "../../constants/routeNames";

const AppLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name={routeNames.daily} />
      <Stack.Screen name={routeNames.account} options={{ gestureEnabled: true, animation: "slide_from_right" }} />
      <Stack.Screen name={routeNames.modules} options={{ gestureEnabled: true, animation: "slide_from_right" }} />
      <Stack.Screen name={routeNames.moduleDetail} options={{ gestureEnabled: true, animation: "slide_from_right" }} />
    </Stack>
  );
};

export default AppLayout;
