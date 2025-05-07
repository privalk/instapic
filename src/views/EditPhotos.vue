<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back">
            </div>
            <img src="\EditPhotos\title_layout.svg" @click="captureHD" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body" ref="canvasContainer">

            <div v-for="(img, index) in images" :key="index" class="draggable-image" :style="getImageStyle(img)">
                <img :src="img.src" :style="{ opacity: img.opacity }" />
            </div>

            <div class="left">


            </div>
            <div class="middle">
                <img src="\EditPhotos\Grid_4.png" class="PhotoFrame">
            </div>
            <div class="right">
                <div class="right_top"></div>
                <div class="right_bottom">
                    <div class="mod_Reselect">
                        <div class="mod_Reselect_">
                            <img src="\EditPhotos\btn_ReselectFrame.png" class="btn" />
                            <div class="text_Reselect">
                                <img src="\EditPhotos\remindTimes.svg">
                                <div class="text_Reselect_"> {{ remainAttempts_selectFrame }}</div>
                            </div>

                        </div>

                    </div>
                    <img src="\EditPhotos\btn_comfirm.png" class="btn"/>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="/GridSelect/img_Footer.svg" />
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, type Ref, nextTick } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import interact from 'interactjs'

export default defineComponent({

    setup() {
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
            { src: '/1.jpg', x: 20, y: 0, scale: 1, rotate: 0, opacity: 1 },
            { src: '/2.jpg', x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
            // 添加更多图片...
        ])
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_EditPhotos);
        let timer: number;
        // 格式化时间为XX:XX
        const formattedTime = computed(() => {
            const mins = Math.floor(timeLeft.value / 60);
            const secs = timeLeft.value % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });
        const ClickToBack = () => {
            router.back();
        };


        const JourneyStore = useJourneyStore();
        const remainAttempts_selectFrame = computed(() => JourneyStore.remainAttempts_selectFrame);

        const canvasContainer: Ref<HTMLElement | null> = ref(null)
        const getImageStyle = (img: DraggableImage) => ({
            left: `${img.x}px`,
            top: `${img.y}px`,
            transform: `scale(${img.scale}) rotate(${img.rotate}deg)`,
        })
        // Interact.js 初始化
        onMounted(() => {
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    router.back();
                    clearInterval(timer);
                }
            }, 1000);

            nextTick(() => {
                if (!canvasContainer.value) {
                    console.error('无法获取 DOM 元素')
                    return
                }


                // 初始化交互
                initInteract()
            })
        })


        onUnmounted(() => {
            clearInterval(timer);
        });
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
            const index = Array.from(target.parentNode!.children).indexOf(target)
            images.value[index].x += event.dx
            images.value[index].y += event.dy
        }
        const captureHD = async () => {
            const frameElement = document.querySelector('.PhotoFrame') as HTMLImageElement;
            if (!frameElement) return;

            const frameOriginal = await loadImage(frameElement.src);

            const canvas = document.createElement('canvas');
            canvas.width = frameOriginal.naturalWidth;
            canvas.height = frameOriginal.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(frameOriginal, 0, 0);

            const frameDisplayRect = frameElement.getBoundingClientRect();
            const scaleX = frameOriginal.naturalWidth / frameDisplayRect.width;
            const scaleY = frameOriginal.naturalHeight / frameDisplayRect.height;

            const dragImgs = await Promise.all(
                images.value.map(img => loadImage(img.src))
            );

            images.value.forEach((imgData, index) => {
                const originalImg = dragImgs[index];
                if (!originalImg) return;

                // 获取相框在容器内的相对位置
                const frameRect = frameElement.getBoundingClientRect();
                const containerRect = canvasContainer.value!.getBoundingClientRect();
                const frameLeftInContainer = frameRect.left - containerRect.left;
                const frameTopInContainer = frameRect.top - containerRect.top;

                // 将用户坐标转换为相框内坐标
                const frameRelativeX = imgData.x - frameLeftInContainer;
                const frameRelativeY = imgData.y - frameTopInContainer;

                // 映射到画布坐标
                const originX = frameRelativeX * scaleX;
                const originY = frameRelativeY * scaleY;

                // 计算实际显示尺寸
                const scaledDisplayWidth = 200 * imgData.scale;
                const scaledDisplayHeight = (200 * imgData.scale * originalImg.naturalHeight) / originalImg.naturalWidth;

                // 转换缩放比例
                const originalImgDisplayWidth = 200;
                const imgScaleRatio = originalImg.naturalWidth / originalImgDisplayWidth;
                const actualScale = (imgData.scale * scaleX) / imgScaleRatio;

                // 应用变换（中心点修正）
                ctx.save();
                ctx.translate(
                    originX + (scaledDisplayWidth * scaleX) / 2,
                    originY + (scaledDisplayHeight * scaleY) / 2
                );
                ctx.rotate(imgData.rotate * Math.PI / 180);
                ctx.scale(actualScale, actualScale);
                ctx.drawImage(
                    originalImg,
                    -originalImg.naturalWidth / 2,
                    -originalImg.naturalHeight / 2
                );
                ctx.restore();
            });

            canvas.toBlob(blob => {
                if (blob) {

                }
            }, 'image/png', 1);
        };
        // 图片加载器（增强版）
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.decoding = 'async'; // 启用异步解码
                img.src = src;

                img.onload = () => {
                    if (img.naturalWidth === 0) {
                        reject(new Error('图片加载异常'));
                    }
                    resolve(img);
                };
                img.onerror = (e) => reject(e);
            });
        };



        return { formattedTime, ClickToBack, images, getImageStyle, canvasContainer, captureHD, remainAttempts_selectFrame };
    },
});
</script>

<style scoped>
.btn:active {
    transform: scale(0.95);
    opacity: 0.8;
}
.text_Reselect_ {
    /* 自动布局子元素 */
    width: 12px;
    height: 29px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 1;
    font-family: Dream Han Serif CN;
    font-size: 22px;
    font-weight: 900;
    line-height: normal;
    letter-spacing: 0.04em;
    color: #8945FF;
}

.text_Reselect {
    /* 自动布局子元素 */
    width: 114px;
    height: 29px;
    /* 自动布局 */
    display: flex;
    align-items: center;
    padding: 0px;
    gap: 8px;
    z-index: 1;
}

.mod_Reselect_ {
    /* 自动布局子元素 */
    width: 185px;
    height: 97px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    gap: 8px;
    z-index: 0;
}

.mod_Reselect {
    /* 自动布局子元素 */
    width: 185px;
    height: 97px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 36px;
    z-index: 0;
}

.right_bottom {
    /* 自动布局子元素 */
    width: 300px;
    height: 208px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    gap: 36px;
    z-index: 1;
}

.PhotoFrame {
    /* 自动布局子元素 */
    width: 492px;
    height: 728px;

    pointer-events: none;

}

.PhotoFrame img {
    z-index: 1;
}

.draggable-image {
    position: absolute;
    cursor: move;
    touch-action: none;
    user-select: none;
    z-index: 1;
}

.draggable-image img {
    width: 200px;
    height: auto;
}

.left {

    /* 自动布局子元素 */
    width: 583.33px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 64px;
    z-index: 1;
    pointer-events: none;
}

.middle {
    /* 自动布局子元素 */
    width: 583.33px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 24px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
    pointer-events: none;
}

.right {
    /* 自动布局子元素 */
    width: 583.33px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 34px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
    pointer-events: none;
}

.right_top {
    /* 自动布局子元素 */
    width: 439px;
    height: 537px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0px;
    gap: 24px 24px;
    flex-wrap: wrap;
    align-content: center;
    flex-grow: 1;
    z-index: 0;
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
    position: relative;
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