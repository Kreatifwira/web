const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("desktopAPI", {
  platform: process.platform,
  electron: process.versions.electron
});