// electron-main/index.ts
import { app, BrowserWindow, ipcMain, } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建主窗口
function createWindow() {

  const win = new BrowserWindow(
    {
      // fullscreen: true,
      // 移动端友好配置
      // frame: false, // 隐藏窗口边框
      // kiosk: true, // 真正的全屏模式（类似信息亭模式）
      width: 1920, height: 1080,
      webPreferences: {
        preload: path.join(__dirname, './preload.mjs'), // 预加载脚本
        contextIsolation: true, // 上下文隔离
        nodeIntegration: false, // 禁用 Node.js 集成
        // 启用触控特性
        // enablePreferredSizeMode: true,
        // enableBlinkFeatures: 'TouchEvent',
      }

    }
  )
  // 根据环境加载不同内容
  if (app.isPackaged) {
    win.loadFile(path.join(app.getAppPath(), 'dist/index.html'))
  } else {
    win.loadURL('http://localhost:5173') // 开发模式下的 URL
    win.webContents.openDevTools() // 打开开发者工具
  }
}
app.commandLine.appendSwitch('--enable-features', 'TouchableApp')
app.commandLine.appendSwitch('--force-app-mode') // 强制应用模式
// 应用准备就绪
app.whenReady().then(() => {
  createWindow()
  // console.log(path.join(__dirname, './preload.mjs'))
  // macOS 应用激活事件
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 窗口关闭事件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 打印机 IPC 通信
ipcMain.handle('get-printers', (event) => {
  return BrowserWindow.getAllWindows()[0].webContents.getPrintersAsync()
})

// 核心打印函数
const printImageFile = async (filePath: string, printerName: string, copies: number) => {
  for (let i = 0; i < copies; i++) {
    await new Promise((resolve, reject) => {
      const cmd = `rundll32 C:\\Windows\\System32\\shimgvw.dll,ImageView_PrintTo /pt "${filePath}" "${printerName}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(`打印失败: ${stderr}`);
        else resolve(stdout);
      });
    });
  }
};

ipcMain.handle('silent-print-image', async (_, {
  buffer,
  printerName,
  copies = 1
}: {
  buffer: ArrayBuffer
  printerName?: string
  copies?: number
}) => {
  // 创建临时文件
  const tempDir = path.join(app.getPath('temp'), 'instapic-print')
  await fs.ensureDir(tempDir)
  const tempFile = path.join(tempDir, `${Date.now()}.png`)

  try {
    // 写入图片文件
    await fs.writeFile(tempFile, Buffer.from(buffer))

    // 获取系统打印机
    const printers = await BrowserWindow.getAllWindows()[0].webContents.getPrintersAsync()
    const targetPrinter = printers.find(p => p.name === printerName) || printers[0]

    // 直接打印文件
    await printImageFile(tempFile, targetPrinter.name, copies)
    return { success: true }
  } catch (error) {
    console.error('打印失败:', error)
    return { success: false, error }
  } finally {
    await fs.remove(tempFile).catch(console.error)
  }
})




// 异常处理
process.on('uncaughtException', (error) => {
  console.error('Electron Main Process Error:', error)
})