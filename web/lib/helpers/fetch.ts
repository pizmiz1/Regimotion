import { cacheLife, cacheTag } from "next/cache";
import { JsonDto } from "../../../shared/jsondto";

export const get = async (path: string, accessToken: string, dataTag: string, params?: {}): Promise<JsonDto<any>> => {
  // Forces fresh data after 5 min or updateTag()
  "use cache";
  cacheLife({
    stale: Number(process.env.CACHE_STALE) || 30, // 30 Seconds
    revalidate: Number(process.env.CACHE_REVALIDATE) || 60, // 1 Min
    expire: Number(process.env.CACHE_EXPIRE) || 60, // 1 Min
  });
  cacheTag(dataTag);

  const fullPath = process.env.BACKEND_URL + path;
  const apiUrl = new URL(fullPath);

  if (params) {
    apiUrl.search = new URLSearchParams(params).toString();
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: headers,
  });

  const json = (await response.json()) as JsonDto<any>;

  return json;
};

export const post = async (path: string, body: any, accessToken?: string): Promise<JsonDto<any>> => {
  const fullPath = process.env.BACKEND_URL + path;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(fullPath, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as JsonDto<any>;

  return json;
};

export const patch = async (path: string, body: any, accessToken: string): Promise<JsonDto<any>> => {
  const fullPath = process.env.BACKEND_URL + path;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(fullPath, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as JsonDto<any>;

  return json;
};

export const deleteFetch = async (path: string, accessToken: string, id: string) => {
  const fullPath = process.env.BACKEND_URL + path + "/" + id;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(fullPath, {
    method: "DELETE",
    headers: headers,
  });

  const json = (await response.json()) as JsonDto<any>;

  return json;
};
