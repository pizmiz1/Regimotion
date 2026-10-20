import { NavigationContainer, ParamListBase } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGlobalContext } from "../store/GlobalContext";

// Screen
import SplashScreen from "../screens/SplashScreen";
import routeNames from "../constants/routeNames";
import SignupScreen from "../screens/SignupScreen";
import ModuleScreen from "../screens/ModuleScreen";
import DailyScreen from "../screens/DailyScreen";
import ModuleDetailScreen from "../screens/ModuleDetailScreen";
import AccountScreen from "../screens/AccountScreen";

const Stack = createNativeStackNavigator();

const AppNav = () => {
  const { appLoading, accessToken } = useGlobalContext();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {appLoading && <Stack.Screen name="Splash" component={SplashScreen} />}

        {!appLoading && accessToken === "" && <Stack.Screen name="Signup" component={SignupScreen} />}

        {!appLoading && accessToken !== "" && (
          <>
            <Stack.Screen
              name="Daily"
              component={DailyScreen}
              options={({ navigation }: { navigation: NativeStackNavigationProp<ParamListBase, string, undefined> }) => {
                const state = navigation.getState();
                const previousRoute = state.routes[state.index - 1];

                return {
                  animation:
                    previousRoute !== undefined &&
                    (previousRoute.name === routeNames.moduleDetail ||
                      previousRoute.name === routeNames.module ||
                      previousRoute.name === routeNames.account)
                      ? "slide_from_left"
                      : "slide_from_right",
                  gestureEnabled: false,
                };
              }}
            />
            <Stack.Screen name="Account" component={AccountScreen} options={{ gestureEnabled: true, animation: "slide_from_right" }} />
            <Stack.Screen
              name="Module"
              component={ModuleScreen}
              options={({ navigation }: { navigation: NativeStackNavigationProp<ParamListBase, string, undefined> }) => {
                const state = navigation.getState();
                const previousRoute = state.routes[state.index - 1];

                return {
                  animation: previousRoute?.name === routeNames.moduleDetail ? "slide_from_left" : "slide_from_right",
                  gestureEnabled: true,
                };
              }}
            />
            <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} options={{ gestureEnabled: true, animation: "slide_from_right" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNav;
