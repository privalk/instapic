<template>
    <v-container fluid class="container">
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
                <img :src="filterPhoto ?? ''" class="FilterPreview" :style="{ filter: activeFilter }" />
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
type FilterKey = 'filter_1' | 'filter_2' | 'filter_3' | 'filter_4' | 'filter_5';
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
            console.log(JourneyStore.capturedPhoto)
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
            filter_1: 'saturate(1.2) brightness(1.1) contrast(1.05)',
            filter_2: 'contrast(1.3) saturate(0.9)',
            filter_3: 'brightness(1.05) contrast(1.2) saturate(1.1)',
            filter_4: 'sepia(0.6) contrast(1.1) brightness(0.95)',
            filter_5: 'grayscale(100%)'
        });
        const activeFilter = ref('');
        const selectedFilterKey = ref<FilterKey | null>(null);
        const applyFilter = (filterKey: FilterKey) => {
            if (selectedFilterKey.value === filterKey) {
                // 第二次点击相同滤镜时取消
                selectedFilterKey.value = null;
                activeFilter.value = '';
            } else {
                // 应用新滤镜
                selectedFilterKey.value = filterKey;
                activeFilter.value = filters.value[filterKey];

            }
        };

        const handleConfirm = async () => {

            console.log('Selected filter:', activeFilter.value);
            await JourneyStore.setFilter(activeFilter.value);
            await capturedHD();
            router.push({
                name: 'Paster'
            });
        };
        return {
            formattedTime, filterPhoto, applyFilter,
            activeFilter, filters, handleConfirm, selectedFilterKey, sliderValue, timeAll,
            selectedFrameUrl
        };
    },
});
</script>

<style scoped>
.FilterPreview {
    /* 自动布局子元素 */
    width: 426px;
    height: 629px;


    z-index: 0;
}

.FramePreview {
    position: absolute;

    top: 190px;

    width: 426px;
    height: 629px;
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