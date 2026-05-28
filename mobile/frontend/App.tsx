import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNav from "./navigation/navigation";
import GlobalProvider from "./store/globalProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlobalProvider>
          <AppNav />
        </GlobalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
