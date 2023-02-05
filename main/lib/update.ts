import { autoUpdater } from "electron-updater";
import isDev from "electron-is-dev";

export const checkForUpdatesAndNotify = async () => {
  return autoUpdater.checkForUpdatesAndNotify({
    title: "learnX Companion 应用更新",
    body: "新版本已被下载，将在下次应用启动时自动安装。",
  });
};

if (!isDev) {
  checkForUpdatesAndNotify();
  setInterval(() => {
    checkForUpdatesAndNotify();
  }, 60 * 60 * 1000);
}

autoUpdater.on("error", (message) => {
  console.error("Auto update failed", message);
});
