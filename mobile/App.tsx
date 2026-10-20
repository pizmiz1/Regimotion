import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNav from "./navigation/Navigation";
import { GlobalProvider } from "./store/GlobalContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerRootComponent } from "expo";
import { StyleSheet } from "react-native";

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <GlobalProvider>
          <AppNav />
        </GlobalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

registerRootComponent(App);
