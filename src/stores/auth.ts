

import { PG0ExternalServerApi } from '@/Api/PG0ExternalServerApi';
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';
export interface product {
    output_id_product: string,
    output_int4_price: number,
    output_str_title: string,
}
export interface regions {
    x: number,
    y: number,
    width: number,
    height: number
    rotate: number,
}
export interface PhotoFrame {
    url: string,
    regions: regions[]
}
export const useAuthStore = defineStore('auth', {
    state: () => ({
        device_id: '' as string, // 设备ID
        mac: uuidv4(),
        serviceUrl: '' as string, // 服务地址
        // product_id: '' as string, // 商品ID
        // product_price: 0 as number, // 商品价格
        product_add_id: '' as string, // 商品附加ID
        product_add_price: 0 as number, // 商品附加价格
        product: [] as product[],
        product_01: null as product | null,
        product_02: null as product | null,
        product_04: null as product | null,
        product_06: null as product | null,
        product_08: null as product | null,
        Instapic_FrameType_00: [] as PhotoFrame[],
        Instapic_FrameType_01: [] as PhotoFrame[],
        Instapic_FrameType_02: [] as PhotoFrame[],
        Instapic_FrameType_04: [] as PhotoFrame[],
        Instapic_FrameType_06: [] as PhotoFrame[],
        Instapic_FrameType_08: [] as PhotoFrame[],
        Instapic_Paster_01: [] as string[],
        Instapic_Paster_02: [] as string[],
        Instapic_Paster_04: [] as string[],
        Instapic_Paster_06: [] as string[],
        Instapic_Paster_08: [] as string[],
    }),
    persist: true, // 启用持久化
    actions: {

        async DeviceCreation() {
            if (this.device_id === '') {
                await PG0ExternalServerApi.DeviceCreation('', 'Instapic测试地点', this.mac, '', 'Instapic')
                    .then((res) => {
                        console.log('设备注册:', res);

                        this.device_id = res[0].output_id_device;
                        console.log('设备ID:', this.device_id);

                    })
                    .catch((error) => {
                        console.error('设备注册请求失败:', error);
                    });
            }
            else {
                console.log('设备ID已存在:', this.device_id);
            }
        },
        async ServiceInquiry() {
            if (this.device_id !== '') {
                await PG0ExternalServerApi.ServiceInquiry(this.device_id, this.mac)
                    .then((res) => {
                        console.log('服务查询:', res);

                        this.serviceUrl = res[0].output_str_service_url;
                        console.log('服务地址:', this.serviceUrl);

                    })
                    .catch((error) => {
                        console.error('服务查询请求失败:', error);
                    });
            }
            else {
                console.error('设备ID为空，无法进行服务查询');
            }
        },
        async GoodInquiry() {
            if (this.device_id !== '') {
                await PG0ExternalServerApi.GoodInquiry(this.device_id, this.mac)
                    .then((res) => {
                        this.product = [];
                        // 清空原有分类
                        this.product_01 = null;
                        this.product_02 = null;
                        this.product_04 = null;
                        this.product_06 = null;
                        this.product_08 = null;

                        console.log('商品查询:', res);
                        for (const item of res) {
                            const productItem = {
                                output_id_product: item.output_id_product,
                                output_int4_price: item.output_int4_price,
                                output_str_title: item.output_str_title,
                            };
                            this.product.push(productItem);

                            // 分类逻辑
                            const title = item.output_str_title;
                            if (title.includes('AddPrint')) {
                                this.product_add_id = item.output_id_product;
                                this.product_add_price = item.output_int4_price;
                            }
                            // 使用正则表达式匹配宫格类型
                            else if (/(一|二|四|六|八)宫格/.test(title)) {
                                const suffixMap: Record<string, 'product_01' | 'product_02' | 'product_04' | 'product_06' | 'product_08'> = {
                                    '一': 'product_01',
                                    '二': 'product_02',
                                    '四': 'product_04',
                                    '六': 'product_06',
                                    '八': 'product_08',
                                };

                                const match = title.match(/(一|二|四|六|八)/);
                                if (match && suffixMap[match[1]]) {
                                    this[suffixMap[match[1]]] = productItem;
                                }
                            }
                        }
                        console.log('商品分类结果:', {
                            product_01: this.product_01,
                            product_02: this.product_02,
                            product_04: this.product_04,
                            product_06: this.product_06,
                            product_08: this.product_08,
                        });
                    })
                    .catch((error) => {
                        console.error('商品查询请求失败:', error);
                    });
            }
            else {
                console.error('设备ID为空，无法进行商品查询');
            }
        },
        async SpecificationInquiry() {
            if (!this.device_id) {
                console.error('设备ID为空，无法查询');
                return;
            }

            try {
                const suffixMap: Record<string, string> = {
                    Eight: '08',
                    Four: '04',
                    Six: '06',
                    Two: '02',
                    One: '01',
                    Zero: '00',
                };

                for (const productItem of this.product) {
                    if (productItem.output_str_title != 'AddPrint') {
                        const res = await PG0ExternalServerApi.SpecificationInquiry(
                            this.device_id,
                            this.mac,
                            productItem.output_id_product
                        );
                        console.log('规格查询结果:', res);

                        const baseUrl = this.serviceUrl.replace(/\/$/, '');
                        let frameTypeSuffix = '00';
                        let configUrl = '';

                        // 提取宫格类型和配置URL
                        for (const item of res) {
                            if (item.output_str_type === 'Instapic_FrameType') {
                                const frameType = item.output_str_value;
                                frameTypeSuffix = suffixMap[frameType] || '00';
                            } else if (item.output_str_type === 'ComfyUI_Properties') {
                                configUrl = item.output_str_value;
                            }
                        }

                        if (!configUrl) {
                            console.error('未找到配置文件URL');
                            continue;
                        }

                        // 获取并解析配置文件
                        const response = await fetch(configUrl);
                        if (!response.ok) {
                            console.error('配置文件获取失败:', response.status);
                            continue;
                        }
                        const cfg = await response.json();
                        console.log('配置文件内容:', cfg);

                        // 生成存储键名
                        const frameKey = `Instapic_FrameType_${frameTypeSuffix}` as keyof ReturnType<typeof useAuthStore>['$state'];
                        const pasterKey = `Instapic_Paster_${frameTypeSuffix}` as keyof ReturnType<typeof useAuthStore>['$state'];

                        // 处理相框数据（保持嵌套结构）
                        const processedFrames = cfg.PhotoFrame?.map((pf: any) => ({
                            url: `${baseUrl}${pf.url}`,
                            regions: pf.regions.map((region: any) => ({
                                x: region.x,
                                y: region.y,
                                width: region.width,
                                height: region.height,
                                rotate: region.rotate,
                            }))
                        })) || [];

                        // 处理贴纸数据
                        const processedPasters = cfg.Paster?.map((p: string) => `${baseUrl}${p}`) || [];

                        // 更新状态
                        (this as any)[frameKey] = processedFrames;
                        (this as any)[pasterKey] = processedPasters;
                    }


                }
                console.log('宫格配置更新完成');
            } catch (err) {
                console.error('规格查询过程中出错:', err);
            }
        }




    }

});
