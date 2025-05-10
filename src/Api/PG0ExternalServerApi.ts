import axios, { type AxiosInstance, type AxiosResponse } from "axios";


interface baseResponse {
  code: number;
  msg: string;
  data: any;
}
interface DeviceCreationResponse {
  output_id_device: string;
}

interface ServiceInquiryResponse {
  output_id_service: string;
  output_str_service_url: string;
}

interface GoodInquiryResponse {
  output_id_product: string;
  output_int4_price: number;
}

interface JourneyCreationResponse {
  output_id_journey: string;
}
interface specificationResponse {

}
interface TrackingCreationResponse {
  output_id_tracking: string;
}
interface OrderCreationResponse {
  output_id_order: string;
  output_int4_total_price: number;
  output_str_currency: string;
}
interface OrderPollingResponse {
  output_bool_exist: string;

}
interface PaymentInquiryResponse {

}
interface PaymentPollingResponse {
  output_bool_finished: boolean;
}
interface CouponApplyToOrderResponse {
  output_id_order: string;
  output_int_price: number;
  output_str_currency: string;
}
interface PromptCreationResponse {
  output_id_prompt: string;
}
interface PromptUpdateResponse {
}

// 封装类
class PG0ExternalServerAPI {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 超时时间
      headers: {
        "Content-Type": "application/json",
      },
    });
  }


  /**
   * 提交mac、组织名、地点名、设备名称、设备描述进行设备注册
   * 
   */
  async DeviceCreation(
    mac: string,
    organization_name: string,
    location_name: string,
    device_name: string,
    device_description: string
  ): Promise<DeviceCreationResponse[]> {
    const response: AxiosResponse<DeviceCreationResponse[]> = await this.client.post(
      "/client_device_creation",
      {
        mac,
        organization_name,
        location_name,
        device_name,
        device_description,
      }
    );
    console.log(response.data);
    return response.data;
  }
  /**
   * 通过 device_id和mac 申请分配计算/存储服务提供商
   * @param device_id 设备ID
   * @param mac
   */
  async ServiceInquiry(
    device_id: string,
    mac: string
  ): Promise<ServiceInquiryResponse[]> {
    const response: AxiosResponse<ServiceInquiryResponse[]> = await this.client.post(
      "/client_service_inquiry",
      {
        device_id,
        mac,
      }
    );
    console.log(response.data);
    return response.data;
  }


  async GoodIquiry(
    device_id: string,
    mac: string,
  ): Promise<GoodInquiryResponse[]> {
    const response: AxiosResponse<GoodInquiryResponse[]> = await this.client.post(
      "/client_good_inquiry",
      {
        device_id,
        mac,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 通过 device_id、mac、product_id 获取该商品的具体属性，返回specification list
   */
  async SpecificationInquiry(
    device_id: string,
    mac: string,
    product_id: string
  ): Promise<specificationResponse[]> {
    const response: AxiosResponse<specificationResponse[]> = await this.client.post(
      "/client_specification_inquiry",
      {
        device_id,
        mac,
        product_id,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * journey注册（开始游戏）
   */
  async JourneyCreation(
    device_id: string,

  ): Promise<JourneyCreationResponse[]> {
    const response: AxiosResponse<JourneyCreationResponse[]> = await this.client.post(
      "/client_journey_creation",
      {
        device_id,
      }
    );
    console.log(response.data);
    return response.data;
  }


  /**
   * 提交埋点记录
   */
  async TrackingCreation(
    device_id: string,
    journey_id: string,
    event: string,
    param: string,

  ): Promise<TrackingCreationResponse[]> {
    const response: AxiosResponse<TrackingCreationResponse[]> = await this.client.post(
      "/client_tracking_creation",
      {
        device_id,
        journey_id,
        event,
        param,
      }
    );
    console.log(response.data);
    return response.data;
  }
  /**
   *  提交order（商品订单）
   */
  async OrderCreation(
    order_name: string,
    device_id: string,
    journey_id: string,
    json_items: {
      product_id: string;
      quantity: number;
    }[]
  ): Promise<OrderCreationResponse[]> {
    const response: AxiosResponse<OrderCreationResponse[]> = await this.client.post(
      "/client_order_creation",
      {
        order_name,
        device_id,
        journey_id,
        json_items,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 轮询用函数：通过order_id检查支付方式是否已经准备完成
   */
  async OrderPolling(
    order_id: string,
  ): Promise<OrderPollingResponse[]> {
    const response: AxiosResponse<OrderPollingResponse[]> = await this.client.post(
      "/client_order_polling",
      {
        order_id,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 通过order_id查询order的支付方式（payments）（返回内容为复数）
   */
  async PaymentInquiry(
    order_id: string,
  ): Promise<PaymentInquiryResponse[]> {
    const response: AxiosResponse<PaymentInquiryResponse[]> = await this.client.post(
      "/client_payment_inquiry",
      {
        order_id,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /** 
   * 轮询用函数：通过order_id检查是否已经支付
   */
  async PaymentPolling(
    order_id: string,
  ): Promise<PaymentPollingResponse[]> {
    const response: AxiosResponse<PaymentPollingResponse[]> = await this.client.post(
      "/client_payment_polling",
      {
        order_id,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 应用代金券到订单并创建折后订单
   */
  async CouponApplyToOrder(
    order_id: string,
    coupon_code: string,
  ): Promise<CouponApplyToOrderResponse[]> {
    const response: AxiosResponse<CouponApplyToOrderResponse[]> = await this.client.post(
      "/client_coupon_apply_to_order",
      {
        order_id,
        coupon_code,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 提交生成请求prompt
   */
  async PromptCreation(
    device_id: string,
    journey_id: string,
    service_id: string,
    param: string,
  ): Promise<PromptCreationResponse[]> {
    const response: AxiosResponse<PromptCreationResponse[]> = await this.client.post(
      "/client_prompt_creation",
      {
        device_id,
        journey_id,
        service_id,
        param,
      }
    );
    console.log(response.data);
    return response.data;
  }

  /**
   * 更新上传请求prompt里购买个数（返回内容为复数）
   * 
   */
  async PromptUpdate(
    device_id: string,
    journey_id: string,
    param_id_order: string,
    param_str_mac: string,
    param_json_items: {
      product_id: string;
      quantity: number;
    }[]
  ): Promise<PromptUpdateResponse[]> {
    const response: AxiosResponse<PromptUpdateResponse[]> = await this.client.post(
      "/client_prompt_update",
      {
        device_id,
        journey_id,
        param_id_order,
        param_str_mac,
        param_json_items
      }
    );
    console.log(response.data);
    return response.data;
  }

}

const api_server = import.meta.env.VITE_API_SERVER;
export default PG0ExternalServerAPI;
export const PG0ExternalServerApi = new PG0ExternalServerAPI(api_server);

