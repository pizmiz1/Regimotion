import { jwtDecode } from "jwt-decode";
import { JsonDto } from "../../shared/jsondto";
import * as SecureStore from "expo-secure-store";
import storageKeys from "../constants/storageKeys";
import { AccessDto } from "../../shared/accessdto";
import { errorAlert } from "./alert";
import { AccessTokenType } from "../types/accessTokenType";
import { ips } from "../constants/ips";

const baseUrl = "https://twill.onrender.com";
// const baseUrl = ips.Proxy;

const silentAccess = async (
  accessToken: string,
  updateAccessToken: (newAccessToken: string) => void,
  firstLoad?: boolean,
): Promise<string | undefined> => {
  const decodedToken = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  const expired = decodedToken.exp! < currentTime;

  if (expired) {
    const email = await SecureStore.getItemAsync(storageKeys.email);
    const passkey = await SecureStore.getItemAsync(storageKeys.passkey);

    const accessTokenBody: AccessDto = { email: email!, passkey: passkey! };
    const response: JsonDto<string> = await post("/auth/accessToken", accessTokenBody);

    if (response.error) {
      errorAlert(response.error);
      return;
    }

    const token = response.data!;
    await SecureStore.setItemAsync(storageKeys.token, token);
    updateAccessToken(token);
    return token;
  } else if (firstLoad) {
    updateAccessToken(accessToken);
  }
};

export async function post(path: string, body: any): Promise<JsonDto<any>>;
export async function post(path: string, body: any, accessTokenType: AccessTokenType): Promise<JsonDto<any>>;
export async function post(path: string, body: any, accessTokenType?: AccessTokenType): Promise<JsonDto<any>> {
  const fullPath = baseUrl + path;
  const apiUrl = new URL(fullPath);
  let json: JsonDto<any>;

  if (accessTokenType) {
    const newToken = await silentAccess(accessTokenType.accessToken, accessTokenType.updateAccessToken);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${newToken ? newToken : accessTokenType.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    json = await response.json();
  } else {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    json = await response.json();
  }

  return json;
}

export const get = async (path: string, accessTokenType: AccessTokenType, params?: {}, firstLoad?: boolean) => {
  const fullPath = baseUrl + path;
  const apiUrl = new URL(fullPath);
  let json: JsonDto<any>;

  if (params) {
    apiUrl.search = new URLSearchParams(params).toString();
  }

  const newToken = await silentAccess(accessTokenType.accessToken, accessTokenType.updateAccessToken, firstLoad);
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${newToken ? newToken : accessTokenType.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  json = await response.json();

  return json;
};

export const deleteFetch = async (path: string, accessTokenType: AccessTokenType, id: string) => {
  const fullPath = baseUrl + path + "/" + id;
  const apiUrl = new URL(fullPath);
  let json: JsonDto<any>;

  const newToken = await silentAccess(accessTokenType.accessToken, accessTokenType.updateAccessToken);
  const response = await fetch(apiUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${newToken ? newToken : accessTokenType.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  json = await response.json();

  return json;
};

export const patch = async (path: string, body: any, accessTokenType: AccessTokenType) => {
  const fullPath = baseUrl + path;
  const apiUrl = new URL(fullPath);
  let json: JsonDto<any>;

  const newToken = await silentAccess(accessTokenType.accessToken, accessTokenType.updateAccessToken);
  const response = await fetch(apiUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${newToken ? newToken : accessTokenType.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  json = await response.json();

  return json;
};
