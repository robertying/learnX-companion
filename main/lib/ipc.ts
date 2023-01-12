import { ipcMain, shell, app } from "electron";
import { setStoreValue, getStoreValue, configPath } from "./store";
import { login, dataSource } from "./data";
import { setOpenAtLogin } from "./settings";
import { start, stop } from "../sync";

ipcMain.handle("getStoreValue", (event, key, defaultValue) => {
  return getStoreValue(key, defaultValue);
});

ipcMain.handle("setStoreValue", (event, key, value) => {
  return setStoreValue(key, value);
});

ipcMain.handle(
  "fetchData",
  async (
    event,
    key: "userInfo" | "currentSemester" | "courses",
    semesterId: string
  ) => {
    switch (key) {
      case "userInfo":
        await login();
        return dataSource.getUserInfo();
      case "currentSemester":
        return dataSource.getCurrentSemester();
      case "courses":
        const courses = await dataSource.getCourseList(semesterId);
        return courses.sort((a, b) => a.id.localeCompare(b.id));
      default:
        break;
    }
  }
);

ipcMain.handle("openConfigFile", (event) => {
  shell.showItemInFolder(configPath);
});

ipcMain.handle("getVersion", (event) => {
  return app.getVersion();
});

ipcMain.handle("setOpenAtLogin", (event, value) => {
  setOpenAtLogin(value);
});

ipcMain.handle("restartSync", () => {
  stop();
  return start();
});
