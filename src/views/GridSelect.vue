<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back" @click="ClickToBack">
                <img src="/GridSelect/btn_Back.svg" alt="btn_back" width="74px" height="74px" />
            </div>
            <img src="/GridSelect/title_GridSelect.svg" alt="title_GridSelect" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="up">
                <div class="btn_GridType" @click="Select_GridNum(1)">
                    <div class="btn_GridType_inner">
                        <img src="/GridSelect/text_Grid1.svg" />
                        <img src="/GridSelect/img_Grid1.svg" />
                        <img src="/GridSelect/img_Logo.svg" />
                    </div>
                </div>
                <div class="btn_GridType" @click="Select_GridNum(2)">
                    <div class="btn_GridType_inner">
                        <img src="/GridSelect/text_Grid2.svg" />
                        <img src="/GridSelect/img_Grid2.svg" />
                        <img src="/GridSelect/img_Logo.svg" />
                    </div>
                </div>
                <div class="btn_GridType" @click="Select_GridNum(4)">
                    <div class="btn_GridType_inner">
                        <img src="/GridSelect/text_Grid4.svg" />
                        <img src="/GridSelect/img_Grid4.svg" />
                        <img src="/GridSelect/img_Logo.svg" />
                    </div>
                </div>
            </div>
            <div class="down">
                <div class="btn_GridType" @click="Select_GridNum(6)">
                    <div class="btn_GridType_inner">
                        <img src="/GridSelect/text_Grid6.svg" />
                        <img src="/GridSelect/img_Grid6.svg" />
                        <img src="/GridSelect/img_Logo.svg" />
                    </div>
                </div>
                <div class="btn_GridType" @click="Select_GridNum(8)">
                    <div class="btn_GridType_inner">
                        <img src="/GridSelect/text_Grid8.svg" />
                        <img src="/GridSelect/img_Grid8.svg" />
                        <img src="/GridSelect/img_Logo.svg" />
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

export default defineComponent({

    setup() {
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_GridSelect);
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
                    router.back();
                    clearInterval(timer);
                }
            }, 1000);
        });

        // 清除定时器
        onUnmounted(() => {
            clearInterval(timer);
        });

        const JourneyStore = useJourneyStore();

        return { formattedTime, ClickToBack, Select_GridNum: JourneyStore.Select_GridNum };
    },
});
</script>

<style scoped>
.btn_GridType_inner {
    /* 自动布局子元素 */
    width: 450px;
    height: 320px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: 10px;
    z-index: 0;

    border-radius: 24px;
    background: linear-gradient(35deg, rgba(255, 255, 255, 0.9) -80%, rgba(255, 255, 255, 0.9) -28%, rgba(254, 254, 254, 0.8982) 1%, rgba(255, 255, 255, 0.261) 49%, rgba(232, 232, 232, 0.7382) 81%, rgba(229, 229, 229, 0.9) 128%), #F3F3F3;
    box-sizing: border-box;
    /* border: 2px solid; */
    border-image: linear-gradient(180deg, #FFFFFF 0%, rgba(141, 141, 141, 0.15) 100%) 2;
}

.btn_GridType {
    /* 自动布局子元素 */
    width: 470px;
    height: 340px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    z-index: 0;

    border-radius: 36px;
    box-sizing: border-box;
    /* border: 10px solid; */
    border-image: linear-gradient(180deg, rgba(135, 135, 135, 0.46) 0%, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 100%) 10;
    box-shadow: inset 0px 1px 10px 0px rgba(255, 255, 255, 0.3), inset 1px 0px 5px 0px rgba(0, 0, 0, 0.3), inset 0px 0px 5px 0px rgba(234, 234, 234, 0.3), inset 0px 1px 5px 0px rgba(0, 0, 0, 0.3);
}

.down {
    /* 自动布局子元素 */
    width: 1750px;
    height: 325.5px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 1;
}

.up {
    /* 自动布局子元素 */
    width: 1750px;
    height: 325.5px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px;
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

.btn_GridType:active,
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
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 36px 0px;
    gap: 48px;
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