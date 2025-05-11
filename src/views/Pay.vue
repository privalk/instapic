<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back" @click="ClickToBack">
                <img src="/GridSelect/btn_Back.svg" alt="btn_back" width="74px" height="74px" />
            </div>
            <img v-if="payWay === '微信支付'" src="/Pay/title_wechatPay.svg" />
            <img v-if="payWay === '支付宝'" src="/Pay/title_aliPay.svg" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="QRcode">
                <div class="QRcode_">
                    <div class="QRcode__">
                        <template v-if="currentPayment">
                            <qrcode-vue :value="currentPayment.output_str_method" :size="350" level="H"
                                background="#ffffff" foreground="#000000" />
                        </template>
                        <div v-else class="loading">
                            正在加载支付信息...
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
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';
import QrcodeVue from 'qrcode.vue'

export default defineComponent({
    components: {
        QrcodeVue
    },
    setup() {
        const isAdd: boolean = router.currentRoute.value.params.isAdd === 'true';
        const journeyStore = useJourneyStore();
        const configStore = useConfigStore();
        const timeLeft = ref(configStore.WaitTime_Pay);
        const isPollingActive = ref(true); // 控制是否继续轮询

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
        onMounted(async () => {
            timer = setInterval(() => {
                if (timeLeft.value > 0) {
                    timeLeft.value--;
                } else {
                    router.back();
                    clearInterval(timer);
                }
            }, 1000);
            await startPaymentPolling();

        });

        // 清除定时器
        onUnmounted(() => {
            clearInterval(timer);
            isPollingActive.value = false; // 终止轮询
        });

        const startPaymentPolling = async () => {
            const success = await journeyStore.PaymentPolling(() => isPollingActive.value,isAdd);
            if (success) {
                handlePayed();
            }
        };
        const handlePayed = () => {
            if (isAdd) {
                router.push({
                    name: 'PrintAndGet'
                })
            }
            else {
                router.push({
                    name: 'TakePhoto'
                });
            }

        };
        const payWay = computed(() => {
            return journeyStore.payWay;
        });
        const currentPayment = computed(() => {
            return journeyStore.payment.find(
                p => p.output_str_channel === journeyStore.payWay
            )
        })
        return { formattedTime, ClickToBack, payWay, handlePayed, currentPayment };
    },
});
</script>

<style scoped>
.QRcode__ {
    /* 自动布局子元素 */
    width: 398px;
    height: 398px;
    /* 自动布局 */
    display: flex;
    padding: 24px;
    gap: 0px 10px;
    flex-wrap: wrap;
    align-content: flex-start;
    z-index: 0;
    border-radius: 16px;
    background: #FFFFFF;
}

.QRcode_ {
    /* 自动布局子元素 */
    width: 520px;
    height: 520px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: 26px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;
    border-radius: 24px;
    background: linear-gradient(27deg, rgba(255, 255, 255, 0.9) -94%, rgba(255, 255, 255, 0.9) -37%, rgba(254, 254, 254, 0.8982) -3%, rgba(255, 255, 255, 0.261) 49%, rgba(232, 232, 232, 0.7382) 84%, rgba(229, 229, 229, 0.9) 137%), #F3F3F3;
    box-sizing: border-box;
    /* border: 2px solid; */
    border-image: linear-gradient(180deg, #FFFFFF 0%, rgba(141, 141, 141, 0.15) 100%) 2;
}

.QRcode {
    /* 自动布局子元素 */
    width: 520px;
    height: 520px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 10px;
    z-index: 0;
    border-radius: 36px;
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