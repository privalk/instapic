// worker/image.ts
import * as Comlink from 'comlink';
import type { ImageProcessor } from './types';

const api: ImageProcessor = {
  async processFrame(
    bitmap: ImageBitmap,
    options: { quality: number; mirror: boolean }
  ): Promise<Blob> {
    const targetAspect = 361 / 538; // 根据实际预览区域比例修改
    
    // 计算最大裁剪区域
    let cropWidth, cropHeight;
    if (bitmap.width / bitmap.height > targetAspect) {
      // 原始图像更宽，按高度裁剪
      cropHeight = bitmap.height;
      cropWidth = cropHeight * targetAspect;
    } else {
      // 原始图像更高，按宽度裁剪
      cropWidth = bitmap.width;
      cropHeight = cropWidth / targetAspect;
    }

    // 居中裁剪坐标
    const sx = (bitmap.width - cropWidth) / 2;
    const sy = (bitmap.height - cropHeight) / 2;

    // 创建裁剪画布
    const cropCanvas = new OffscreenCanvas(cropWidth, cropHeight);
    const ctx = cropCanvas.getContext('2d')!;
    
    // 镜像处理
    if (options.mirror) {
      ctx.translate(cropWidth, 0);
      ctx.scale(-1, 1);
    }

    // 绘制裁剪区域
    ctx.drawImage(
      bitmap,
      sx, sy,          // 源起点
      cropWidth,       // 源裁剪宽度
      cropHeight,      // 源裁剪高度
      0, 0,            // 目标起点
      cropWidth,       // 目标绘制宽度
      cropHeight       // 目标绘制高度
    );
    
    bitmap.close();

    return cropCanvas.convertToBlob({
      type: 'image/jpeg',
      quality: options.quality
    });
  }
};

Comlink.expose(api);