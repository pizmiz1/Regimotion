import { ActivityIndicator, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import colors from "../constants/colors";
import Input from "../components/shared/input";
import { useRef, useState } from "react";
import Button from "../components/shared/button";
import { LinearGradient } from "expo-linear-gradient";
import { OtpDto } from "../../shared/otpdto";
import { UserDto } from "../../shared/userdto";
import { post } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import { JsonDto } from "../../shared/jsondto";
import { AccessDto } from "../../shared/accessdto";
import { useGlobalContext } from "../store/globalContext";
import { useNavigation } from "@react-navigation/native";
import routeNames from "../constants/routeNames";
import { opacityLayout } from "../helpers/layouts";
import { OTPInput, OTPInputRef } from "input-otp-native";

const SignupScreen = () => {
  const { updateAccessToken } = useGlobalContext();

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetEmailInput, setResetEmailInput] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const otpRef = useRef<OTPInputRef>(null);

  const navigation = useNavigation();

  const resetState = () => {
    opacityLayout();
    setEmail("");
    setResetEmailInput(!resetEmailInput);
    setVerifyingOtp(false);
    setOtp("");
    setLoading(false);
  };

  const submit = async (fullOtpValue?: string) => {
    if (!verifyingOtp) {
      if (!emailValid) {
        return;
      }

      opacityLayout();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmail = emailRegex.test(email);

      if (!validEmail) {
        setEmailValid(false);
        return;
      }

      setLoading(true);

      const body: OtpDto = {
        email: email,
      };
      const response: JsonDto<UserDto> = await post("/auth/generateOtp", body);

      setLoading(false);

      if (response.error) {
        errorAlert(response.error);
        return;
      }

      setVerifyingOtp(true);
    } else {
      otpRef.current?.blur();
      opacityLayout();
      setLoading(true);

      const body: OtpDto = {
        email: email,
        otp: fullOtpValue,
      };
      const response: JsonDto<AccessDto> = await post("/auth/verifyOtp", body);

      if (response.error) {
        errorAlert(response.error);
        setLoading(false);
        return;
      }

      const accessBody: AccessDto = {
        email: email,
        passkey: response.data!.passkey,
      };
      const accessResponse: JsonDto<AccessDto> = await post("/auth/accessToken", accessBody);

      if (accessResponse.error) {
        errorAlert(accessResponse.error);
        resetState();
        return;
      }

      if (!accessResponse.data!.accessToken) {
        errorAlert("Access Token Undefined");
        resetState();
        return;
      }

      await SecureStore.setItemAsync(storageKeys.email, email);
      await SecureStore.setItemAsync(storageKeys.passkey, accessResponse.data!.passkey);
      await SecureStore.setItemAsync(storageKeys.token, accessResponse.data!.accessToken);

      updateAccessToken(accessResponse.data!.accessToken);

      setLoading(false);
      resetState();

      navigation.navigate(routeNames.daily);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <LinearGradient style={{ flex: 1, alignItems: "center" }} colors={[colors.light_primary, colors.primary]}>
        <Text
          style={{
            fontSize: 50,
            fontWeight: "bold",
            color: "white",
            marginTop: "35%",
            fontFamily: "Main-Font",
            fontStyle: "italic",
            width: "100%",
            textAlign: "center",
          }}
        >
          Welcome!
        </Text>
        <Text
          style={{
            marginTop: "3%",
            color: "white",
            textAlign: "center",
            fontWeight: "500",
            fontSize: 16,
          }}
        >
          Please verify that you are a human.
        </Text>
        <Text
          style={{
            marginTop: "2%",
            color: colors.lightest_grey,
            textAlign: "center",
            fontStyle: "italic",
            fontSize: 15,
          }}
        >
          You will only need to this once!
        </Text>
        <Text
          style={{
            marginTop: "10%",
            marginBottom: "10%",
            color: "white",
            textAlign: "center",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          {verifyingOtp ? "Otp" : "Email"}
        </Text>
        {verifyingOtp ? (
          <OTPInput
            ref={otpRef}
            maxLength={6}
            value={otp}
            onChange={setOtp}
            editable={!loading}
            onComplete={submit}
            render={({ slots }) => (
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  width: "100%",
                }}
              >
                {slots.map((slot, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        width: 48,
                        height: 54,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: slot.isActive || slot.char !== null ? "white" : colors.lighter_grey,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: slot.isActive ? "rgba(255,255,255,0.05)" : "transparent",
                        opacity: loading ? 0.4 : 1,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{slot.char}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          />
        ) : (
          <View style={{ width: "70%" }}>
            <Input
              onChangeText={(text) => {
                setEmailValid(true);
                setEmail(text);
              }}
              reset={resetEmailInput}
              baseBorderColor={colors.primary}
              keyboardType="email-address"
              disabled={loading}
              submit={submit}
            />
            {!emailValid && <Text style={{ marginTop: "1.5%", color: colors.warning }}>Please enter valid email.</Text>}
          </View>
        )}
        {loading ? (
          <ActivityIndicator size="large" color={colors.lightest_grey} style={{ marginTop: "5%" }} />
        ) : (
          <Button
            label="Submit"
            onPress={submit}
            style={{ backgroundColor: colors.secondary, marginTop: "5%", width: "70%" }}
            disabled={(!verifyingOtp && email.length === 0) || (verifyingOtp && otp.length !== 6)}
          />
        )}
        {verifyingOtp && !loading && (
          <Button label="Reset" onPress={resetState} style={{ backgroundColor: colors.dark_grey, marginTop: "3%", width: "70%" }} />
        )}
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
