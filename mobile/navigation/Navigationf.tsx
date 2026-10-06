import { createStaticNavigation, StaticParamList } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// screens
import SplashScreen from "../screens/SplashScreen";
import routeNames from "../constants/routeNames";
import SignupScreen from "../screens/SignupScreen";
import ModuleScreen from "../screens/ModuleScreen";
import DailyScreen from "../screens/DailyScreen";
import ModuleDetailScreen from "../screens/ModuleDetailScreen";
import AccountScreen from "../screens/AccountScreen";

const AppNav = () => {
  const Stack = createNativeStackNavigator({
    screenOptions: {
      headerShown: false,
    },
    initialRouteName: routeNames.splash,
    screens: {
      Splash: {
        screen: SplashScreen,
      },
      Signup: {
        screen: SignupScreen,
      },
      Daily: {
        screen: DailyScreen,
        options: ({ navigation }) => {
          const state = navigation.getState();
          const previousRoute = state.routes[state.index - 1];

          return {
            animation:
              previousRoute?.name === routeNames.moduleDetail ||
              previousRoute?.name === routeNames.module ||
              previousRoute?.name === routeNames.account
                ? "slide_from_left"
                : "slide_from_right",
            gestureEnabled: false,
          };
        },
      },
      Account: {
        screen: AccountScreen,
        options: { gestureEnabled: true },
      },
      Module: {
        screen: ModuleScreen,
        options: ({ navigation }) => {
          const state = navigation.getState();
          const previousRoute = state.routes[state.index - 1];

          return {
            animation: previousRoute?.name === routeNames.moduleDetail ? "slide_from_left" : "slide_from_right",
            gestureEnabled: true,
          };
        },
      },
      ModuleDetail: {
        screen: ModuleDetailScreen,
        options: { gestureEnabled: true },
      },
    },
  });

  const Navigation = createStaticNavigation(Stack);

  return <Navigation />;
};

export default AppNav;
