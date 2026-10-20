import { Animated, StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../store/GlobalContext";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../constants/routeNames";

// Custom Components
import Module from "../components/shared/Module";
import DetailsModal from "../components/shared/DetailsModal";
import PageContainer from "../components/shared/PageContainer";
import { MaterialIconButton } from "../components/shared/IconButton";

const ModuleScreen = () => {
  const { modules } = useGlobalContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [blurActive, setBlurActive] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  const inactiveModules = modules.filter((curr) => {
    return Object.values(curr.days).every((val) => val === false);
  });
  const activeModules = modules.filter((curr) => {
    return Object.values(curr.days).some((val) => val === true);
  });

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: blurActive ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [blurActive]);

  return (
    <PageContainer header="Modules" setBlurActive={setBlurActive} backButton={true}>
      <DetailsModal
        visible={modalVisible}
        setVisible={(deleted: boolean) => {
          if (deleted) {
            navigation.goBack();
          }
          setModalVisible(false);
        }}
      />

      <View style={styles.headerContainer}>
        <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>Modules</Animated.Text>
        <MaterialIconButton
          name="add"
          size={34}
          color={colors.light_primary}
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>

      <View style={styles.moduleContainer}>
        {activeModules.map((module) => (
          <Module
            key={module.id}
            module={module}
            onPress={() => {
              // @ts-ignore
              navigation.navigate(routeNames.moduleDetail, { moduleId: module.id });
            }}
            dailyMod={false}
          />
        ))}
        {inactiveModules.map((module) => (
          <Module
            key={module.id}
            module={module}
            onPress={() => {
              // @ts-ignore
              navigation.navigate(routeNames.moduleDetail, { moduleId: module.id });
            }}
            dailyMod={false}
          />
        ))}
      </View>
    </PageContainer>
  );
};

export default ModuleScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 50,
    fontFamily: "Main-Font",
    fontStyle: "italic",
    fontWeight: "bold",
  },
  moduleContainer: {
    marginTop: "8%",
    flexDirection: "row",
    gap: 30,
    flexWrap: "wrap",
  },
});
