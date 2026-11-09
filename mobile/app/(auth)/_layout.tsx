import { Stack } from "expo-router";
import routeNames from "../../constants/routeNames";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name={routeNames.auth} />
    </Stack>
  );
};

export default AuthLayout;
