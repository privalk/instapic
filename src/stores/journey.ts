

import router from '@/router';
import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { PG0ExternalServerApi } from '@/Api/PG0ExternalServerApi';
import { useAuthStore } from '@/stores/auth'
interface payment {
    output_str_channel: string;
    output_str_method: string;
}
export const useJourneyStore = defineStore('journey', {
    state: () => ({
        config: useConfigStore(), // 引入配置文件
        auth: useAuthStore(), // 引入配置文件
        num_grid: 1 as number, // 宫格数量
        journeyWay: 0 as number, // 体验方式 1:现场拍摄   2：上传 
        price: 35 as number, // 价格
        payWay: '' as string, // 支付方式 支付宝 微信支付
        couponCode: '' as string, // 优惠码
        couponPrice: 0 as number, // 优惠金额
        selectedFrameUrl: '' as string, // 选中的相框URL
        photos: [] as string[], // 图片数组，用来存放用户拍的照片
        remainAttempts_takePhotos: 2 as number, // 剩余拍摄次数
        capturedPhoto: null as string | null,  // 存储单张照片的base64
        remainAttempts_selectFrame: 1 as number, // 剩余拍摄次数
        filterPhoto: null as string | null, // 过滤后的照片
        PasterPhoto: null as string | null, // 贴纸后照片
        PasterPhotoBlob: null as Blob | null, // 贴纸后照片
        PrintNum: 1 as number, // 打印数量
        overPrintPrice: 10 as number, // 额外打印价格
        overPrintPriceAllToPay: 0 as number, // 额外打印价格总计




        journey_id: '' as string, // 旅程ID
        order_id: '' as string, // 订单ID
        order_add_id: '' as string, // 订单附加ID
        payment: [] as payment[], // 支付方式



    }),

    actions: {
        init() {
            this.journey_id = '';
            this.order_id = '';
            this.order_add_id = '';
            if (this.auth.product_price !== undefined) {
                this.price = this.auth.product_price
            }
            if (this.auth.product_add_price !== undefined) {
                this.overPrintPrice = this.auth.product_add_price
            }
            if (this.config?.remainAttempts_takePhotos !== undefined) {
                this.remainAttempts_takePhotos = this.config.remainAttempts_takePhotos;
            }
            if (this.config?.remainAttempts_selectFrame !== undefined) {
                this.remainAttempts_selectFrame = this.config.remainAttempts_selectFrame;
            }
            if (this.config?.overPrintPrice !== undefined) {
                this.overPrintPrice = this.config.overPrintPrice;
            }
        },
        clearPhotos() {
            this.photos = [];
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
            this.filterPhoto = base64Data
        },
        clearCapturedPhoto() {
            this.capturedPhoto = null
        },
        setPasterPhoto(base64Data: string) {
            this.PasterPhoto = base64Data
        },
        clearPasterPhoto() {
            this.PasterPhoto = null
        },
        setPasterPhotoBlob(blob: Blob) {
            this.PasterPhotoBlob = blob
        },
        clearPasterPhotoBlob() {
            this.PasterPhotoBlob = null
        },
        setFilter(filter: string) {
            if (!this.capturedPhoto) {
                console.error('No captured photo to apply filter to.');
                return Promise.resolve(false);
            };

            return new Promise((resolve) => {
                const img = new Image();
                img.src = this.capturedPhoto!;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(false);
                        return;
                    }

                    // 应用滤镜
                    ctx.filter = filter;
                    ctx.drawImage(img, 0, 0);

                    // 转换为Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(false);
                            return;
                        }

                        // 生成Blob URL
                        const blobURL = URL.createObjectURL(blob);

                        // 更新存储的URL
                        if (this.filterPhoto) {
                            URL.revokeObjectURL(this.filterPhoto); // 释放之前的Blob URL
                        }

                        this.filterPhoto = blobURL;
                        this.PasterPhoto = blobURL;
                        this.PasterPhotoBlob = blob;
                        console.log('Filtered blob:', blob);
                        resolve(true);
                    }, 'image/png');
                };

                img.onerror = () => {
                    console.error('Failed to load image');
                    resolve(false);
                };
            });
        },
        downloadFilteredImage(blobURL: string) {
            const link = document.createElement('a');
            link.download = `filtered_${Date.now()}.png`;
            link.href = blobURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        addPrintNum() {
            this.PrintNum++;
            this.overPrintPriceAllToPay = (this.PrintNum - 1) * this.overPrintPrice;
        },
        minusPrintNum() {
            if (this.PrintNum > 1) {
                this.PrintNum--;
                this.overPrintPriceAllToPay = (this.PrintNum - 1) * this.overPrintPrice;
            }
        },

        async JourneyCreation() {
            await PG0ExternalServerApi.JourneyCreation(this.auth.device_id)
                .then((res) => {
                    this.journey_id = res[0].output_id_journey;
                    console.log('开始journey journey_id:', this.journey_id);
                })
                .catch((error) => {
                    console.error('journey注册请求失败:', error);
                });
        },
        async OrderCreation(isAdd: boolean) {
            if (this.order_id !== '') {
                console.log('订单ID已存在:', this.order_id);
                return;
            }
            if (!isAdd) {
                const jsonItem = [{
                    'product_id': this.auth.product_id,
                    'quantity': 1,
                }]
                await PG0ExternalServerApi.OrderCreation('instapic', this.auth.device_id, this.journey_id, jsonItem)
                    .then((res) => {
                        console.log('订单创建:', res);
                        this.order_id = res[0].output_id_order;
                    }).catch((error) => {
                        console.error('订单创建请求失败:', error);
                    });
                await this.OrderPolling();
                await this.PaymentInquiry();
            }
            else {
                const josnItem = [{
                    'product_id': this.auth.product_add_id,
                    'quantity': this.PrintNum - 1,
                }]
                await PG0ExternalServerApi.OrderCreation('instapic', this.auth.device_id, this.journey_id, josnItem)
                    .then((res) => {
                        console.log('订单创建:', res);
                        this.order_add_id = res[0].output_id_order;
                    }).catch((error) => {
                        console.error('订单创建请求失败:', error);
                    });
                await this.OrderPolling();
                await this.PaymentInquiry();
            }
        },
        async OrderPolling(): Promise<boolean> {
            try {
                const res = await PG0ExternalServerApi.OrderPolling(this.order_id);
                console.log('订单轮询:', res);
                if (res[0].output_bool_exist) {
                    console.log('订单支付方式已创建');
                    // 当确认存在时，结束轮询
                    return true;
                } else {
                    console.log('订单支付方式未创建');
                    // 等待1秒后继续轮询
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // 递归调用，直到条件满足
                    return await this.OrderPolling();
                }
            } catch (error) {
                console.error('订单轮询请求失败:', error);
                throw error;
            }
        },
        async PaymentInquiry() {
            await PG0ExternalServerApi.PaymentInquiry(this.order_id)
                .then((res) => {
                    console.log('订单支付方式查询:', res);
                    // 提取 payment 数据
                    this.payment = res.map((item: any) => ({
                        output_str_channel: item.output_str_channel,
                        output_str_method: item.output_str_method
                    }));

                }).catch((error) => {
                    console.error('订单支付方式查询请求失败:', error);
                });
        },
        async PaymentPolling(): Promise<boolean> {
            try {
                const res = await PG0ExternalServerApi.PaymentPolling(this.order_id);
                console.log('支付轮询:', res);
                if (res[0].output_bool_finished) {
                    console.log('支付已完成');
                    // 当确认存在时，结束轮询
                    return true;
                } else {
                    console.log('支付未完成');
                    // 等待1秒后继续轮询
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // 递归调用，直到条件满足
                    return await this.PaymentPolling();
                }
            } catch (error) {
                console.error('支付轮询请求失败:', error);
                throw error;
            }


        },
        async CouponApplyToOrder() {
            await PG0ExternalServerApi.CouponApplyToOrder(this.order_id, this.auth.device_id, this.couponCode)
                .then((res) => {
                    console.log('优惠券应用:', res);
                    this.price = res[0].output_int_price;

                }).catch((error) => {
                    console.error('优惠券应用请求失败:', error);
                });
        },
        async PromptCreation() {
            await PG0ExternalServerApi.PromptCreation(this.journey_id, this.order_id, this.order_add_id, '')
                .then((res) => {
                    console.log('提示创建:', res);
                }).catch((error) => {
                    console.error('提示创建请求失败:', error);
                });
        },
        async PromptUpdate() {
            const jsonItem = [{
                'product_id': this.auth.product_add_id,
                'quantity': 1,
            }]
            await PG0ExternalServerApi.PromptUpdate(this.auth.device_id, this.journey_id, this.order_id, this.auth.mac, jsonItem)
                .then((res) => {
                    console.log('提示更新:', res);
                }).catch((error) => {
                    console.error('提示更新请求失败:', error);
                });
        }

    }

});
