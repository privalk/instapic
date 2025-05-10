"use strict";
const electron = require("electron");
console.log("Preload script executed");
electron.contextBridge.exposeInMainWorld("electronPrint", {
  printImage: (params) => electron.ipcRenderer.invoke("silent-print-image", params),
  getPrinters: () => electron.ipcRenderer.invoke("get-printers")
});
