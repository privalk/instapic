import { app, BrowserWindow } from 'electron'
 
app.whenReady().then(() => {
  const win = new BrowserWindow({
    title: 'Main window',
  })
 
  // 当调用“serve”命令时，可以使用“process.env.VITE_DEV_SERVER_URL”`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    //默认地址
    win.loadFile('dist/index.html');
  }
})