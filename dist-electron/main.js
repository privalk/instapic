import { app, BrowserWindow } from "electron";
app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 1920, height: 1080 });
  if (app.isPackaged) {
    win.loadFile("dist/renderer/index.html");
  } else {
    win.loadURL("http://localhost:5173");
  }
});
