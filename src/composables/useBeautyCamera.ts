import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import QueenEngine, {
    kQueenBeautyType,
    kQueenBeautyParams,
    kQueenBeautyFaceShapeType
} from 'aliyun-queen-engine';
import { useJourneyStore } from '@/stores/journey';

export function useQueenBeauty(videoElementRef: Ref<HTMLVideoElement | null>, cameraStream = ref<MediaStream | null>(null)) {
    const journeyStore = useJourneyStore();
    const queenEngine = new QueenEngine();
    const sdkLicenseKey = ''; // TODO: 填入你的 licenseKey


    const initQueenEngine = () => {
        return new Promise<void>((resolve) => {
            queenEngine.init(
                sdkLicenseKey,
                () => {
                    console.log('beautyStrength:'+journeyStore.beautyStrength);
                    queenEngine.setQueenBeautyType(kQueenBeautyType.SkinBuffing, true);
                    queenEngine.setQueenBeautyParams(kQueenBeautyParams.SkinBuffing, journeyStore.beautyStrength);

                    queenEngine.setQueenBeautyType(kQueenBeautyType.SkinWhiting, true);
                    queenEngine.setQueenBeautyParams(kQueenBeautyParams.Whitening, journeyStore.beautyStrength);

                    // queenEngine.setQueenBeautyType(kQueenBeautyType.AutoFilter, true);
                    queenEngine.setQueenBeautyParams(kQueenBeautyParams.SkinRed, 0.2);


                    //   queenEngine.setQueenBeautyType(kQueenBeautyType.FaceShape, true);
                    //   queenEngine.setFaceShape(kQueenBeautyFaceShapeType.ThinFace, journeyStore.beautyStrength);
                    //   queenEngine.setFaceShape(kQueenBeautyFaceShapeType.LowerJaw, journeyStore.beautyStrength);

                    resolve();
                },
                (progress) => {
                    console.log('Queen SDK 加载进度：', progress);
                }
            );
        });
    };

    const startCamera = async () => {
        cameraStream.value = await queenEngine.openCameraAndRender();
        console.log('cameraStream:', cameraStream);
        if (videoElementRef.value) {
            videoElementRef.value.srcObject = cameraStream.value;
            videoElementRef.value.play();
        }
    };

    const setupBeautyWatcher = () => {
        watch(
            () => journeyStore.beautyStrength,
            (val) => {
                queenEngine.setQueenBeautyParams(kQueenBeautyParams.SkinBuffing, val);
                queenEngine.setQueenBeautyParams(kQueenBeautyParams.Whitening, val);
                queenEngine.setFaceShape(kQueenBeautyFaceShapeType.ThinFace, val);
                queenEngine.setFaceShape(kQueenBeautyFaceShapeType.LowerJaw, val);
            }
        );
    };

    const cleanupQueenEngine = () => {
        try {
            console.log('清理 queenEngine 资源');
            console.log('cameraStream:', cameraStream.value);
            if (cameraStream.value) {
                queenEngine.stopCamera();
                cameraStream.value.getTracks().forEach((track) => {
                    track.stop();
                })
            }




        } catch (err) {
            console.warn('清理 queenEngine 资源时出错：', err);
        }
    };

    /**
     * 拍摄动态照片（返回 base64 图像）
     */
    const capturePhoto = (): string | null => {
        const video = videoElementRef.value;
        if (!video) return null;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 返回 base64 图像数据（也可以用 toBlob 回传 blob）
        return canvas.toDataURL('image/png');
    };

    const startQueenEngine = async () => {
        await initQueenEngine();
        await startCamera();
        setupBeautyWatcher();
    }



    return {
        startQueenEngine,
        cleanupQueenEngine,
        queenEngine,
        capturePhoto, // 暴露拍照方法
    };
}
