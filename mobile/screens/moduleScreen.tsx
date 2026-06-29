import { Animated, Text, View } from "react-native";
import Module from "../components/shared/module";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../store/globalContext";
import DetailsModal from "../components/shared/detailsModal";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../constants/routeNames";
import { MaterialIconButton } from "../components/shared/iconButton";
import PageContainer from "../components/shared/pageContainer";

const ModuleScreen = () => {
  const { modules } = useGlobalContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [blurActive, setBlurActive] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

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

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Animated.Text
          style={{
            color: "white",
            fontSize: 50,
            fontFamily: "Main-Font",
            fontStyle: "italic",
            fontWeight: "bold",
            opacity: headerOpacity,
          }}
        >
          Modules
        </Animated.Text>
        <MaterialIconButton
          name="add"
          size={34}
          color={colors.light_primary}
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>
      <View style={{ marginTop: "8%", flexDirection: "row", gap: 30, flexWrap: "wrap" }}>
        {modules.map((module) => (
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
