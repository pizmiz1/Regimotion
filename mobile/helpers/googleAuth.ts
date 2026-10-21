import Constants, { ExecutionEnvironment } from "expo-constants";

let GoogleSignin: any = null;

if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;

  GoogleSignin.configure({
    webClientId: "642282462247-grv2t2drgo4lobh39takhjoa5md7sf5j.apps.googleusercontent.com",
    scopes: ["email"],
  });
}

export const googleSignInHelper = async (): Promise<string> => {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error("Can't run in expo go.");
  }

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    return response.data?.idToken;
  } catch (error) {
    throw error;
  }
};
