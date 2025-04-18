

import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
    state: () => ({
        price: 35,
        WaitTime_GridSelect: 90, // 宫格选择等待时间
        WaitTime_WaySelect: 90, // 体验方式选择等待时间
        WaitTime_PaySelect: 90, // 支付方式选择等待时间
        WaitTime_InputCoupon: 120, // 输入优惠券等待时间
        WaitTime_Pay: 120, // 支付等待时间
        WaitTime_PhotoFrameSelect: 120, // 选择相框等待时间
        WaitTime_BeautyFilter:35, // 美颜滤镜等待时间
        WaitTime_TakePhoto: 5, // 拍照等待时间
        remainAttempts: 2, // 剩余拍摄次数
    }),
    actions: {

    }

});
