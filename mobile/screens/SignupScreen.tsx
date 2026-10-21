import { Animated, Image, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import colors from "../constants/colors";
import { useEffect, useRef, useState } from "react";
import { OtpDto } from "../../shared/otpdto";
import { UserDto } from "../../shared/userdto";
import { post } from "../helpers/fetch";
import { errorAlert } from "../helpers/alert";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import { JsonDto } from "../../shared/jsondto";
import { AccessDto } from "../../shared/accessdto";
import { useGlobalContext } from "../store/GlobalContext";
import { OTPInput, OTPInputRef } from "input-otp-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { FontAwesome5 } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { OtherAuthDto } from "../../shared/otherauthdto";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleOneTapSignIn, isSuccessResponse } from "react-native-nitro-google-signin";

// Custom Components
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";

GoogleOneTapSignIn.configure({
  webClientId: "642282462247-grv2t2drgo4lobh39takhjoa5md7sf5j.apps.googleusercontent.com",
  scopes: ["email"],
});

type Auth_State = "Base" | "VerifyingOtp" | "HiddenEmail" | "HiddenVerifyingOtp";

const headerText: Record<Auth_State, string> = {
  Base: "Welcome!",
  VerifyingOtp: "Verify",
  HiddenEmail: "Confirm",
  HiddenVerifyingOtp: "Verify",
};

const headerSubText: Record<Auth_State, string> = {
  Base: "Enter your email to recieve a code.",
  VerifyingOtp: "Enter your code.",
  HiddenEmail: "To find any existing account history, please verify your primary email address.",
  HiddenVerifyingOtp: "Enter your code.",
};

const SignupScreen = () => {
  const { updateAccessToken } = useGlobalContext();

  const [authState, setAuthState] = useState<Auth_State>("Base");
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetEmailInput, setResetEmailInput] = useState(false);

  const otpRef = useRef<OTPInputRef>(null);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const errorHeight = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const resetState = () => {
    setEmail("");
    setOtp("");
    setResetEmailInput(!resetEmailInput);
    transitionState("Base");
  };

  const successfulIdentityFlow = async (email: string, passkey: string) => {
    const accessBody: AccessDto = {
      email: email,
      passkey: passkey,
    };
    const accessResponse: JsonDto<AccessDto> = await post("/auth/accessToken", accessBody);

    if (accessResponse.error) {
      errorAlert(accessResponse.error);
      resetState();
      return;
    }

    if (accessResponse.data === undefined || accessResponse.data.accessToken === undefined) {
      errorAlert("Access Token Undefined");
      resetState();
      return;
    }

    await SecureStore.setItemAsync(storageKeys.email, email);
    await SecureStore.setItemAsync(storageKeys.passkey, accessResponse.data.passkey);
    await SecureStore.setItemAsync(storageKeys.token, accessResponse.data.accessToken);
    updateAccessToken(accessResponse.data?.accessToken!);
  };

  const submit = async (fullOtpValue?: string) => {
    if (authState === "Base" || authState === "HiddenEmail") {
      if (!emailValid) {
        return;
      }

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

      if (response.error) {
        errorAlert(response.error);
        setLoading(false);
        return;
      }

      transitionState("VerifyingOtp");
    } else {
      otpRef.current?.blur();
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

      await successfulIdentityFlow(email, response.data?.passkey!);
    }
  };

  const appleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      if (credential.identityToken) {
        const body: OtherAuthDto = {
          identityToken: credential.identityToken,
        };
        const response: JsonDto<AccessDto> = await post("/auth/apple", body);

        if (response.error) {
          errorAlert(response.error);
          setLoading(false);
          return;
        }

        if (response.data === undefined || response.data.email === undefined || response.data.passkey === undefined) {
          errorAlert("Bad Response");
          resetState();
          return;
        }

        if (response.data.privateAppleEmail !== undefined && response.data.privateAppleEmail === true) {
          transitionState("HiddenEmail");
          return;
        }

        await successfulIdentityFlow(response.data.email, response.data.passkey);
      }
    } catch (error: any) {
      errorAlert("Unable to Sign In With Apple");
    }
  };

  const googleSignIn = async () => {
    try {
      const result = await GoogleOneTapSignIn.signIn();

      if (isSuccessResponse(result)) {
        const body: OtherAuthDto = {
          identityToken: result.data.idToken,
        };
        const response: JsonDto<AccessDto> = await post("/auth/google", body);

        if (response.error) {
          errorAlert(response.error);
          setLoading(false);
          return;
        }

        if (response.data === undefined || response.data.email === undefined || response.data.passkey === undefined) {
          errorAlert("Bad Response");
          resetState();
          return;
        }

        await successfulIdentityFlow(response.data.email, response.data.passkey);
      }
    } catch (error: any) {
      errorAlert("Unable to Sign In With Google");
    }
  };

  const transitionState = (authState: Auth_State) => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setAuthState(authState);
      setLoading(false);

      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.timing(errorHeight, {
      toValue: !emailValid ? 24 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [emailValid]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.imgContainer}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulseAnim }]}>
            <Svg height="100%" width="100%" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="tightGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#322475" stopOpacity="1" />
                  <Stop offset="35%" stopColor="#251a5c" stopOpacity="1" />
                  <Stop offset="70%" stopColor="#141226" stopOpacity="1" />
                  <Stop offset="95%" stopColor="#0b0c10" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#0b0c10" stopOpacity="1" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="200" height="200" fill="url(#tightGlow)" />
            </Svg>
          </Animated.View>
          <Image style={styles.img} source={require("./../assets/logo-clear.png")} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [
                {
                  translateY: contentOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.headerText}>{headerText[authState]}</Text>
          <Text style={styles.headerSubText}>{headerSubText[authState]}</Text>
          <Text style={styles.inputLabel}>{authState === "VerifyingOtp" ? "Otp" : "Email"}</Text>

          {authState === "VerifyingOtp" ? (
            <OTPInput
              ref={otpRef}
              maxLength={6}
              value={otp}
              onChange={setOtp}
              editable={!loading}
              onComplete={submit}
              render={({ slots }) => (
                <View style={styles.otpContainer}>
                  {slots.map((slot, index) => {
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpSlot,
                          {
                            borderColor: slot.isActive || slot.char !== null ? "white" : colors.lighter_grey,
                            backgroundColor: slot.isActive ? "rgba(255,255,255,0.05)" : "transparent",
                            opacity: loading ? 0.4 : 1,
                          },
                        ]}
                      >
                        <Text style={styles.otpText}>{slot.char}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            />
          ) : (
            <View style={styles.emailContainer}>
              <Input
                onChangeText={(text) => {
                  setEmailValid(true);
                  setEmail(text);
                }}
                reset={resetEmailInput}
                baseBorderColor={colors.light_secondary}
                keyboardType="email-address"
                disabled={loading}
                submit={submit}
              />

              <Animated.View
                style={[
                  styles.emailWarningContainer,
                  {
                    height: errorHeight,
                    opacity: errorHeight.interpolate({
                      inputRange: [0, 24],
                      outputRange: [0, 1],
                    }),
                  },
                ]}
              >
                <Text style={styles.emailWarningText}>Please enter valid email.</Text>
              </Animated.View>
            </View>
          )}

          <Button
            label={loading ? "Loading..." : "Submit"}
            onPress={submit}
            style={[styles.btnBase, styles.submitBtn]}
            disabled={
              authState === "Base" ||
              (authState === "HiddenEmail" && email.length === 0) ||
              authState === "VerifyingOtp" ||
              (authState === "HiddenVerifyingOtp" && otp.length !== 6) ||
              loading
            }
          />
          {authState !== "Base" && <Button label="Reset" onPress={resetState} style={[styles.btnBase, styles.resetBtn]} />}

          {authState === "Base" && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or sign in with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.otherOptContainer}>
                <TouchableOpacity style={[styles.otherOpt, { opacity: loading ? 0.4 : 1 }]} onPress={googleSignIn} disabled={loading}>
                  <Image style={{ height: 32, aspectRatio: 1 }} source={require("./../assets/google.png")} />
                  <Text style={styles.otherOptText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.otherOpt, { opacity: loading ? 0.4 : 1 }]} onPress={appleSignIn} disabled={loading}>
                  <FontAwesome5 name="apple" size={32} color="#fff" />
                  <Text style={styles.otherOptText}>Apple</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  imgContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    height: 120,
    aspectRatio: 1,
    resizeMode: "contain",
    zIndex: 1,
  },
  headerText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
    marginTop: 0,
    fontFamily: "Main-Font",
    fontStyle: "italic",
    width: "100%",
    textAlign: "center",
  },
  headerSubText: {
    marginTop: "3%",
    color: colors.lighter_grey,
    textAlign: "center",
    fontSize: 16,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  inputLabel: {
    marginTop: "10%",
    marginBottom: "2%",
    color: "white",
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
  },
  otpContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  otpSlot: {
    width: 48,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  otpText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emailContainer: {
    width: "70%",
  },
  emailWarningContainer: {
    overflow: "hidden",
  },
  emailWarningText: {
    marginTop: "1.5%",
    color: colors.warning,
  },
  btnBase: {
    marginTop: 15,
    width: "70%",
  },
  submitBtn: {
    backgroundColor: colors.primary,
  },
  resetBtn: {
    backgroundColor: colors.dark_grey,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
  },
  divider: {
    borderColor: colors.medium_grey,
    borderBottomWidth: 1,
    width: "25%",
  },
  dividerText: {
    color: colors.lighter_grey,
  },
  otherOptContainer: {
    flexDirection: "row",
    marginTop: 30,
    gap: 20,
  },
  otherOpt: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 10,
  },
  otherOptText: {
    color: "white",
    fontSize: 16,
  },
});
