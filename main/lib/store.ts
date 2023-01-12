import fs from "fs-extra";
import type Store from "electron-store";

let store: Store | null = null;

export let configPath = process.argv[2];

const isElectron = () => {
  return process.versions.hasOwnProperty("electron");
};

const getStore = () => {
  if (!store) {
    const Store = require("electron-store") as any;
    store = new Store({
      defaults: {
        username: "",
        password: "",
        lastSyncTime: new Date(),
        deviceTokens: [],
        excludedCourses: [],
        openAtLogin: true,
      },
    }) as Store;
    configPath = store.path;
  }
  return store;
};

export const setStoreValue = async (key: string, value: any) => {
  if (isElectron()) {
    const store = getStore();
    store.set(key, value);
  } else {
    const config = await fs.readJSON(configPath);
    config[key] = value;
    await fs.writeJSON(configPath, config);
  }
};

export const getStoreValue = async (key: string, defaultValue?: any) => {
  if (isElectron()) {
    const store = getStore();
    return store.get(key, defaultValue);
  } else {
    const config = await fs.readJSON(configPath);
    return config[key] ?? defaultValue;
  }
};

export const getConfig = async () => {
  if (isElectron()) {
    const store = getStore();
    return store.store;
  } else {
    const config = await fs.readJSON(configPath);
    return config;
  }
};
