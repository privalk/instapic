<template>
    <v-container fluid class="container">
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">

            </div>
            <img src="\TakePhoto\title_takePhoto.svg" />
            <div class="time">
                <!-- <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div> -->
            </div>
        </div>

        <div class="body">
            <div class="left">
                <div class="scrollArea">
                    <v-virtual-scroll class="scrollArea_" :items="items" :item-height="223" ref="scrollRef"
                        @scroll:update="handleScrollUpdate">
                        <template v-slot:default="{ item }">
                            <div class="item">
                                <img :src="item" />
                            </div>
                        </template>
                    </v-virtual-scroll>
                </div>

            </div>
            <div class="middle">

                <div class="cameraArea" :style="cameraSize">
                    <div v-if="isProcessing" class="processing-overlay">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </div>
                    <div v-show="timeLeft <= 10 && timeLeft > 0" class="countdown-number">
                        {{ timeLeft }}
                    </div>
                    <video ref="videoRef" autoplay playsinline :style="{ transform: 'scaleX(-1)' }"></video>
                    <!-- 添加用于显示最后拍摄照片的canvas -->
                    <canvas ref="canvasRef" class="fixed-canvas"></canvas>
                </div>

                <div class="counter">
                    <div class="counter_left">
                        {{ num_photoToTakeNow }}
                    </div>
                    <div class="counter_right">
                        /{{ num_photoToTakeAll }}
                    </div>
                </div>
            </div>
            <div class="right">
                <div v-if="timeLeft === 0" class="right_">
                    <img class="btn" v-if="num_photoToTakeNow < num_photoToTakeAll" src="\TakePhoto\btn_nextTake.png"
                        @click="handleNextTake" />
                    <img class="btn" v-else src="\TakePhoto\btn_confirm.png" @click="handleConfirm" />
                    <div class="retake">
                        <img class="btn" src="\TakePhoto\btn_retake.png" @click="handleRetake"
                            :class="{ disabled: remainAttempts <= 0 }" />
                        <div class="retake_">
                            <img src="\TakePhoto\text_remainAttempts.svg" />
                            <div class="remainAttempts">{{ remainAttempts }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="/GridSelect/img_Footer.svg" />
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import * as Comlink from 'comlink';


import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import type { ImageProcessor } from '@/worker/types';
import type { VVirtualScroll } from 'vuetify/components/VVirtualScroll';
import TimeSlider from '@/components/TimeSlider.vue'
import { useQueenBeauty } from '@/composables/useBeautyCamera';
export default defineComponent({
    components: {
        TimeSlider
    },
    setup() {
        const cameraSize = computed(() => {
            switch (JourneyStore.num_grid) {
                case 1:
                    return { width: '523.832px', height: '700px' };
                case 2:
                    return { width: '600px', height: '449.628px' };

                case 4:
                    return { width: '523.659px', height: '700px' };
                case 6:
                    return { width: '600px', height: '600px' };

                case 8:
                    return { width: '600px', height: '449.417px' };

            }
        });
        const isProcessing = ref(false);
        const videoRef = ref<HTMLVideoElement | null>(null);
        const canvasRef = ref<HTMLCanvasElement | null>(null);
        const cameraStream = ref<MediaStream | null>(null);
        const scrollRef = ref<typeof VVirtualScroll>();
        let pendingScroll = false;

        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_TakePhoto);
        const timeAll = ref(configStore.WaitTime_TakePhoto);
        const sliderValue = computed(() => {
            return timeLeft.value;
        })

        let timer = 500 as number;


        // 增强版滚动控制
        const ensureScrollToBottom = async () => {
            try {
                pendingScroll = true;

                // 等待虚拟滚动完成布局
                await new Promise(resolve => setTimeout(resolve, 100));

                // 双重保障机制
                const executeScroll = () => {
                    if (!scrollRef.value) return;

                    // 方法1：使用组件API
                    scrollRef.value.scrollToIndex(JourneyStore.photos.length - 1);

                    // 方法2：DOM操作（兼容方案）
                    const container = scrollRef.value.$el?.querySelector('.v-virtual-scroll__container');
                    if (container) {
                        const targetScrollTop = container.scrollHeight - container.clientHeight;
                        if (Math.abs(container.scrollTop - targetScrollTop) > 1) {
                            container.scrollTop = targetScrollTop;
                        }
                    }

                };

                // 首次尝试
                executeScroll();

                // 二次确认（针对虚拟滚动渲染延迟）
                setTimeout(executeScroll, 300);
            } finally {
                pendingScroll = false;
            }
        };
        // 监听滚动更新事件
        const handleScrollUpdate = () => {
            if (pendingScroll) {
                ensureScrollToBottom();
            }
        };
        const startCountdown = () => {
            clearInterval(timer);
            if (canvasRef.value && videoRef.value) {
                canvasRef.value.style.display = 'none';
                videoRef.value.style.display = 'block';
            }

            const startTime = performance.now();
            const duration = configStore.WaitTime_TakePhoto * 1000;

            const frameUpdate = () => {
                const elapsed = performance.now() - startTime;
                timeLeft.value = Math.ceil((duration - elapsed) / 1000);

                if (elapsed < duration) {
                    requestAnimationFrame(frameUpdate);
                } else {
                    timeLeft.value = 0;
                    // 使用MessageChannel实现高优先级微任务
                    const channel = new MessageChannel();
                    channel.port1.postMessage('');
                    channel.port2.onmessage = () => {
                        if (num_photoToTakeNow.value <= num_photoToTakeAll.value) {
                            takePhoto();
                        }
                    };
                }
            };

            requestAnimationFrame(frameUpdate);
        };


        const JourneyStore = useJourneyStore();
        const num_photoToTakeNow = ref(1);
        const remainAttempts = computed(() => JourneyStore.remainAttempts_takePhotos);
        const num_photoToTakeAll = computed(() =>
            JourneyStore.num_grid === 8 ? 4 : JourneyStore.num_grid
        );
        const queen = useQueenBeauty(videoRef, cameraStream);

        // 增强摄像头管理
        const startCamera = async () => {
            try {
                // 先停止旧流（新增）
                if (cameraStream.value) {
                    cameraStream.value.getTracks().forEach(track => track.stop());
                }

                if (videoRef.value) {
                    queen.startQueenEngine();
                    // 确保视频元素可见
                    videoRef.value.style.display = 'block';
                }
                // 隐藏canvas直到拍照
                if (canvasRef.value) {
                    canvasRef.value.style.display = 'none';
                }
            } catch (error) {
                console.error('Camera error:', error);
            }
        };

        // 创建 Worker 包装器
        const worker = new Worker(
            new URL('../worker/image.ts', import.meta.url), // 使用相对路径
            {
                type: 'module',
                name: 'image-processor' // 添加 Worker 名称便于调试
            }
        );
        // 添加错误监听
        worker.onerror = (e) => {
            console.error('[Worker Error]', e.error);
        };
        const imageWorker = Comlink.wrap<ImageProcessor>(worker);
        // 3. 拍照逻辑
        const takePhoto = async () => {
            isProcessing.value = true;
            let bitmap: ImageBitmap | null = null;

            try {
                const video = videoRef.value!;
                const displayWidth = video.clientWidth;
                const displayHeight = video.clientHeight;
                bitmap = await createImageBitmap(videoRef.value!);
                const blob = await imageWorker.processFrame(
                    Comlink.transfer(bitmap, [bitmap]),
                    { quality: 1, mirror: true, aspectRatio: displayWidth / displayHeight }
                );
                const image = new Image();
                image.src = URL.createObjectURL(blob);
                await new Promise((resolve) => (image.onload = resolve));

                if (canvasRef.value) {
                    // 根据显示尺寸设置canvas
                    canvasRef.value.width = displayWidth;
                    canvasRef.value.height = displayHeight;
                    const ctx = canvasRef.value.getContext('2d')!;
                    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);
                }

                // 直接添加到照片数组
                JourneyStore.photos.push(image.src);
                showLastPhoto();
                await ensureScrollToBottom();
            } finally {
                bitmap?.close();
                isProcessing.value = false;
            }
        };
        // 4. 按钮处理函数
        const handleNextTake = () => {
            num_photoToTakeNow.value++;
            JourneyStore.remainAttempts_takePhotos = 2;
            if (num_photoToTakeNow.value <= num_photoToTakeAll.value) {
                startCountdown();
            }
        };
        const handleRetake = () => {
            if (JourneyStore.remainAttempts_takePhotos > 0 && JourneyStore.photos.length > 0) {
                JourneyStore.decrementAttempt('takePhotos'); // 减少尝试次数
                JourneyStore.photos.pop(); // 删除最后一张照片
                startCountdown();
            }
        };
        const handleConfirm = () => {
            // 当使用8宫格时复制照片
            if (JourneyStore.num_grid === 8) {
                // 确保当前正好拍了4张
                if (JourneyStore.photos.length === 4) {
                    // 深拷贝数组并合并
                    JourneyStore.photos = [...JourneyStore.photos, ...[...JourneyStore.photos]]
                } else {
                    console.warn('8宫格模式下需要拍摄4张照片，当前数量：', JourneyStore.photos.length)
                }
            }

            router.push({
                name: 'PhotoFrameSelect'
            });

        };
        // 新增canvas显示控制
        const showLastPhoto = () => {
            if (canvasRef.value && videoRef.value) {
                canvasRef.value.style.display = 'block';
                videoRef.value.style.display = 'none';

            }
        };

        onMounted(() => {

            startCamera();
            startCountdown();
        });

        onUnmounted(() => {
            clearInterval(timer);
            queen.cleanupQueenEngine();
        });



        return {
            timeAll, sliderValue,
            num_photoToTakeAll,
            num_photoToTakeNow,
            takePhoto,
            videoRef,
            canvasRef,
            remainAttempts,
            timeLeft,
            items: JourneyStore.photos,
            handleNextTake,
            handleRetake, isProcessing, scrollRef, handleScrollUpdate, handleConfirm,
            cameraSize
        };
    },

});
</script>


<style scoped>
.countdown-number {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    font-family: DIN;
    font-size: 240px;
    font-weight: bold;
    background: linear-gradient(180deg, rgba(119, 68, 255, 0.5) 0%, rgba(243, 255, 149, 0.5) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    /* text-fill-color: transparent; */
    pointer-events: none;
    /* 防止点击阻挡摄像头操作 */
}

.processing-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
}

.fixed-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;

}

.btn:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.remainAttempts {
    /* 自动布局子元素 */
    width: 15px;
    height: 29px;
    z-index: 0;
    font-family: Dream Han Serif CN;
    font-size: 24px;
    font-weight: 900;
    line-height: normal;
    letter-spacing: 0.04em;
    color: #8945FF;
}

.retake_ {
    /* 自动布局子元素 */
    width: 148px;
    height: 29px;
    /* 自动布局 */
    display: flex;
    align-items: center;
    padding: 0px;
    gap: 8px;
    z-index: 1;
}

.retake {
    /* 自动布局子元素 */
    width: 300px;
    height: 112px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    gap: 8px;
    z-index: 1;

}

.scrollArea {
    /* 自动布局子元素 */
    width: 215px;
    height: 723px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 56px 24px;

    z-index: 0;
    background: linear-gradient(180deg, rgba(65, 65, 65, 0.48) 0%, rgba(175, 175, 175, 0.52) 23%, rgba(38, 38, 38, 0.4384) 56%, rgba(128, 128, 128, 0.226) 77%, rgba(61, 61, 61, 0.37) 100%), rgba(0, 0, 0, 0.2);
    background-blend-mode: exclusion, exclusion, normal, normal;

}

.scrollArea_ {
    /* 自动布局子元素 */
    width: 167px;
    height: 667px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;

    z-index: 0;
}

.item {
    margin-bottom: 30px;
    /* 自动布局子元素 */
    width: 167px;
    height: auto;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 10px;

    z-index: 3;
    border-radius: 8px;
    background: #FFFFFF;

}

.item img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}



.cameraArea {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 10px solid rgba(0, 0, 0, 0.2);
}

video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
    /* 镜像翻转 */
}

.counter_left {
    /* 自动布局子元素 */
    width: 17px;
    height: 43px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 0;
    font-family: Dream Han Serif CN;
    font-size: 36px;
    font-weight: 900;
    line-height: normal;
    letter-spacing: 0.04em;
    color: #8945FF;

}

.counter_right {
    /* 自动布局子元素 */
    width: 39px;
    height: 43px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 1;
    font-family: Dream Han Serif CN;
    font-size: 36px;
    font-weight: 900;
    line-height: normal;
    letter-spacing: 0.04em;
    color: #000000;
}

.counter {
    /* 自动布局子元素 */
    width: 60px;
    height: 43px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 4px;
    z-index: 2;
}

.btn.disabled {
    filter: grayscale(100%);
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: none;
}

/* 保持原有激活状态样式 */
.btn:active:not(.disabled) {
    transform: scale(0.95);
    opacity: 0.8;
}

.left {
    /* 自动布局子元素 */
    width: 583.33px;
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

.middle {
    /* 自动布局子元素 */
    width: 583.33px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 36px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
}

.right {
    /* 自动布局子元素 */
    width: 583.33px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 2;
}

.right_ {
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 2;
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
    /* background: rgba(190, 190, 190, 0.3); */
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
    padding: 0px;
    gap: 150px;
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