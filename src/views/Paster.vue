<template>
    <v-container fluid class="container">
        <div v-for="(sticker, index) in stickers" :key="index" class="draggable-sticker"
            :style="getStickerStyle(sticker)" @touchstart="handleTouchStart(index)" @touchend="handleTouchEnd(index)">
            <img :src="sticker.src" />
        </div>
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">

            </div>
            <img src="\Paster\title_paster.svg" />
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

                <div class="pasterPreview">

                    <img :src="pasterPreviewUrl ?? ''" class="preview-background" />
                </div>
                <div class="overPrint">
                    <div class="overPrintTop">
                        <div class="addMinus">
                            <img src="\Paster\btn_minus.svg" class="btn" @click="minusPrintNum" />
                            <div class="text">{{ PrintNum }}</div>
                            <img src="\Paster\btn_plus.svg" class="btn" @click="addPrintNum" />
                        </div>
                        <img src="\Paster\btn_Print.png" class="btn" @click="printImage" />
                    </div>
                    <div class="overPrintBottom">
                        <img src="\Paster\text_moreToPay.svg" />
                        <div class="text_purple">￥{{ overPrintPriceAllToPay }}</div>
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="pasterLibrary">
                    <v-carousel height="100%" width="100%" :show-arrows="false" hide-delimiter-background>
                        <!-- 每页显示16个贴纸 -->
                        <v-carousel-item v-for="(page, pageIndex) in stickerPages" :key="pageIndex">
                            <div class="carousel_item">
                                <!-- 每行保持4个贴纸，共4行 -->
                                <div v-for="(row, rowIndex) in chunkArray(page, 4)" :key="rowIndex"
                                    class="carousel_item_">
                                    <div class="carousel_item__">
                                        <div v-for="(paster, pasterIndex) in row" :key="pasterIndex" class="comp_paster"
                                            @click="addSticker(paster)">
                                            <img :src="paster" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                </div>
            </div>

        </div>
        <div class="footer">
            <img src="/GridSelect/img_Footer.svg" />
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import interact from 'interactjs';
import { useAuthStore } from '@/stores/auth';
import TimeSlider from '@/components/TimeSlider.vue'
export default defineComponent({
    components: {
        TimeSlider
    },
    setup() {

        const tapState = ref({
            count: 0,
            lastTime: 0,
            currentIndex: -1
        });

        const authStore = useAuthStore();
        const journeyStore = useJourneyStore();
        // 根据num_grid动态选择贴纸库
        const pasters = computed<string[]>(() => {
            const grid = journeyStore.num_grid;
            // Store 中的 key 是 Instapic_Paster_01、_02、_04、_06、_08
            const key = `Instapic_Paster_${String(grid).padStart(2, '0')}` as keyof typeof authStore;
            // 如果不存在对应属性，就返回空数组
            return Array.isArray(authStore[key]) ? (authStore[key] as string[]) : [];
        });
        const PAGE_SIZE = 16;  // 每页贴纸数量
        const COLUMNS_PER_ROW = 4; // 每行列数
        interface Sticker {
            src: string
            x: number
            y: number
            scale: number
            rotate: number

        }

        const stickers = ref<Sticker[]>([]);

        const getStickerStyle = (sticker: Sticker) => ({
            left: `${sticker.x}px`,
            top: `${sticker.y}px`,
            transform: `scale(${sticker.scale}) rotate(${sticker.rotate}deg)`,
        });
        // 添加贴纸
        const addSticker = (src: string) => {
            stickers.value.push({
                src,
                x: 400, // 初始位置
                y: 400,
                scale: 1,
                rotate: 0

            });

            nextTick(() => {
                initInteract();
            });
        };
        // 删除贴纸
        const removeSticker = (index: number) => {
            stickers.value.splice(index, 1);
        };
        // 初始化交互
        const initInteract = () => {
            interact('.draggable-sticker').
                draggable({
                    inertia: true,
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: '.container',
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
        };
        const handleGestureMove = (event: Interact.GestureEvent) => {
            const target = event.target as HTMLElement
            const index = Array.from(target.parentNode!.children).indexOf(target)
            const img = stickers.value[index]

            img.scale = event.scale
            img.rotate = event.angle

            // 限制最小/最大缩放比例
            img.scale = Math.min(Math.max(img.scale, 0.1), 10)
        }

        // 事件处理
        const handleDragMove = (event: Interact.InteractEvent) => {
            const target = event.target as HTMLElement
            const index = Array.from(target.parentNode!.children).indexOf(target)
            stickers.value[index].x += event.dx
            stickers.value[index].y += event.dy
        }
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_Paster);
        const timeAll = ref(configStore.WaitTime_Paster);
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
        const ClickToBack = () => {
            router.back();
        };
        // 启动定时器
        onMounted(() => {
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    handleprintImage();
                    clearInterval(timer);
                }
            }, 1000);

        });

        // 清除定时器
        onUnmounted(() => {
            clearInterval(timer);
        });


        const pasterPreviewUrl = computed(() => {
            return journeyStore.PasterPhoto;
        });
        const PrintNum = computed({
            get: () => journeyStore.PrintNum,
            set: (value) => {
                journeyStore.PrintNum = value;
            }
        });
        const overPrintPriceAllToPay = computed(() => (journeyStore.overPrintPriceAllToPay / 100).toFixed(2));



        const handleTouchStart = (index: number) => {
            tapState.value.currentIndex = index;
        };

        const handleTouchEnd = (index: number) => {
            const now = Date.now();
            const TRIPLE_TAP_DELAY = 300; // 300ms时间窗口

            // 重置条件：超过时间间隔 或 不同贴纸
            if (now - tapState.value.lastTime > TRIPLE_TAP_DELAY || tapState.value.currentIndex !== index) {
                tapState.value = {
                    count: 1,
                    lastTime: now,
                    currentIndex: index
                };
            } else {
                tapState.value.count += 1;
                tapState.value.lastTime = now;

                // 检测到第三次点击
                if (tapState.value.count === 3) {
                    removeSticker(index);
                    // 重置计数器
                    tapState.value = {
                        count: 0,
                        lastTime: 0,
                        currentIndex: -1
                    };
                }
            }
        };


        const captureHD = async () => {
            if (stickers.value.length > 0) {
                try {

                    // 找到用于截图的预览图元素
                    const frameElement = document.querySelector('.pasterPreview img') as HTMLImageElement;
                    if (!frameElement) return;

                    // 加载原始高清图
                    const frameOriginal = await loadImage(frameElement.src);

                    // 创建画布，尺寸用高清图的 naturalWidth/naturalHeight
                    const canvas = document.createElement('canvas');
                    canvas.width = frameOriginal.naturalWidth;
                    canvas.height = frameOriginal.naturalHeight;
                    const ctx = canvas.getContext('2d')!;

                    // 先把背景图画上去
                    ctx.drawImage(frameOriginal, 0, 0);

                    // 拿到预览图和贴纸元素在页面上的真实位置
                    const frameRect = frameElement.getBoundingClientRect();
                    const stickerElements = Array.from(document.querySelectorAll('.draggable-sticker')) as HTMLElement[];

                    // 计算从预览尺寸到高清画布的缩放
                    const scaleX = canvas.width / frameRect.width;
                    const scaleY = canvas.height / frameRect.height;

                    // 遍历每个贴纸
                    for (let i = 0; i < stickers.value.length; i++) {
                        const sticker = stickers.value[i];
                        const el = stickerElements[i];
                        const img = await loadImage(sticker.src);
                        const rect = el.getBoundingClientRect();
                        const offsetX = rect.left - frameRect.left;
                        const offsetY = rect.top - frameRect.top;

                        // 只用 DOM rect 的宽高来做尺寸，再乘以画布缩放
                        const w = rect.width * scaleX;
                        const h = rect.height * scaleY;
                        const canvasX = offsetX * scaleX;
                        const canvasY = offsetY * scaleY;

                        ctx.save();
                        // 平移到贴纸中心
                        ctx.translate(canvasX + w / 2, canvasY + h / 2);
                        // 旋转
                        ctx.rotate((sticker.rotate * Math.PI) / 180);
                        // drawImage 的最后两个参数是绘制尺寸
                        ctx.drawImage(img, -w / 2, -h / 2, w, h);
                        ctx.restore();
                    }

                    // 将 toBlob 包装为 Promise
                    await new Promise<void>((resolve, reject) => {
                        canvas.toBlob(blob => {
                            if (blob) {
                                journeyStore.setPasterPhotoBlob(blob);
                                journeyStore.setPasterPhoto(URL.createObjectURL(blob));
                                console.log('保存贴纸图片成功');
                                resolve();
                            } else {
                                reject(new Error('Failed to generate blob'));
                            }
                        }, 'image/png', 1);
                    });
                } catch (error) {
                    console.error('截图失败:', error);
                }
            }
        };

        // 图片加载器（增强版）
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.decoding = 'async'; // 启用异步解码
                img.crossOrigin = 'anonymous'; // 确保跨域配置
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


        // 修改分页逻辑
        const stickerPages = computed(() => {
            return chunkArray(pasters.value, PAGE_SIZE);
        });

        // 优化分块方法
        const chunkArray = (arr: any[], chunkSize: number) => {
            return arr.reduce((result, item, index) => {
                const chunkIndex = Math.floor(index / chunkSize);
                result[chunkIndex] = [...(result[chunkIndex] || []), item];
                return result;
            }, []);
        }



        // 打印执行
        const handleprintImage = async () => {
            await captureHD();
            if (journeyStore.num_grid === 8) {
                if (PrintNum.value == 1) {
                    router.push({ name: 'PrintAndGet' });
                }
                else {
                    router.push({
                        name: "PaySelect",
                        params: { isAdd: 'true', isCouponed: 'false' }
                    })
                }
            }
            else {
                if (PrintNum.value == 2) {
                    router.push({ name: 'PrintAndGet' });
                }
                else {
                    router.push({
                        name: "PaySelect",
                        params: { isAdd: 'true', isCouponed: 'false' }
                    })
                }
            }



        }
        return {
            formattedTime,
            ClickToBack,
            pasterPreviewUrl,
            PrintNum, addPrintNum: journeyStore.addPrintNum,
            minusPrintNum: journeyStore.minusPrintNum,
            overPrintPriceAllToPay,
            stickers, pasters, addSticker, removeSticker, getStickerStyle,
            handleTouchStart, handleTouchEnd,

            captureHD,
            stickerPages, chunkArray,
            printImage: handleprintImage,
            timeAll, sliderValue

        };
    },
});
</script>

<style scoped>
.draggable-sticker {
    position: absolute;
    cursor: move;
    touch-action: none;
    user-select: none;
    z-index: 2;
}

.draggable-sticker img {
    width: 200px;
    height: auto;
}

.preview-background {
    position: absolute;
    z-index: 0;
}

.comp_paster {
    cursor: pointer;
    transition: transform 0.2s;
}

.comp_paster:hover {
    transform: scale(1.05);
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

.pasterLibrary {
    /* 自动布局子元素 */
    width: 698px;
    height: 767px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 54px 54px 20px 54px;
    gap: 54px;
    z-index: 0;
    border-radius: 36px;
    background: #FFFFFF;

}

.carousel_item {
    /* 自动布局子元素 */
    width: 590px;
    height: 590px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 10px;
    z-index: 0;
}

.carousel_item_ {
    /* 自动布局子元素 */
    width: 590px;
    height: 140px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 10px;
    z-index: 3;
}

.carousel_item__ {
    /* 自动布局子元素 */
    width: 590px;
    height: 140px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 0;
}

.comp_paster {
    /* 自动布局子元素 */
    width: 140px;
    height: 140px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 3;
    border-radius: 8px;
    background: #F6F6F6;
    box-sizing: border-box;
    border: 1px solid #E1E1E1;
}

.text_purple {
    /* 自动布局子元素 */
    width: 43px;
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

.overPrintBottom {
    /* 自动布局子元素 */
    width: 188px;
    height: 49px;
    /* 自动布局 */
    display: flex;
    align-items: center;
    padding: 0px;
    z-index: 1;
}

:deep(.v-carousel__controls) {
    bottom: 10px;
}

/* 控制点通用样式 */
:deep(.v-carousel__controls .v-btn) {
    width: 24px !important;
    height: 24px !important;
    margin: 0 8px !important;
    border: 1px solid #C8C8C8 !important;
    background-color: #E7E7E7 !important;
    opacity: 1 !important;
}

/* 激活状态需要更精确的选择器 */
:deep(.v-carousel__controls .v-btn.v-item--active) {
    background-color: #636363 !important;
}

/* 移除按钮悬停效果 */
:deep(.v-carousel__controls .v-btn::before) {
    opacity: 0 !important;
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
    height: 779px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
}

.left {
    /* 自动布局子元素 */
    width: 850px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px 0px 0px 0px;
    gap: 36px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;
}

.addMinus {
    /* 自动布局子元素 */
    width: 240px;
    height: 75px;
    /* 自动布局 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    z-index: 0;
    border-radius: 8px;
    background: url('/Paster/bg_addMinus.png') no-repeat center center / cover;

}

.btn:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.text {
    /* 自动布局子元素 */
    width: auto;
    height: 43px;
    z-index: 1;
    font-family: Dream Han Serif CN;
    font-size: 32px;
    font-weight: 900;
    line-height: normal;
    align-content: center;
    color: #FFFFFF;
}

.overPrintTop {
    /* 自动布局子元素 */
    width: 544px;
    height: 75px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 64px;
    z-index: 0;
}

.overPrint {
    /* 自动布局子元素 */
    width: 544px;
    height: 132px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    gap: 8px;
    z-index: 1;
}

.pasterPreview {
    /* 自动布局子元素 */
    position: relative;
    width: 426px;
    height: 629px;
    z-index: 0;

}

.pasterPreview img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.right {
    /* 自动布局子元素 */
    width: 900px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 64px;
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