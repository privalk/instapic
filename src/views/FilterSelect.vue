<template>
    <v-container fluid class="container">
        <button class="test-btn" @click="loadTestPhoto">加载测试照片</button>
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">

            </div>
            <img src="\FilterSelect\title_FilterSelect.svg" />
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
                <img :src="selectedFrameUrl" class="FramePreview" />
                <img :src="filterPhoto ?? ''" class="FilterPreview" />
                <img src="\FilterSelect\btn_Next.png" class="btn" @click="handleConfirm" />
            </div>
            <div class="right">
                <div class="right_">
                    <div v-for="filterKey in (Object.keys(filters) as FilterKey[])" :key="filterKey" class="btn_filter"
                        @click="applyFilter(filterKey)" :class="{ 'active': selectedFilterKey === filterKey }">
                        <div :class="`btn_${filterKey}`"></div>
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
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import TimeSlider from '@/components/TimeSlider.vue'
import { nextTick } from 'process';
type FilterKey = 'filter_1' | 'filter_2' | 'filter_3' | 'filter_4' | 'filter_5';
// 定义合法的混合模式类型
type BlendMode = GlobalCompositeOperation | null;

// 配置对象类型
type FilterConfig = {
    mask: string | null;
    blendMode: BlendMode;
};
export default defineComponent({
    components: {
        TimeSlider
    },
    setup() {
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_GridSelect);
        const timeAll = ref(configStore.WaitTime_GridSelect);
        const selectedFrameUrl = computed(() => {
            return JourneyStore.selectedFrameUrl
        })
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
        const capturedHD = async () => {
            console.log('开始拼图')
            const frameElement = document.querySelector('.FramePreview') as HTMLImageElement;
            if (!frameElement || !JourneyStore.filterPhoto) {
                console.log('没有找到FramePreview')
                return;
            }

            const frameOriginal = await loadImage(frameElement.src);
            const photoOriginal = await loadImage(JourneyStore.filterPhoto);
            const canvas = document.createElement('canvas');
            canvas.width = frameOriginal.naturalWidth;
            canvas.height = frameOriginal.naturalHeight;
            const ctx = canvas.getContext('2d')!;

            ctx.drawImage(photoOriginal, 0, 0);
            ctx.drawImage(frameOriginal, 0, 0);
            canvas.toBlob(blob => {
                if (blob) {

                    JourneyStore.setfilterAndFramePhoto(URL.createObjectURL(blob));
                    JourneyStore.setPasterPhoto(URL.createObjectURL(blob));
                } else {
                    console.error('Blob 创建失败');
                }
            }, 'image/png', 1);

            console.log('拼图完成')
        }

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
        // 启动定时器
        onMounted(() => {
            nextTick(() => {
                console.log(JourneyStore.capturedPhoto)
            })

            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    handleConfirm();
                    clearInterval(timer);
                }
            }, 1000);
        });

        // 清除定时器
        onUnmounted(() => {
            clearInterval(timer);
        });

        const JourneyStore = useJourneyStore();
        const filterPhoto = computed(() => JourneyStore.filterPhoto);
        // 滤镜参数集合
        const filters = ref({
            filter_1: 'blur(1px) brightness(0.91) contrast(1.2)  hue-rotate(-5deg) saturate(95%) grayscale(20%) sepia(25%)',
            filter_2: 'blur(3px) brightness(1.25) contrast(0.7)  hue-rotate(-5deg) saturate(80%) grayscale(10%) sepia(0%)',
            filter_3: 'blur(2.5px) brightness(1.05) contrast(1)  hue-rotate(5deg) saturate(91%) grayscale(70%) sepia(65%)',
            filter_4: 'blur(3px) brightness(0.8) contrast(1.3)  hue-rotate(-5deg) saturate(120%) grayscale(10%) sepia(10%)',
            filter_5: 'blur(1.2px) brightness(107%) contrast(146%)  hue-rotate(0deg) saturate(101%) grayscale(100%) sepia(15%)'
        });
        const filterConfigs: Record<FilterKey, FilterConfig> = {
            filter_1: { mask: null, blendMode: null },
            filter_2: { mask: '/FilterSelect/Filter_2_mask.png', blendMode: 'lighten' },
            filter_3: {
                mask: '/FilterSelect/Filter_3_mask.png',
                blendMode: 'screen'
            },
            filter_4: { mask: '/FilterSelect/Filter_4_mask.png', blendMode: 'overlay' },
            filter_5: { mask: '/FilterSelect/Filter_5_mask.png', blendMode: 'overlay' },
        };
        const loadTestPhoto = () => {
            // 这里替换为你的测试照片路径
            const testPhotoURL = '/FilterSelect/20250516-185423.jpg';

            // 更新store状态
            JourneyStore.capturedPhoto = testPhotoURL;
            JourneyStore.filterPhoto = testPhotoURL;

            // 重置滤镜选择
            selectedFilterKey.value = null;
            activeFilter.value = '';

            console.log('测试照片已加载');
        };
        const activeFilter = ref('');
        const selectedFilterKey = ref<FilterKey | null>(null);
        const applyFilter = async (filterKey: FilterKey) => {
            if (selectedFilterKey.value === filterKey) {
                // 取消选择时恢复原图
                selectedFilterKey.value = null;
                activeFilter.value = '';
                JourneyStore.filterPhoto = JourneyStore.capturedPhoto || '';
            } else {
                // 应用新滤镜
                selectedFilterKey.value = filterKey;
                activeFilter.value = filters.value[filterKey];

                // 立即生成预览图
                try {
                    const success = await setFilter(activeFilter.value);
                    if (!success) {
                        console.error('滤镜应用失败');
                        JourneyStore.filterPhoto = JourneyStore.capturedPhoto || '';
                    }
                } catch (error) {
                    console.error('滤镜处理异常:', error);
                }
            }
        };

        // 优化后的 setFilter 函数
        const setFilter = async (filter: string) => {
            if (!JourneyStore.capturedPhoto) return false;

            const filterKey = selectedFilterKey.value;
            const config = filterKey ? filterConfigs[filterKey] : { mask: null, blendMode: null };
            console.log('filterKey', filterKey);
            console.log('config', config)
            try {
                // 并行加载资源
                const [srcImage, maskImage] = await Promise.all([
                    loadImage(JourneyStore.capturedPhoto!),
                    config.mask ? loadImage(config.mask) : null
                ]);

                // 创建画布
                const canvas = document.createElement('canvas');
                canvas.width = srcImage.width;
                canvas.height = srcImage.height;
                const ctx = canvas.getContext('2d')!;

                // 分步骤应用效果
                ctx.save();

                // 应用基础滤镜
                ctx.filter = filter;
                ctx.drawImage(srcImage, 0, 0);

                // 应用混合遮罩
                if (config.blendMode && maskImage) {
                    ctx.globalCompositeOperation = config.blendMode;
                    ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
                }

                ctx.restore();

                // 更新预览图
                return new Promise<boolean>((resolve) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const blobURL = URL.createObjectURL(blob);


                            JourneyStore.filterPhoto = blobURL;
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }, 'image/png');
                });
            } catch (error) {
                console.error('图像处理失败:', error);
                return false;
            }
        };
        const drawPhotoFrame = async () => {
            try {
                // 并行加载资源
                const [frameImage, filteredImage] = await Promise.all([
                    loadImage(JourneyStore.selectedFrameUrl!),
                    loadImage(JourneyStore.filterPhoto!)
                ]);

                // 创建画布（以相框尺寸为基准）
                const canvas = document.createElement('canvas');
                canvas.width = frameImage.width;
                canvas.height = frameImage.height;
                const ctx = canvas.getContext('2d')!;

                // 分步绘制合成效果
                // 1. 绘制滤镜后的照片（适配相框尺寸）
                ctx.drawImage(
                    filteredImage,
                    0, 0, filteredImage.width, filteredImage.height,     // 源尺寸
                    0, 0, canvas.width, canvas.height                    // 目标尺寸
                );

                // 2. 叠加相框（带透明通道）
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(frameImage, 0, 0);

                // 生成最终结果
                canvas.toBlob(blob => {
                    if (blob) {
                        const blobURL = URL.createObjectURL(blob);
                        JourneyStore.setPasterPhoto(blobURL);
                        JourneyStore.setPasterPhotoBlob(blob);

                    }
                }, 'image/png', 1);

                console.log('照片合成完成');
            } catch (error) {
                console.error('照片合成失败:', error);
                // 降级处理：直接使用原始照片
                JourneyStore.setPasterPhoto(JourneyStore.filterPhoto!);
            }
        };
        const handleConfirm = async () => {
            drawPhotoFrame();


            router.push({
                name: 'Paster'
            });
        };
        return {
            formattedTime, filterPhoto, applyFilter,
            activeFilter, filters, handleConfirm, selectedFilterKey, sliderValue, timeAll,
            selectedFrameUrl, loadTestPhoto
        };
    },
});
</script>

<style scoped>
.test-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #8945FF;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    z-index: 999;
}

.test-btn:hover {
    background: #6a30cc;
}

.test-btn:active {
    transform: scale(0.95);
}

.FilterPreview {
    /* 自动布局子元素 */
    width: 480px;
    height: 715px;


    z-index: 0;
}

.FramePreview {
    position: absolute;

    top: 147.5px;

    width: 480px;
    height: 715px;
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
    padding: 0px;
    gap: 36px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;

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

.right_ {
    /* 自动布局子元素 */
    width: 852px;
    height: 464px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px 64px;
    flex-wrap: wrap;
    align-content: center;
    align-self: stretch;
    z-index: 0;
}

.btn_filter {
    /* 自动布局子元素 */
    width: 199px;
    height: 265px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    z-index: 4;
    border-radius: 16px;
    box-sizing: border-box;
    /* border: 10px solid; */
    border-image: linear-gradient(180deg, rgba(135, 135, 135, 0.46) 0%, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 100%) 10;
    box-shadow: inset 0px 1px 10px 0px rgba(255, 255, 255, 0.3), inset 1px 0px 5px 0px rgba(0, 0, 0, 0.3), inset 0px 0px 5px 0px rgba(234, 234, 234, 0.3), inset 0px 1px 5px 0px rgba(0, 0, 0, 0.3);
}

.btn_filter_1 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_1.png') no-repeat center center / cover;

}

.btn_filter_2 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_2.png') no-repeat center center / cover;
}

.btn_filter_3 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_3.png') no-repeat center center / cover;

}

.btn_filter_4 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_4.png') no-repeat center center / cover;

}

.btn_filter_5 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_5.png') no-repeat center center / cover;
}

.btn_filter:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.btn_filter.active {
    border-image: linear-gradient(180deg, #8945FF 0%, #8945FF 100%) 10;
    box-shadow: 0 0 10px #8945FF;
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

.btn:active {
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