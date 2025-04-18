<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back">
                <!-- <img src="/GridSelect/btn_Back.svg" alt="btn_back" width="74px" height="74px" /> -->
            </div>
            <img src="\BeautyFilter\title_BeautyFilter.svg" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="left"><v-slider :max="1" :min="0" :step="0.1" class="custom-slider" color="white"
                    thumb-color="black" track-color="#CDCDCD" direction="vertical"></v-slider>
                <img src="\BeautyFilter\text_BeautyFilter.svg" />
            </div>

            <div class="right">
                <div class="cameraArea">
                    <video ref="videoElement" class="video-preview" autoplay playsinline></video>
                    <canvas ref="canvasElement" class="canvas-preview"></canvas>
                </div>
                <img class="btn_startPhoto" src="\BeautyFilter\btn_startPhoto.svg" />
            </div>
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';

export default defineComponent({

    setup() {
        const videoElement = ref<HTMLVideoElement | null>(null);
        const canvasElement = ref<HTMLCanvasElement | null>(null);
        let animationFrameId: number;

        // 初始化摄像头
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                if (videoElement.value) {
                    videoElement.value.srcObject = stream;
                }
                startProcessing();
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        };

        // 图像处理
        const applyEffects = () => {
            if (!videoElement.value || !canvasElement.value) return;

            const ctx = canvasElement.value.getContext('2d');
            if (!ctx) return;

            // 设置canvas尺寸匹配视频
            const video = videoElement.value;
            canvasElement.value.width = video.videoWidth;
            canvasElement.value.height = video.videoHeight;

            animationFrameId = requestAnimationFrame(applyEffects);
        };

        const startProcessing = () => {
            applyEffects();
        };

        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_BeautyFilter);
        let timer: number;
        // 格式化时间为XX:XX
        const formattedTime = computed(() => {
            const mins = Math.floor(timeLeft.value / 60);
            const secs = timeLeft.value % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });
        // const ClickToBack = () => {
        //     router.back();
        // };
        // 启动定时器
        onMounted(() => {
            initCamera();
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    // router.back();
                    clearInterval(timer);
                }
            }, 1000);
        });

        // 清除定时器
        onUnmounted(() => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (videoElement.value?.srcObject) {
                (videoElement.value.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            clearInterval(timer);
        });

        const JourneyStore = useJourneyStore();

        return { formattedTime, videoElement, canvasElement };
    },
});
</script>

<style scoped>
.btn_startPhoto:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.cameraArea {
    position: relative;
    width: 960px;
    height: 580px;
    overflow: hidden;
    border-radius: 24px;
    border: 10px solid rgba(0, 0, 0, 0.2);
    background: #6F6F6F;
    box-sizing: border-box;
    border: 10px solid #000000;
}

.custom-slider:deep(.v-input__control) {
    height: 650px;
}

.right {
    /* 自动布局子元素 */
    width: 1260px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 36px;
    align-self: stretch;
    z-index: 1;
}

.left {
    /* 自动布局子元素 */
    width: 490px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 24px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;

}

.time3 {
    /* 自动布局子元素 */
    width: 174px;
    height: 75px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 8px;
    gap: 10px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(30px);
    box-shadow: inset 1px 0px 10px 0px rgba(255, 255, 255, 0.7), inset 0px 1px 8px 0px rgba(255, 255, 255, 0.5), inset 0px 0px 15px 0px rgba(255, 255, 255, 0.2), inset 0px 15px 30px 0px rgba(255, 255, 255, 0.2);
    font-size: 40px;
    font-weight: bold;
    line-height: normal;
    text-align: center;
    letter-spacing: 0.15em;
    color: #A2A2A2;
}

.time2 {
    /* 自动布局子元素 */
    width: 174px;
    height: 75px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 8px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;
}

.time {
    /* 自动布局子元素 */
    width: 190px;
    height: 91px;
    /* 自动布局 */
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;
    z-index: 2;
    border-radius: 16px;
    background: rgba(190, 190, 190, 0.3);
}

.btn_back {
    /* 自动布局子元素 */
    width: 190px;
    height: 74px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    z-index: 0;
}

.btn_back:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.container {
    width: 1920px;
    height: 1080px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 85px;
    background: linear-gradient(122deg, #E1E1E1 -6%, #DCDCDC 4%, rgba(231, 231, 231, 0.53) 16%, rgba(246, 246, 246, 0.5579) 30%, rgba(216, 216, 216, 0.42) 43%, rgba(246, 246, 246, 0.99) 61%, rgba(223, 223, 223, 0.71) 85%, #E0E0E0 100%), #E8E8E8;
}

.header {
    /* 自动布局子元素 */
    width: 1750px;
    height: 91px;
    /* 自动布局 */
    display: flex;
    justify-content: space-between;
    padding: 0px;
    align-self: stretch;
    z-index: 0;
}

.body {
    /* 自动布局子元素 */
    width: 1750px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
}

.footer {
    /* 自动布局子元素 */
    width: 1750px;
    height: 50px;
    /* 自动布局 */
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0px;
    align-self: stretch;
    z-index: 2;
}
</style>