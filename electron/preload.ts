import { contextBridge, ipcRenderer } from 'electron'
// 添加调试日志
console.log('Preload script executed')
// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronPrint', {
  printImage: (params: { blobUrl: string; printerName?: string ,copy?:number}) =>
    ipcRenderer.invoke('silent-print-image', params),
  getPrinters: () => ipcRenderer.invoke('get-printers')
})

// 类型声明（应该放在单独的类型文件中）
declare global {
  interface Window {
    electronPrint: {
      /**
       * 打印图片到指定打印机
       * @param params 包含 blobUrl 和可选 printerName 的对象
       */
      printImage: (params: {
        buffer: ArrayBuffer
        printerName?: string
        copy?: number
      }) => Promise<boolean>

      /**
       * 获取打印机列表
       */
      getPrinters: () => Promise<Electron.PrinterInfo[]>
    }
  }
}