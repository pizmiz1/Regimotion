import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, Keyboard, KeyboardAvoidingView, ViewStyle } from "react-native";
import colors from "../../constants/colors";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { opacityLayoutEaseOut } from "../../helpers/layouts";
import { MaterialIconButton } from "./iconButton";
import { useNavigation } from "@react-navigation/native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { ScrollView } from "react-native-gesture-handler";
import routeNames from "../../constants/routeNames";

interface PageContainerProps {
  children: React.ReactNode;
  header: string;
  setBlurActive: (active: boolean) => void;
  backButton?: boolean;
  backButtonDisabled?: boolean;
  backButtonStyle?: ViewStyle;
  disableScroll?: boolean;
  screenOverlay?: React.ReactNode;
  scrollViewRef?: React.Ref<ScrollView>;
  keyboardPadding?: number;
  userButton?: boolean;
  reordering?: boolean;
}

const PageContainer = ({
  children,
  header,
  setBlurActive,
  backButton,
  backButtonDisabled,
  backButtonStyle,
  disableScroll,
  screenOverlay,
  scrollViewRef,
  keyboardPadding,
  userButton,
  reordering,
}: PageContainerProps) => {
  const [blurActive, setBlurActiveLocal] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: blurActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: blurActive ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [blurActive]);

  const HEADER_HEIGHT = 65 + insets.top;

  const inactiveLocations: readonly [number, number, ...number[]] = [0, 0.05, 0.1, 1];
  const activeLocations: readonly [number, number, ...number[]] = [0, 0.5, 0.7, 0.9];

  const handleScrollBlur = (event: NativeSyntheticEvent<NativeScrollEvent>, blurActive: boolean, setBlurActiveLocal: (active: boolean) => void) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY >= 66 && !blurActive) {
      opacityLayoutEaseOut();
      setBlurActiveLocal(true);
      setBlurActive(true);
    } else if (offsetY < 66 && blurActive) {
      opacityLayoutEaseOut();
      setBlurActiveLocal(false);
      setBlurActive(false);
    }
  };

  const headerButtonPress = () => {
    if (backButton) {
      navigation.goBack();
    } else if (userButton) {
      navigation.navigate(routeNames.account as never);
    }
  };

  const RootScrollView = reordering ? NestableScrollContainer : ScrollView;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondary }} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, height: HEADER_HEIGHT, pointerEvents: "none" }}>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={["black", "black", "rgba(0,0,0,0.5)", "transparent"]}
              locations={blurActive ? activeLocations : inactiveLocations}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          <BlurView intensity={90} tint={"dark"} style={StyleSheet.absoluteFill} />
        </MaskedView>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.Text style={{ opacity: headerOpacity, fontSize: 17, fontWeight: "700", fontFamily: "Main-Font", color: "white" }}>
            {header}
          </Animated.Text>
        </View>
      </View>
      <RootScrollView
        scrollEventThrottle={16}
        onScroll={(e) => {
          handleScrollBlur(e, blurActive, setBlurActiveLocal);
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={false}
        scrollEnabled={!disableScroll}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
      >
        {backButton || userButton ? (
          <Animated.View style={{ height: 40, opacity: buttonOpacity }}>
            <MaterialIconButton
              name={backButton ? "arrow-back" : "person"}
              size={34}
              color={colors.light_primary}
              style={{ paddingHorizontal: "5%", marginTop: "3%", ...backButtonStyle }}
              disabled={backButtonDisabled}
              onPress={headerButtonPress}
            />
          </Animated.View>
        ) : (
          <View style={{ height: 40 }} />
        )}
        <View style={{ padding: "5%", flex: 1 }}>
          {children}
          <View style={{ padding: keyboardPadding ?? 0 }} />
        </View>
      </RootScrollView>

      {screenOverlay}
    </SafeAreaView>
  );
};

export default PageContainer;
