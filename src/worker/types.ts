export interface ImageProcessor {
    processFrame(
        bitmap: ImageBitmap,
        options: { quality: number; mirror: boolean;aspectRatio: number; }
    ): Promise<Blob>;
}