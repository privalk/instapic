export interface ImageProcessor {
    processFrame(
        bitmap: ImageBitmap,
        options: { quality: number; mirror: boolean }
    ): Promise<Blob>;
}