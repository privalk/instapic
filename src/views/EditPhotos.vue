<template>
    <v-container fluid class="container">
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">
            </div>
            <img src="\EditPhotos\title_layout.svg" />
            <div class="time">
                <!-- <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div> -->
            </div>
        </div>

        <div class="body" ref="canvasContainer">

            <div v-for="(img, index) in images" :key="index" class="draggable-image" :style="getImageStyle(img)">
                <img :src="img.src" :style="{ opacity: img.opacity }" @contextmenu.prevent />
            </div>

            <div class="left">


            </div>
            <div class="middle" ref="middleElement">
                <img :src=framePhotoUrl class="PhotoFrame">
            </div>
            <div class="right">
                <div class="right_top" ref="rightTopElement"></div>
                <div class="right_bottom">
                    <div class="mod_Reselect">
                        <div class="mod_Reselect_">
                            <img src="\EditPhotos\btn_ReselectFrame.png" class="btn" @click="handleReselectFrame"
                                :class="{ disabled: remainAttempts_selectFrame <= 0 }" />
                            <div class="text_Reselect">
                                <img src="\EditPhotos\remindTimes.svg">
                                <div class="text_Reselect_"> {{ remainAttempts_selectFrame }}</div>
                            </div>

                        </div>

                    </div>
                    <img src="\EditPhotos\btn_comfirm.png" class="btn" @click="handleConfirm" />
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
import TimeSlider from '@/components/TimeSlider.vue'
export default defineComponent({
    components: {
        TimeSlider
    },
    setup() {
        const JourneyStore = useJourneyStore();
        const middleElement = ref<HTMLElement | null>(null)
        const rightTopElement = ref<HTMLElement | null>(null)
        const framePhotoUrl = computed(() => JourneyStore.selectedFrameUrl)
        interface DraggableImage {
            src: string
            x: number
            y: number
            scale: number
            rotate: number
            opacity: number
        }

        // 从JourneyStore获取photos并转换为DraggableImage数组
        const images: Ref<DraggableImage[]> = ref(
            JourneyStore.photos.map(photo => ({
                src: photo,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1
            }))
        )
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_EditPhotos);
        const timeAll = ref(configStore.WaitTime_EditPhotos);
        const sliderValue = computed(() => {
            return timeLeft.value;
        })
        let timer: ReturnType<typeof setInterval>;
        // 格式化时间为XX:XX
        const formattedTime = computed(() => {
            const mins = Math.floor(timeLeft.value / 60);
            const secs = timeLeft.value % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });




        const remainAttempts_selectFrame = computed(() => JourneyStore.remainAttempts_selectFrame);

        const canvasContainer: Ref<HTMLElement | null> = ref(null)
        const getImageStyle = (img: DraggableImage) => ({
            left: `${img.x}px`,
            top: `${img.y}px`,

            transform: `translate(-50%, -50%) scale(${img.scale}) rotate(${img.rotate}deg)`,
        })
        // Interact.js 初始化
        onMounted(() => {
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    handleConfirm();
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
                initImagePositions()
            })
        })


        onUnmounted(() => {
            clearInterval(timer);
        });
        const initInteract = () => {
            if (!canvasContainer.value || !middleElement.value || !rightTopElement.value) {
                console.log(canvasContainer.value, middleElement.value, rightTopElement.value)
                console.error('无法获取 DOM 元素');
                return;
            }
            // 计算限制区域
            const getAreaRect = (element: HTMLElement) => ({
                left: element.offsetLeft + 130,
                top: element.offsetTop + 171,
                right: element.offsetLeft + element.offsetWidth + 80,
                bottom: element.offsetTop + 145 + element.offsetHeight
            })
            const middleRect = getAreaRect(middleElement.value)
            const rightTopRect = getAreaRect(rightTopElement.value)
            console.log('中间区域:', middleRect)
            console.log('右上区域:', rightTopRect)
            const restriction = {
                left: middleRect.left,
                top: middleRect.top,
                right: rightTopRect.right,
                bottom: middleRect.bottom
            }
            console.log('限制区域:', restriction)
            interact('.draggable-image')
                .draggable({
                    inertia: true,
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: restriction,
                            endOnly: true,
                        })
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

        // 自动排列初始化逻辑
        const initImagePositions = () => {
            const rightTop = rightTopElement.value
            if (!rightTop) return

            const areaWidth = rightTop.offsetWidth
            // const areaHeight = rightTop.offsetHeight
            const imgWidth = 200 // 与 CSS 中 draggable-image img 的宽度一致
            const imgHeight = 200 // 根据实际图片比例调整

            // 计算行列数和间距
            const cols = Math.floor(areaWidth / imgWidth)
            const horizontalGap = (areaWidth - cols * imgWidth) / (cols + 1)
            const verticalGap = 20

            images.value.forEach((img, index) => {
                const row = Math.floor(index / cols)
                const col = index % cols

                img.x = rightTop.offsetLeft + horizontalGap * (col + 1) + imgWidth * col
                img.y = rightTop.offsetTop + verticalGap * (row + 1) + imgHeight * row
            })
        }
        const handleGestureMove = (event: Interact.GestureEvent) => {
            const target = event.target as HTMLElement
            const index = Array.from(target.parentNode!.children).indexOf(target)
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
            console.log('开始截图')
            const frameElement = document.querySelector('.PhotoFrame') as HTMLImageElement;
            if (!frameElement || !canvasContainer.value) return;

            // 加载相框原图
            const frameOriginal = await loadImage(frameElement.src);

            // 创建画布（使用相框原始尺寸）
            const canvas = document.createElement('canvas');
            canvas.width = frameOriginal.naturalWidth;
            canvas.height = frameOriginal.naturalHeight;
            const ctx = canvas.getContext('2d')!;

            // 计算缩放比例（相框显示尺寸到原始尺寸）
            const frameDisplayRect = frameElement.getBoundingClientRect();
            console.log('相框显示尺寸:', frameDisplayRect);
            const scaleX = frameOriginal.naturalWidth / frameDisplayRect.width;
            const scaleY = frameOriginal.naturalHeight / frameDisplayRect.height;
            console.log('缩放比例:', scaleX, scaleY);
            // 加载所有拖拽图片
            const dragImgs = await Promise.all(
                images.value.map(img => loadImage(img.src))
            );

            // 容器相对于视口的位置
            const containerRect = canvasContainer.value.getBoundingClientRect();
            // console.log('容器相对于视口的位置:', containerRect);
            // 先绘制相框背景（可选，根据需求）
            // ctx.drawImage(frameOriginal, 0, 0);

            // 绘制所有图片
            images.value.forEach((imgData, index) => {
                const originalImg = dragImgs[index];
                if (!originalImg) return;

                // 获取元素实际位置（相对于容器）
                const imgX = imgData.x + containerRect.left;
                const imgY = imgData.y + containerRect.top;
                // console.log('图片实际位置:', imgX, imgY);
                // 转换为相框坐标系统
                const originX = (imgX - frameDisplayRect.left) * scaleX;
                const originY = (imgY - frameDisplayRect.top) * scaleY;
                // console.log('图片在相框中的位置:', originX, originY);
                // 计算缩放比例（考虑原图尺寸与显示尺寸）
                const displayWidth = 200; // CSS中定义的图片宽度
                const imgRatio = originalImg.naturalWidth / displayWidth;
                const actualScale = imgData.scale * scaleX / imgRatio;

                // 应用变换
                ctx.save();
                ctx.translate(originX, originY);
                ctx.rotate(imgData.rotate * Math.PI / 180);
                ctx.scale(actualScale, actualScale);
                ctx.drawImage(
                    originalImg,
                    -originalImg.naturalWidth / 2,
                    -originalImg.naturalHeight / 2
                );
                ctx.restore();
            });

            // 生成最终图片
            canvas.toBlob(blob => {
                if (blob) {
                    JourneyStore.setCapturedPhoto(URL.createObjectURL(blob));
                } else {
                    console.error('Blob 创建失败');
                }
            }, 'image/png', 1);
        };
        // 图片加载器（增强版）
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // 添加 CORS 属性
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
        const handleReselectFrame = () => {
            // 处理重新选择相框的逻辑
            if (JourneyStore.remainAttempts_selectFrame > 0) {
                console.log('重新选择相框');
                JourneyStore.decrementAttempt('selectFrame')
                router.push({
                    name: 'PhotoFrameSelect'
                })
            }


        };
        const handleConfirm = async () => {
            // 处理确认的逻辑
            console.log('确认选择');
            await captureHD();
            router.push({
                name: 'FilterSelect'
            });
        };


        return {
            formattedTime,
            images, getImageStyle, canvasContainer, middleElement,
            rightTopElement, captureHD, remainAttempts_selectFrame,
            handleReselectFrame, handleConfirm, framePhotoUrl,
            timeAll, sliderValue
        };
    },
});
</script>

<style scoped>
.btn.disabled {
    filter: grayscale(100%);
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

/* 保持原有激活状态样式 */
.btn:active:not(.disabled) {
    transform: scale(0.95);
    opacity: 0.8;
}

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
    /* pointer-events: auto; */
}

.PhotoFrame {
    /* 自动布局子元素 */
    width: 480px;
    height: 715px;
    /* 
    pointer-events: none; */

}

.PhotoFrame img {
    z-index: 3;
}

.draggable-image {
    position: absolute;
    cursor: move;
    touch-action: none;
    user-select: none;
    z-index: 2;
    transform-origin: center center;
    /* 确保变换基于中心点 */
    will-change: transform;
    /* 优化动画性能 */
}

.draggable-image img {
    width: 200px;
    height: auto;
    display: block;
    /* 消除图片底部间隙 */
    transform-origin: center center;
    /* 图片变换也基于中心 */
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
    z-index: 3;
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
    z-index: 0;

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
    /* pointer-events: none; */
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
    /* background: rgba(190, 190, 190, 0.3); */
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

.draggable-image img {
    /* 新增触摸事件抑制 */
    -webkit-touch-callout: none;
    /* 确保所有浏览器禁用选择 */
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    /* 可选：禁用指针事件 */
    /* pointer-events: none; */
}
</style>