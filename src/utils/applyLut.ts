// src/applyLut.ts
/**
 * 将一张图片应用到已生成的 LUT canvas 上，结果绘到 outputCanvas。
 * 适配按网格排列的 LUT PNG。
 */
export function applyLUT(
    image: HTMLImageElement,
    lutCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
  ): void {
    // 从 dataset 中读取 LUT 原始尺寸和网格列数
    const size = parseInt(lutCanvas.dataset.lutSize || '0', 10);
    const cols = parseInt(lutCanvas.dataset.lutCols || '0', 10);
    if (!size || !cols) {
      throw new Error('LUT Canvas 缺少尺寸信息，请确认 fillLUTOnCanvas 已设置 dataset.lutSize 和 dataset.lutCols');
    }
  
    const ctxLut = lutCanvas.getContext('2d')!;
    const lutData = ctxLut.getImageData(0, 0, lutCanvas.width, lutCanvas.height).data;
  
    // 准备输入图像画布
    const inC = document.createElement('canvas');
    inC.width = image.width;
    inC.height = image.height;
    const inCtx = inC.getContext('2d')!;
    inCtx.drawImage(image, 0, 0);
    const imgData = inCtx.getImageData(0, 0, image.width, image.height);
    const pixels = imgData.data;
  
    // 输出画布
    outputCanvas.width = image.width;
    outputCanvas.height = image.height;
    const outCtx = outputCanvas.getContext('2d')!;
  
    // 对每个像素应用 LUT
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      // 归一化到 [0, size-1]
      const ir = Math.floor((r / 255) * (size - 1));
      const ig = Math.floor((g / 255) * (size - 1));
      const ib = Math.floor((b / 255) * (size - 1));
      // 计算在网格中所在行列
      const col = ib % cols;
      const row = Math.floor(ib / cols);
      // 计算像素在 LUT Canvas 中的坐标
      const x = col * size + ir;
      const y = row * size + ig;
      const idx = 4 * (y * lutCanvas.width + x);
      // 赋值
      pixels[i]     = lutData[idx];
      pixels[i + 1] = lutData[idx + 1];
      pixels[i + 2] = lutData[idx + 2];
      // alpha 保持原样
    }
  
    outCtx.putImageData(imgData, 0, 0);
  }