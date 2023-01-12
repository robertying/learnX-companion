import log from "electron-log";
import isDev from "electron-is-dev";

if (!isDev) {
  Object.assign(console, log.functions);
}
