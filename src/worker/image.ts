import * as Comlink from 'comlink';
import type { ImageProcessor } from './types'; // 导入类型

const api:ImageProcessor  = {
    async processFrame(
        bitmap: ImageBitmap,
        options: { quality: number; mirror: boolean }
    ): Promise<Blob> {
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d')!;
        
        if (options.mirror) {
            ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();  // 必须关闭原始 bitmap
        
        return canvas.convertToBlob({
            type: 'image/jpeg',
            quality: options.quality
        });
    }
};

// 关键：暴露 API 接口
Comlink.expose(api);