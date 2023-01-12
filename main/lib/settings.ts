import { app } from "electron";
import { getStoreValue, setStoreValue } from "./store";

export const getOpenAtLogin = () => {
  return getStoreValue("openAtLogin", true);
};

export const setOpenAtLogin = (value: boolean) => {
  setStoreValue("openAtLogin", value);
  app.setLoginItemSettings({
    openAtLogin: value,
  });
};
