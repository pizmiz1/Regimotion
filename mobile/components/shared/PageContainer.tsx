import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, ViewStyle } from "react-native";
import colors from "../../constants/colors";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { opacityLayoutEaseOut } from "../../helpers/layouts";
import { useNavigation } from "@react-navigation/native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { ScrollView, RefreshControl } from "react-native-gesture-handler";
import routeNames from "../../constants/routeNames";

// Custom Components
import { MaterialIconButton } from "./IconButton";

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
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
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
  refreshing,
  onRefresh,
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      <View style={[styles.headerContainer, { height: HEADER_HEIGHT }]}>
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

        <View style={styles.headerTextContainer}>
          <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>{header}</Animated.Text>
        </View>
      </View>

      <RootScrollView
        scrollEventThrottle={16}
        onScroll={(e) => {
          handleScrollBlur(e, blurActive, setBlurActiveLocal);
        }}
        contentContainerStyle={styles.scrollContainer}
        removeClippedSubviews={false}
        scrollEnabled={!disableScroll}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
        refreshControl={
          refreshing !== undefined && onRefresh !== undefined ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lightest_grey} />
          ) : undefined
        }
      >
        {backButton || userButton ? (
          <Animated.View style={[styles.topBtnContainer, { opacity: buttonOpacity }]}>
            <MaterialIconButton
              name={backButton ? "arrow-back" : "person"}
              size={34}
              color={colors.light_primary}
              style={[styles.topBtn, backButtonStyle]}
              disabled={backButtonDisabled}
              onPress={headerButtonPress}
            />
          </Animated.View>
        ) : (
          <View style={styles.blankTop} />
        )}
        <View style={styles.content}>
          {children}
          <View style={{ padding: keyboardPadding ?? 0 }} />
        </View>
      </RootScrollView>

      {screenOverlay}
    </SafeAreaView>
  );
};

export default PageContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: "none",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Main-Font",
    color: "white",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topBtnContainer: {
    height: 40,
  },
  topBtn: {
    paddingHorizontal: "5%",
    marginTop: "3%",
  },
  blankTop: {
    height: 40,
  },
  content: {
    padding: "5%",
    flex: 1,
  },
});
