import { defineStore } from 'pinia'

export const useCameraStore = defineStore('camera', {
  state: () => ({
    mediaStream: null as MediaStream | null,
    activeComponents: 0, // 使用摄像头的组件计数器
    brightness: 0,
    blur: 0,
  }),
  actions: {
    // 初始化摄像头
    async initCamera() {
      try {
        if (!this.mediaStream) {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          })
        }
        this.activeComponents++
      } catch (error) {
        console.error('摄像头初始化失败:', error)
        throw error
      }
    },

    // 释放摄像头
    releaseCamera() {
      this.activeComponents--
      if (this.activeComponents <= 0 && this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
        this.activeComponents = 0
      }
    },

    // 更新处理参数
    setBrightness(value: number) {
      this.brightness = value
    },
    
    setBlur(value: number) {
      this.blur = value
    }
  }
})