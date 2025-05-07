<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas-container">
      <canvas ref="canvas"></canvas>
      <div v-for="(img, index) in images" :key="index" class="draggable-image" :style="getImageStyle(img)">
        <img :src="img.src" :style="{ opacity: img.opacity }" />
      </div>
    </div>
    <button @click="exportCanvas">Export Image</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import interact from 'interactjs'

interface DraggableImage {
  src: string
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
}

// 响应式数据
const images: Ref<DraggableImage[]> = ref([
  { src: '/1.jpg', x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  { src: '/2.jpg', x: 200, y: 0, scale: 1, rotate: 0, opacity: 1 },
  // 添加更多图片...
])

const canvasContainer: Ref<HTMLElement | null> = ref(null)
const canvas: Ref<HTMLCanvasElement | null> = ref(null)

// 样式计算
const getImageStyle = (img: DraggableImage) => ({
  left: `${img.x}px`,
  top: `${img.y}px`,
  transform: `scale(${img.scale}) rotate(${img.rotate}deg)`,
})

// Interact.js 初始化
onMounted(() => {
  console.log(canvasContainer.value, canvas.value)
  if (!canvasContainer.value || !canvas.value) return

  // 设置画布尺寸
  const containerRect = canvasContainer.value.getBoundingClientRect()
  canvas.value.width = containerRect.width
  canvas.value.height = containerRect.height

  // 初始化交互
  initInteract()
})

const initInteract = () => {
  interact('.draggable-image')
    .draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: canvasContainer.value!,
          endOnly: true,
        }),
      ],
      listeners: {
        move: handleDragMove,
      },
    })
  
    .gesturable({
      listeners: {
        move: handleGestureMove,
      },
      // 启用手势识别
      enabled: true,
    })


}


const handleGestureMove = (event: Interact.GestureEvent) => {
  const target = event.target as HTMLElement
  const index = Array.from(target.parentNode!.children).indexOf(target) - 1
  const img = images.value[index]

  img.scale = event.scale
  img.rotate = event.angle

  // 限制最小/最大缩放比例
  img.scale = Math.min(Math.max(img.scale, 0.1), 10)
}

// 事件处理
const handleDragMove = (event: Interact.InteractEvent) => {
  const target = event.target as HTMLElement
  const index = Array.from(target.parentNode!.children).indexOf(target) - 1
  images.value[index].x += event.dx
  images.value[index].y += event.dy
}



// Canvas 导出
const exportCanvas = async () => {
  if (!canvas.value || !canvasContainer.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  await Promise.all(
    images.value.map(async (imgConfig, index) => {
      const imgElement = await loadImage(imgConfig.src)
      const domElement = canvasContainer.value!.children[index + 1] as HTMLElement
      const rect = domElement.getBoundingClientRect()
      const containerRect = canvasContainer.value!.getBoundingClientRect()

      const x = rect.left - containerRect.left
      const y = rect.top - containerRect.top

      // 获取内部img元素的原始尺寸
      const imgChild = domElement.querySelector('img')
      if (!imgChild) return
      const width = imgChild.offsetWidth
      const height = imgChild.offsetHeight

      ctx.save()
      // 计算中心点（基于变换后的位置）
      ctx.translate(x + rect.width / 2, y + rect.height / 2)
      ctx.rotate((imgConfig.rotate * Math.PI) / 180)
      ctx.scale(imgConfig.scale, imgConfig.scale)

      // 使用原始尺寸绘制，应用缩放和旋转
      ctx.drawImage(
        imgElement,
        -width / 2,
        -height / 2,
        width,
        height
      )

      ctx.restore()
    })
  )

  const link = document.createElement('a')
  link.download = 'composition.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}

// 图片加载
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 800px;
  height: 600px;
  border: 1px solid #ccc;
}

.draggable-image {
  position: absolute;
  cursor: move;
  touch-action: none;
  user-select: none;
}

.draggable-image img {
  width: 200px;
  height: auto;
}
</style>