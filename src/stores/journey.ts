

import router from '@/router';
import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config'
export const useJourneyStore = defineStore('journey', {
    state: () => ({
        config: useConfigStore(), // 引入配置文件
        num_grid: 4 as number, // 宫格数量
        journeyWay: 0 as number, // 体验方式 1:现场拍摄   2：上传 
        price: 35 as number, // 价格
        payWay: 0 as number, // 支付方式 1:支付宝 2:微信
        couponCode: '' as string, // 优惠码
        couponPrice: 0 as number, // 优惠金额
        photos: [] as string[], // 图片数组，用来存放用户拍的照片
        remainAttempts_takePhotos: 2 as number, // 剩余拍摄次数
        capturedPhoto: null as string | null,  // 存储单张照片的base64
        remainAttempts_selectFrame: 1 as number, // 剩余拍摄次数
    }),
    actions: {
        init() {
            if (this.config?.price !== undefined) {
                this.price = this.config.price;
            }
            if (this.config?.remainAttempts_takePhotos !== undefined) {
                this.remainAttempts_takePhotos = this.config.remainAttempts_takePhotos;
            }
            if (this.config?.remainAttempts_selectFrame !== undefined) {
                this.remainAttempts_selectFrame = this.config.remainAttempts_selectFrame;
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
        decrementAttempt(type: string) {  // 新增响应式修改方法
            if (type === 'takePhotos') {
                if (this.remainAttempts_takePhotos > 0) {
                    this.remainAttempts_takePhotos--;
                }
            }
            else if (type === 'selectFrame') {
                if (this.remainAttempts_selectFrame > 0) {
                    this.remainAttempts_selectFrame--;
                }
            }

        },
        setCapturedPhoto(base64Data: string) {
            this.capturedPhoto = base64Data
        },
        clearCapturedPhoto() {
            this.capturedPhoto = null
        }

    }

});
