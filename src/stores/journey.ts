

import router from '@/router';
import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { PG0ExternalServerApi } from '@/Api/PG0ExternalServerApi';
import { useAuthStore, type product,type PhotoFrame } from '@/stores/auth'
interface payment {
    output_str_channel: string;
    output_str_method: string;
}

export const useJourneyStore = defineStore('journey', {
    state: () => ({
        config: useConfigStore(), // 引入配置文件
        auth: useAuthStore(), // 引入配置文件
        num_grid: 4 as number, // 宫格数量
        journeyWay: 0 as number, // 体验方式 1:现场拍摄   2：上传 
        price: 0 as number, // 价格
        selectedProduct: null as product | null,
        payWay: '' as string, // 支付方式 支付宝 微信支付
        couponCode: '' as string, // 优惠码
        couponPrice: 0 as number, // 优惠金额
        selectedFrame: null as PhotoFrame | null,
        selectedFrameUrl: '' as string, // 选中的相框URL
        photos: [] as string[], // 图片数组，用来存放用户拍的照片
        remainAttempts_takePhotos: 2 as number, // 剩余拍摄次数
        capturedPhoto: null as string | null,  // 存储单张照片的blobUrl
        remainAttempts_selectFrame: 1 as number, // 剩余拍摄次数
        filterPhoto: null as string | null, // 过滤后的照片
        filterAndFramePhoto: null as string | null, // 过滤后相框的照片
        PasterPhoto: null as string | null, // 贴纸后照片
        PasterPhotoBlob: null as Blob | null, // 贴纸后照片
        PrintNum: 2 as number, // 打印数量
        overPrintPrice: 10 as number, // 额外打印价格
        overPrintPriceAllToPay: 0 as number, // 额外打印价格总计




        journey_id: '' as string, // 旅程ID
        order_id: '' as string, // 订单ID
        order_add_id: '' as string, // 订单附加ID
        payment: [] as payment[], // 支付方式

        beautyStrength: 0.1 as number, // 美颜强度

    }),

    actions: {
        init() {
            this.journey_id = '';
            this.order_id = '';
            this.order_add_id = '';
            this.photos = [];
            this.remainAttempts_takePhotos = 2;
            this.remainAttempts_selectFrame = 1;
            this.filterPhoto = null;
            this.PasterPhoto = null;
            this.PasterPhotoBlob = null;
            this.filterAndFramePhoto = null;
            this.PrintNum = 2;
            this.journey_id = '';
            this.order_id = '';
            this.order_add_id = '';
            this.payment = [];

            if (this.auth.product_add_price !== undefined) {
                this.overPrintPrice = this.auth.product_add_price
            }
            if (this.config?.remainAttempts_takePhotos !== undefined) {
                this.remainAttempts_takePhotos = this.config.remainAttempts_takePhotos;
            }
            if (this.config?.remainAttempts_selectFrame !== undefined) {
                this.remainAttempts_selectFrame = this.config.remainAttempts_selectFrame;
            }

        },
        clearPhotos() {
            this.photos = [];
        },
        Select_GridNum(num: number) {
            const gridProductMap: Record<number, product | null> = {
                1: this.auth.product_01,
                2: this.auth.product_02,
                4: this.auth.product_04,
                6: this.auth.product_06,
                8: this.auth.product_08
            };
            this.selectedProduct = gridProductMap[num] || null;
            this.num_grid = num;
            if (num === 8) {
                this.PrintNum = 1;
            }
            router.push({ name: 'WaySelect' });
        },
        Select_Way(num: number) {
            this.journeyWay = num;
            router.push({
                name: 'PaySelect',
                params: { isAdd: 'false', isCouponed: 'false' }
            });
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
        setCapturedPhoto(url: string) {
            this.capturedPhoto = url
            this.filterPhoto = url
        },
        clearCapturedPhoto() {
            this.capturedPhoto = null
        },
        setPasterPhoto(url: string) {
            this.PasterPhoto = url
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
        setfilterAndFramePhoto(url: string) {
            this.filterAndFramePhoto = url
        },
        clearfilterAndFramePhoto() {
            this.filterAndFramePhoto = null
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
            if (this.num_grid === 8) {
                this.PrintNum++;
                this.overPrintPriceAllToPay = (this.PrintNum - 1) * this.overPrintPrice;
            } else {
                this.PrintNum++;
                this.overPrintPriceAllToPay = (this.PrintNum - 2) * this.overPrintPrice;
            }
        },
        minusPrintNum() {
            if (this.num_grid === 8) {
                if (this.PrintNum > 1) {
                    this.PrintNum--;
                    this.overPrintPriceAllToPay = (this.PrintNum - 1) * this.overPrintPrice;
                }
            }
            else {
                if (this.PrintNum > 2) {
                    this.PrintNum--;
                    this.overPrintPriceAllToPay = (this.PrintNum - 2) * this.overPrintPrice;
                }
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
            if (!isAdd && this.order_id !== '') {
                console.log('订单ID已存在:', this.order_id);
                return;
            }
            else if (isAdd && this.order_add_id !== '') {
                console.log('附加订单ID已存在:', this.order_add_id);
            }
            else if (!isAdd) {
                if (!this.selectedProduct || !this.selectedProduct.output_id_product) {
                    throw new Error('No product selected or product_id is missing');
                }
                const jsonItem = [{
                    'product_id': this.selectedProduct.output_id_product,
                    'quantity': 1,
                }]
                await PG0ExternalServerApi.OrderCreation('instapic', this.auth.device_id, this.journey_id, jsonItem)
                    .then((res) => {
                        console.log('订单创建:', res);
                        this.price = res[0].output_int4_total_price;
                        this.order_id = res[0].output_id_order;
                    }).catch((error) => {
                        console.error('订单创建请求失败:', error);
                    });
                await this.OrderPolling(isAdd);
                await this.PaymentInquiry(isAdd);
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
                await this.OrderPolling(isAdd);
                await this.PaymentInquiry(isAdd);
            }
        },
        async OrderPolling(isAdd: boolean): Promise<boolean> {
            if (!isAdd) {
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
                        return await this.OrderPolling(isAdd);
                    }
                } catch (error) {
                    console.error('订单轮询请求失败:', error);
                    throw error;
                }
            }
            else {
                try {
                    const res = await PG0ExternalServerApi.OrderPolling(this.order_add_id);
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
                        return await this.OrderPolling(isAdd);
                    }
                } catch (error) {
                    console.error('订单轮询请求失败:', error);
                    throw error;
                }
            }

        },
        async PaymentInquiry(isAdd: boolean) {
            if (!isAdd) {
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
            }
            else {
                await PG0ExternalServerApi.PaymentInquiry(this.order_add_id)
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
            }
        },
        async PaymentPolling(shouldContinue: () => boolean, isAdd: boolean): Promise<boolean> {
            if (!isAdd) {
                try {
                    while (shouldContinue()) {
                        const res = await PG0ExternalServerApi.PaymentPolling(this.order_id);
                        console.log('支付轮询:', res);
                        if (res[0].output_bool_finished) {
                            console.log('支付已完成');
                            return true;
                        } else {
                            console.log('支付未完成，继续轮询');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                    console.log('轮询已被取消');
                    return false;
                } catch (error) {
                    console.error('支付轮询请求失败:', error);
                    throw error;
                }
            }
            else {
                try {
                    while (shouldContinue()) {
                        const res = await PG0ExternalServerApi.PaymentPolling(this.order_add_id);
                        console.log('支付轮询:', res);
                        if (res[0].output_bool_finished) {
                            console.log('支付已完成');
                            return true;
                        } else {
                            console.log('支付未完成，继续轮询');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                    console.log('轮询已被取消');
                    return false;
                } catch (error) {
                    console.error('支付轮询请求失败:', error);
                    throw error;
                }
            }

        },
        async CouponApplyToOrder() {
            console.log('订单id:', this.order_id);
            console.log('设备id:', this.auth.device_id);

            console.log('优惠码:', this.couponCode);
            try {
                const res = await PG0ExternalServerApi.CouponApplyToOrder(
                    this.order_id,
                    this.auth.device_id,
                    this.couponCode
                );
                console.log('应用优惠券回调:', res);
                // 如果后端返回的数组里确实有 output_int_price
                this.order_id = res[0].output_id_order;
                this.price = res[0].output_int_price;
                await this.OrderPolling(false);
                await this.PaymentInquiry(false);
                return res;
            } catch (error) {
                console.error('Store 中 CouponApplyToOrder 出错：', error);
                // 一定要抛出，才能让调用方的 try/catch 捕获
                throw error;
            }
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
