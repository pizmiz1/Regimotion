import { createStaticNavigation, StaticParamList } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// screens
import SplashScreen from "../screens/splashScreen";
import routeNames from "../constants/routeNames";
import SignupScreen from "../screens/signupScreen";
import ModuleScreen from "../screens/moduleScreen";
import DailyScreen from "../screens/dailyScreen";
import ModuleDetailScreen from "../screens/moduleDetailScreen";
import AccountScreen from "../screens/accountScreen";

const AppNav = () => {
  const Stack = createNativeStackNavigator({
    screenOptions: {
      headerShown: false,
    },
    initialRouteName: routeNames.splash,
    screens: {
      Splash: {
        screen: SplashScreen,
        options: { gestureEnabled: false },
      },
      Signup: {
        screen: SignupScreen,
        options: { animation: "fade", gestureEnabled: false },
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
