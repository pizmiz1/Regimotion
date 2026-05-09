import { Animated, Image, Switch, Text, TouchableOpacity, View } from "react-native";
import PageContainer from "../components/shared/pageContainer";
import { useEffect, useRef, useState } from "react";
import routeNames from "../constants/routeNames";
import { useGlobalContext } from "../store/globalContext";
import { deleteAlert, errorAlert } from "../helpers/alert";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import { AccessDto } from "../../shared/accessdto";
import { JsonDto } from "../../shared/jsondto";
import { get, post } from "../helpers/fetch";
import colors from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { opacityLayout } from "../helpers/layouts";
import { animalColors, animals } from "../constants/animals";
import { generateSlug } from "random-word-slugs";
import Setting from "../components/account/setting";

const AccountScreen = () => {
  const { userSettings, patchUserSettings, accessToken, updateAccessToken, updateModules } = useGlobalContext();

  const navigation = useNavigation();

  const [blurActive, setBlurActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localEnableCompleteAnimation, setLocalEnableCompleteAnimation] = useState(userSettings.enableCompleteAnimation);
  const [localEnableHoldComplete, setLocalEnableHoldComplete] = useState(userSettings.enableHoldComplete);
  const [switchesDisabled, setSwitchesDisabled] = useState(false);
  const [newDigsDisabled, setNewDigsDisabled] = useState(false);
  const [localUserName, setLocalUserName] = useState(userSettings.userName);
  const [localAnimal, setLocalAnimal] = useState(animals[userSettings.userName.split(" ")[1] as keyof typeof animals]);
  const [localAnimalColor, setLocalAnimalColor] = useState(userSettings.userColor);

  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(loadingOpacity, {
      toValue: loading ? 0.6 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  const animalPress = async () => {
    const animalNames = Object.keys(animals) as Array<keyof typeof animals>;
    const colorValues = Object.values(animalColors);

    let animalName = localUserName.split(" ")[1] as keyof typeof animals;
    while (animalNames.length > 1 && animalName === (localUserName.split(" ")[1] as keyof typeof animals)) {
      const randomIndex = Math.floor(Math.random() * animalNames.length);
      animalName = animalNames[randomIndex];
    }

    let animalColor = localAnimalColor;
    while (colorValues.length > 1 && animalColor === localAnimalColor) {
      const randomIndex = Math.floor(Math.random() * colorValues.length);
      animalColor = colorValues[randomIndex];
    }

    const randomAdjective = generateSlug(1, {
      partsOfSpeech: ["adjective"],
    });

    const newUserName = randomAdjective + " " + animalName;

    setNewDigsDisabled(true);

    let newUserSettings = userSettings;
    newUserSettings.userName = newUserName;
    newUserSettings.userColor = animalColor;

    const success = await patchUserSettings(newUserSettings);

    if (!success) {
      return;
    }

    setLocalUserName(newUserName);
    setLocalAnimal(animals[animalName]);
    setLocalAnimalColor(animalColor);

    setNewDigsDisabled(false);
  };

  const signOutOrDelete = async (signOut: boolean) => {
    opacityLayout();
    setLoading(true);

    const passkey = await SecureStore.getItemAsync(storageKeys.passkey);

    const req: AccessDto = {
      email: userSettings.userEmail,
      passkey: passkey!,
    };

    const url = signOut ? "/auth/signOut" : "/auth/deleteAccount";
    const response: JsonDto<any> = await post(url, req, { accessToken: accessToken, updateAccessToken: updateAccessToken });

    if (response.error) {
      errorAlert(response.error);
      setLoading(false);
      return;
    }

    await SecureStore.deleteItemAsync(storageKeys.email);
    await SecureStore.deleteItemAsync(storageKeys.passkey);
    await SecureStore.deleteItemAsync(storageKeys.token);
    updateAccessToken("");
    updateModules([]);

    navigation.navigate(routeNames.signup);
  };

  const toggleEnableCompletionAnimation = async () => {
    const newState = !localEnableCompleteAnimation;
    setLocalEnableCompleteAnimation(newState);
    setSwitchesDisabled(true);

    const newUserSettings = { ...userSettings, enableCompleteAnimation: newState };

    const success = await patchUserSettings(newUserSettings);

    if (!success) {
      setLocalEnableCompleteAnimation(!newState);
    }

    setSwitchesDisabled(false);
  };

  const toggleHoldComplete = async () => {
    const newState = !localEnableHoldComplete;
    setLocalEnableHoldComplete(newState);
    setSwitchesDisabled(true);

    const newUserSettings = { ...userSettings, enableHoldComplete: newState };

    const success = await patchUserSettings(newUserSettings);

    if (!success) {
      setLocalEnableHoldComplete(!newState);
    }

    setSwitchesDisabled(false);
  };

  return (
    <PageContainer
      header="Account"
      setBlurActive={setBlurActive}
      backButton={true}
      backButtonRoute={routeNames.daily}
      backButtonDisabled={loading}
      backButtonStyle={{ opacity: loading ? 0.6 : 1 }}
    >
      <Animated.View style={{ flex: 1, opacity: loadingOpacity }}>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              backgroundColor: localAnimalColor,
              width: 70,
              height: 70,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <Image source={localAnimal} style={{ width: "85%", height: "85%" }} resizeMode="contain" />
          </View>
          <View style={{ marginLeft: 20, justifyContent: "center" }}>
            <Text style={{ color: "white", fontSize: 25, fontWeight: "bold", textTransform: "capitalize" }}>{localUserName}</Text>
            <Text style={{ color: colors.lighter_grey, fontSize: 18 }}>{userSettings.userEmail}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            alignSelf: "flex-start",
            paddingHorizontal: 8,
            paddingVertical: 10,
            borderRadius: 10,
            marginTop: 10,
            opacity: newDigsDisabled ? 0.6 : 1,
          }}
          disabled={loading || newDigsDisabled}
          onPress={animalPress}
        >
          <Text style={{ color: "white" }}>New Digs</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.lighter_grey, marginTop: 30, fontSize: 15 }}>Preferences</Text>
        <View
          style={{
            backgroundColor: "#333438",
            padding: 20,
            borderRadius: 30,
            marginTop: 5,
            gap: 20,
          }}
        >
          <Setting
            isSwitch={true}
            icon="flare"
            text="Complete Animation"
            description="Animation when finishing a module"
            switchValue={localEnableCompleteAnimation}
            switchValueChange={toggleEnableCompletionAnimation}
            switchDisabled={loading || switchesDisabled}
          />
          <Setting
            isSwitch={true}
            icon="gesture-tap-hold"
            text="Hold Complete"
            description="Hold down modules to finish"
            switchValue={localEnableHoldComplete}
            switchValueChange={toggleHoldComplete}
            switchDisabled={loading || switchesDisabled}
            noDivider={true}
          />
        </View>

        <Text style={{ color: colors.lighter_grey, marginTop: 30, fontSize: 15 }}>Account</Text>
        <View
          style={{
            backgroundColor: "#333438",
            padding: 20,
            borderRadius: 30,
            marginTop: 5,
            gap: 20,
          }}
        >
          <Setting
            isSwitch={false}
            icon="logout"
            text="Sign Out"
            iconFillColor={colors.primary}
            onPress={() => {
              signOutOrDelete(true);
            }}
            touchableDisabled={loading}
          />
          <Setting
            isSwitch={false}
            icon="delete-outline"
            text="Delete Account"
            iconFillColor="orangered"
            noDivider={true}
            onPress={() => {
              deleteAlert(
                "Account",
                () => {
                  signOutOrDelete(false);
                },
                "Are you sure you want to delete this account? You will lose all data tied to the account and this action cannot be undone.",
              );
            }}
            touchableDisabled={loading}
          />
        </View>
      </Animated.View>
    </PageContainer>
  );
};

export default AccountScreen;
