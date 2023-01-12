import { ipcRenderer } from "electron";
import type {
  CourseInfo,
  SemesterInfo,
  UserInfo,
} from "thu-learn-lib-no-native/lib/types";

export const getStoreValue = (key: string, defaultValue?: any) => {
  return ipcRenderer.invoke("getStoreValue", key, defaultValue);
};

export const setStoreValue = (key: string, value: any) => {
  return ipcRenderer.invoke("setStoreValue", key, value);
};

export const restartSync = () => {
  return ipcRenderer.invoke("restartSync");
};

export async function fetcher(key: "userInfo"): Promise<UserInfo>;
export async function fetcher(key: "currentSemester"): Promise<SemesterInfo>;
export async function fetcher(key: ["courses", string]): Promise<CourseInfo[]>;
export async function fetcher(
  key: "userInfo" | "currentSemester" | ["courses", string]
) {
  if (Array.isArray(key)) {
    return ipcRenderer.invoke("fetchData", key[0], key[1]);
  }
  return ipcRenderer.invoke("fetchData", key);
}
