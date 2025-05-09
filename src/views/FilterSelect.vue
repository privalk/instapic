<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back">

            </div>
            <img src="\FilterSelect\title_FilterSelect.svg" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="left">
                <img :src="filterPhoto ?? ''" class="FilterPreview" :style="{ filter: activeFilter }" />
                <img src="\FilterSelect\btn_Next.png" class="btn" @click="handleConfirm" />
            </div>
            <div class="right">
                <div class="right_">
                    <div v-for="filterKey in (Object.keys(filters) as FilterKey[])" :key="filterKey" class="btn_filter"
                        @click="applyFilter(filterKey)" :class="{ 'active': selectedFilterKey === filterKey }">
                        <div :class="`btn_filter_${filterKey}`"></div>
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
type FilterKey = 'ziran' | 'zhigan' | 'jingzhi' | 'jiaopian' | 'heibai';
export default defineComponent({

    setup() {
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_GridSelect);
        let timer: number;
        // 格式化时间为XX:XX
        const formattedTime = computed(() => {
            const mins = Math.floor(timeLeft.value / 60);
            const secs = timeLeft.value % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });

        // 启动定时器
        onMounted(() => {
            console.log(JourneyStore.capturedPhoto)
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
            clearInterval(timer);
        });

        const JourneyStore = useJourneyStore();
        const filterPhoto = computed(() => JourneyStore.filterPhoto);
        // 滤镜参数集合
        const filters = ref({
            ziran: 'saturate(1.2) brightness(1.1) contrast(1.05)',
            zhigan: 'contrast(1.3) saturate(0.9)',
            jingzhi: 'brightness(1.05) contrast(1.2) saturate(1.1)',
            jiaopian: 'sepia(0.6) contrast(1.1) brightness(0.95)',
            heibai: 'grayscale(100%)'
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

        const handleConfirm = () => {
            // 处理确认逻辑
            console.log('Selected filter:', activeFilter.value);
            JourneyStore.setFilter(activeFilter.value);
            router.push({
                name:'Paster'
            });
        };
        return { formattedTime, filterPhoto, applyFilter, activeFilter, filters, handleConfirm, selectedFilterKey };
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
    width: 200px;
    height: 200px;
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

.btn_filter_ziran {
    /* 自动布局子元素 */
    width: 180px;
    height: 180px;

    background: url('/FilterSelect/btn_ziran.png') no-repeat center center / cover;

}

.btn_filter_zhigan {
    /* 自动布局子元素 */
    width: 180px;
    height: 180px;

    background: url('/FilterSelect/btn_zhigan.png') no-repeat center center / cover;
}

.btn_filter_jingzhi {
    /* 自动布局子元素 */
    width: 180px;
    height: 180px;

    background: url('/FilterSelect/btn_jingzhi.png') no-repeat center center / cover;

}

.btn_filter_jiaopian {
    /* 自动布局子元素 */
    width: 180px;
    height: 180px;

    background: url('/FilterSelect/btn_jiaopian.png') no-repeat center center / cover;

}

.btn_filter_heibai {
    /* 自动布局子元素 */
    width: 180px;
    height: 180px;

    background: url('/FilterSelect/btn_heibai.png') no-repeat center center / cover;
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