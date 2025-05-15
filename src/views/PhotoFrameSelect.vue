<template>
    <v-container fluid class="container">
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">
                <!-- <img src="/GridSelect/btn_Back.svg" alt="btn_back" width="74px" height="74px" /> -->
            </div>
            <img src="/PhotoFrameSelect/title_PhotoFrameSelect.svg" />
            <div class="time">
                <!-- <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div> -->
            </div>
        </div>

        <div class="body">
            <div class="choosedArea">
                <div class="PhotoFrameSelected">
                    <img :src="selectedFrame" alt="PhotoFrameSelected" class="selected-frame" />
                </div>
                <img src="/PhotoFrameSelect/btn_nextStep.svg" class="btn" @click="ClickToNext" />
            </div>
            <div class="toChooseArea">
                <div v-for="(frame, index) in frameList" :key="index" class="frame-item" @click="selectFrame(frame)">
                    <img :src="frame" alt="frame" class="frame-image" />
                </div>
            </div>
        </div>

    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import { useAuthStore } from '@/stores/auth';
import TimeSlider from '@/components/TimeSlider.vue'
export default defineComponent({
    components: {
        TimeSlider
    },
    setup() {
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_PhotoFrameSelect);
        const timeAll = ref(configStore.WaitTime_PhotoFrameSelect);
        const sliderValue = computed(() => {
            return timeLeft.value;
        })
        let timer: ReturnType<typeof setInterval>;
        // 格式化时间为XX:XX

        // const ClickToBack = () => {
        //     router.back();
        // };
        const ClickToNext = () => {
            router.push({
                name: 'EditPhotos'
            });
        };
        // 启动定时器
        onMounted(() => {
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    ClickToNext();
                    clearInterval(timer);
                }
            }, 1000);
        });

        // 清除定时器
        onUnmounted(() => {
            clearInterval(timer);
        });

        const journeyStore = useJourneyStore();
        const authStore = useAuthStore();
        const selectedFrame = ref<string>('');
        const frameList = computed(() => {
            const frameTypeMap: Record<number, string[]> = {
                1: authStore.Instapic_FrameType_01,
                2: authStore.Instapic_FrameType_02,
                4: authStore.Instapic_FrameType_04,
                6: authStore.Instapic_FrameType_06,
                8: authStore.Instapic_FrameType_08,
            };
            return frameTypeMap[journeyStore.num_grid] || [];
        });
        const selectFrame = (frameUrl: string) => {
            selectedFrame.value = frameUrl;
            journeyStore.selectedFrameUrl = frameUrl; // 存储到store
        };
        watch(
            () => frameList.value,
            (newList) => {
                if (newList.length > 0 && !selectedFrame.value) {
                    selectFrame(newList[0]);
                }
            },
            { immediate: true }
        );

        return {
            timeAll, sliderValue, ClickToNext, frameList,
            selectedFrame,
            selectFrame
        };
    },
});
</script>

<style scoped>
.toChooseArea {
    /* 自动布局子元素 */
    width: 900px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    overflow-y: auto;
    max-height: 700px;
    padding: 20px;
    justify-content: flex-start;
}

.frame-item {
    width: 226px;
    height: 336px;
    cursor: pointer;
    transition: transform 0.2s;
}

.frame-item:hover {
    transform: scale(1.05);
}

.frame-image {
    width: 226px;
    height: 336px;
    object-fit: contain;
    /* border-radius: 10px; */
    background: #D8D8D8;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.selected-frame {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #D8D8D8;

    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.PhotoFrameSelected {
    /* 自动布局子元素 */
    width: 383px;
    height: 570px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 10px;
    z-index: 0;
}

.choosedArea {
    /* 自动布局子元素 */
    width: 850px;
    height: 829px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 0px;
    gap: 36px;
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
