

import { PG0ExternalServerApi } from '@/Api/PG0ExternalServerApi';
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        device_id: '' as string, // 设备ID
        mac: uuidv4(),
        serviceUrl: '' as string, // 服务地址
        product_id: '' as string, // 商品ID
        product_price: 0 as number, // 商品价格
        product_add_id: '' as string, // 商品附加ID
        product_add_price: 0 as number, // 商品附加价格
        Instapic_FrameType_01: [] as string[],
        Instapic_FrameType_02: [] as string[],
        Instapic_FrameType_04: [] as string[],
        Instapic_FrameType_06: [] as string[],
        Instapic_FrameType_08: [] as string[],
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
                        console.log('商品查询:', res);
                        this.product_id = res[0].output_id_product;
                        this.product_price = res[0].output_int4_price;
                        console.log('主商品:', this.product_id, this.product_price);
                        this.product_add_id = res[1].output_id_product;
                        this.product_add_price = res[1].output_int4_price;
                        console.log('附加商品:', this.product_add_id, this.product_add_price);
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
            if (!this.device_id) return console.error('设备ID为空，无法查询');

            try {
                const res = await PG0ExternalServerApi.SpecificationInquiry(this.device_id, this.mac, this.product_id);
                console.log('规格查询:', res);
                const baseUrl = this.serviceUrl.replace(/\/$/, '');

                for (const item of res) {
                    const type = item.output_str_type!;
                    if (!type.startsWith('Instapic_FrameType')) continue;

                    const suffix = type.split('_').pop()!;
                    const frameKey = `Instapic_FrameType_${suffix}` as const;
                    const pasterKey = `Instapic_Paster_${suffix}` as const;

                    const resp = await fetch(item.output_str_value!);
                    if (!resp.ok) continue;
                    const cfg: { PhotoFrame: string[]; Paster: string[] } = await resp.json();

                    // 直接覆盖，避免重复
                    // @ts-ignore
                    this[frameKey] = cfg.PhotoFrame.map(path => `${baseUrl}${path}`);
                    // @ts-ignore
                    this[pasterKey] = cfg.Paster.map(path => `${baseUrl}${path}`);
                }

                console.log('规格和贴纸已更新');
            }
            catch (err) {
                console.error('规格查询出错', err);
            }
        }





    }

});
