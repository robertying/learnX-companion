import { dialog } from "electron";
import { autoUpdater } from "electron-updater";
import isDev from "electron-is-dev";

if (!isDev) {
  autoUpdater.checkForUpdates();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);
}

autoUpdater.on("update-downloaded", ({ version, releaseName }) => {
  const dialogOpts = {
    type: "info",
    buttons: ["重启应用", "稍后再说"],
    title: "应用更新",
    message: releaseName ?? version,
    detail: "新版本已经下载完成。重启应用以更新。",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (message) => {
  console.error("Auto update failed", message);
});
