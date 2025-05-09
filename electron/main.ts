import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 1920   , height: 1080 })
  if (app.isPackaged) {
    win.loadFile('dist/renderer/index.html') // 生产环境加载打包后的文件
  } else {
    win.loadURL('http://localhost:5173') // 开发环境连接到 Vite 服务
  }
})