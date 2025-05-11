<template>
    <v-container fluid class="container">
        <div class="header">
            <div class="btn_back" @click="ClickToBack">
                <img src="/GridSelect/btn_Back.svg" alt="btn_back" width="74px" height="74px" />
            </div>
            <img src="/InputCoupon/titile_inputCoupon.svg" />
            <div class="time">
                <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="instruction">
                <img src="\InputCoupon\text_instruction.svg" />
            </div>
            <div class="inputArea">
                <div class="keyBoard">
                    <div class="inputField">
                        <input type="text" class="input" placeholder="请输入序列号" v-model="couponCode" readonly
                            style="width: 100%; height: 100%; border: none; outline: none;" />
                    </div>
                    <div class="keyBoardNum">
                        <div class="keyBoardNum_">
                            <div class="keyBoardNum__">
                                <div class="keyBoardNum___">
                                    <div class="btn_num" @click="handleNumberInput('1')">
                                        <div class="btn_num_">
                                            1
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('2')">
                                        <div class="btn_num_">
                                            2
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('3')">
                                        <div class="btn_num_">
                                            3
                                        </div>
                                    </div>
                                </div>
                                <div class="keyBoardNum___">
                                    <div class="btn_num" @click="handleNumberInput('4')">
                                        <div class="btn_num_">
                                            4
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('5')">
                                        <div class="btn_num_">
                                            5
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('6')">
                                        <div class="btn_num_">
                                            6
                                        </div>
                                    </div>
                                </div>
                                <div class="keyBoardNum___">
                                    <div class="btn_num" @click="handleNumberInput('7')">
                                        <div class="btn_num_">
                                            7
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('8')">
                                        <div class="btn_num_">
                                            8
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('9')">
                                        <div class="btn_num_">
                                            9
                                        </div>
                                    </div>
                                </div>
                                <div class="keyBoardNum___">
                                    <div class="btn_num" @click="clearInput">
                                        <div class="btn_num_clear">
                                            清空
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="handleNumberInput('0')">
                                        <div class="btn_num_">
                                            0
                                        </div>
                                    </div>
                                    <div class="btn_num" @click="deleteLastChar">
                                        <div class="btn_num_clear">
                                            删除
                                        </div>
                                    </div>
                                </div>
                                <div class="confirm-btn" @click="submitCoupon">
                                    <img src="/InputCoupon/btn_Comfirm.png" alt="确认" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="/GridSelect/img_Footer.svg" />
        </div>
        <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" bottom right elevation="2" color="error"
            class="center-snackbar">
            {{ snackbar.message }}
        </v-snackbar>
        <v-overlay :model-value="isLoading" persistent :value="isLoading" absolute
            class="d-flex justify-center align-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useConfigStore } from '@/stores/config';
import router from '@/router';
import { useJourneyStore } from '@/stores/journey';

export default defineComponent({

    setup() {
        // 新增：snackbar 状态
        const snackbar = ref({
            show: false,
            message: '',
            timeout: 3000,  // 3 秒后自动消失
        });
        const configStore = useConfigStore();
        const isLoading = ref(false);
        const timeLeft = ref(configStore.WaitTime_InputCoupon);
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

        const journeyStore = useJourneyStore();


        const couponCode = computed({
            get: () => journeyStore.couponCode,
            set: (val) => journeyStore.couponCode = val
        });
        const handleNumberInput = (num: string) => {

            couponCode.value += num;

        };
        const clearInput = () => {
            couponCode.value = '';
        };
        const deleteLastChar = () => {
            couponCode.value = couponCode.value.slice(0, -1);
        };
        const submitCoupon = async () => {
            try {
                isLoading.value = true;
                // 假设你的 store 方法改为抛出异常，而不是内部 catch
                await journeyStore.CouponApplyToOrder();
                // 如果需要成功提示，也可以在这里处理
                router.push({
                    name: 'PaySelect',
                    params: {
                        isAdd:'false'
                    }
                });
            } catch (error) {

                snackbar.value.message = '优惠券应用失败,请检查是否正确。';
                snackbar.value.show = true;
                console.error('优惠券应用请求失败:', error);
            }
            finally {
                isLoading.value = false;
            }
        };

        return { formattedTime, ClickToBack, handleNumberInput, clearInput, deleteLastChar, submitCoupon, couponCode, snackbar,isLoading };
    },
});
</script>

<style scoped>
.confirm-btn:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.btn_num:active,
.btn_num_clear:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.center-snackbar {
    /* 水平、垂直都居中 */
    top: 20% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    /* 如果你只想水平居中又想在底部偏上显示，把 top 改成 bottom，再调整 translateY */
}

.btn_num_clear {
    /* 自动布局子元素 */
    width: 179px;
    height: 66px;
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
    border-radius: 14px;
    background: linear-gradient(57deg, rgba(0, 0, 0, 0.9) -9%, rgba(38, 38, 38, 0.9) 18%, rgba(70, 70, 70, 0.9) 35%, rgba(55, 55, 55, 0.9) 56%, rgba(26, 26, 26, 0.8982) 112%), #797979;
    box-sizing: border-box;
    /* border: 2px solid; */
    border-image: linear-gradient(180deg, #999999 0%, rgba(108, 108, 108, 0.15) 100%) 2;
    font-family: PingFang SC;
    font-size: 36px;
    font-weight: 500;
    line-height: normal;
    text-align: center;
    letter-spacing: 0.04em;
    color: #E7E7E7;
}

.btn_num_ {
    /* 自动布局子元素 */
    width: 179px;
    height: 66px;
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
    border-radius: 14px;
    background: linear-gradient(54deg, rgba(255, 255, 255, 0.9) -55%, rgba(255, 255, 255, 0.9) -14%, rgba(254, 254, 254, 0.8982) 10%, rgba(255, 255, 255, 0.261) 49%, rgba(232, 232, 232, 0.7382) 75%, rgba(229, 229, 229, 0.9) 113%), #F3F3F3;
    box-sizing: border-box;
    /* border: 2px solid; */
    border-image: linear-gradient(180deg, #FFFFFF 0%, rgba(141, 141, 141, 0.15) 100%) 2;
    font-family: DIN;
    font-size: 36px;
    font-weight: bold;
    line-height: normal;
    text-align: center;
    letter-spacing: 0.04em;
    color: #525252;
}

.btn_num {
    /* 自动布局子元素 */
    width: 199px;
    height: 86px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    z-index: 0;
    border-radius: 24px;
    box-sizing: border-box;
    /* border: 10px solid; */
    border-image: linear-gradient(180deg, rgba(135, 135, 135, 0.46) 0%, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 100%) 10;
    box-shadow: inset 0px 1px 10px 0px rgba(255, 255, 255, 0.3), inset 1px 0px 5px 0px rgba(0, 0, 0, 0.3), inset 0px 0px 5px 0px rgba(234, 234, 234, 0.3), inset 0px 1px 5px 0px rgba(0, 0, 0, 0.3);
}

.keyBoardNum___ {
    /* 自动布局子元素 */
    width: 645px;
    height: 86px;
    /* 自动布局 */
    display: flex;
    padding: 0px;
    gap: 24px;
    z-index: 0;
}

.keyBoardNum__ {
    /* 自动布局子元素 */
    width: 645px;
    height: 416px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 24px;
    z-index: 0;
}

.keyBoardNum_ {
    /* 自动布局子元素 */
    width: 645px;
    height: 416px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 24px;
    z-index: 0;
}

.keyBoardNum {
    /* 自动布局子元素 */
    width: 645px;
    height: 416px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 36px;
    z-index: 1;
}

.inputField {
    /* 自动布局子元素 */
    width: 645px;
    height: 98px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 24px 48px 24px 24px;
    gap: 10px;
    z-index: 0;
    border-radius: 16px;
    background: #FFFFFF;
    font-size: 2.5rem;
}

.keyBoard {
    /* 自动布局子元素 */
    width: 645px;
    height: 702px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 36px;
    z-index: 0;
}

.inputArea {
    /* 自动布局子元素 */
    width: 773px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 64px 0px 64px;
    gap: 36px;
    align-self: stretch;
    z-index: 1;
}

.instruction {
    /* 自动布局子元素 */
    width: 726px;
    height: 632px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 48px;
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
    gap: 80px;
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