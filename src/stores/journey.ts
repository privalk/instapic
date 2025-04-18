

import router from '@/router';
import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config'
export const useJourneyStore = defineStore('journey', {
    state: () => ({
        config: useConfigStore(), // 引入配置文件
        num_grid: 4 as number, // 宫格数量
        journeyWay: 0 as number, // 体验方式 1:上传   2：现场拍摄
        price: 35 as number, // 价格
        payWay: 0 as number, // 支付方式 1:支付宝 2:微信
        couponCode: '' as string, // 优惠码
        couponPrice: 0 as number, // 优惠金额
        photos: [] as string[], // 图片数组，用来存放用户拍的照片
        remainAttempts: 2 as number, // 剩余拍摄次数
    }),
    actions: {
        init() {
            if (this.config?.price !== undefined) {
                this.price = this.config.price;
            }
            if (this.config?.remainAttempts !== undefined) {
                this.remainAttempts = this.config.remainAttempts;
            }
        },

        Select_GridNum(num: number) {
            this.num_grid = num;
            router.push({ name: 'WaySelect' });
        },
        Select_Way(num: number) {
            this.journeyWay = num;
            router.push({ name: 'PaySelect' });
        },
        decrementAttempt() {  // 新增响应式修改方法
            if (this.remainAttempts > 0) {
                this.remainAttempts--;
            }
        },

    }

});
