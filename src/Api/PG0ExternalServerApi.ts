import { createClient } from '@supabase/supabase-js';
// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPA_ANON_KEY;
const email = import.meta.env.VITE_EMAIL;
const password = import.meta.env.VITE_PASSWORD;
// 初始化客户端
const supabase = createClient(supabaseUrl, supabaseKey);
async function login() {
  // 调试输出环境变量
  console.log('Env Variables:', { supabaseUrl, supabaseKey, email, password });

  // 尝试登录
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('登录失败:', error.message);
    return;
  }

  console.log('登录成功:', data);
}


// 执行登录
login();

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
  output_str_type: string;
  output_str_value: string;
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





  /**
   * 提交mac、组织名、地点名、设备名称、设备描述进行设备注册
   * 
   */
  async DeviceCreation(
    param_str_description: string,
    param_str_location: string,
    param_str_mac: string,
    param_str_display_name: string,
    param_str_organization: string
  ): Promise<DeviceCreationResponse[]> {
    // 使用正确的 RPC 调用方式
    const { data, error } = await supabase.rpc('client_device_creation', {
      param_str_description,
      param_str_location,
      param_str_mac,
      param_str_display_name,
      param_str_organization
    });
    console.log(param_str_description, param_str_location, param_str_mac, param_str_display_name, param_str_organization);
    // 错误处理
    if (error) {
      throw new Error(`RPC call failed: ${error.message}`);
    }

    console.log('Created devices:', data);
    return data as DeviceCreationResponse[];
  }
  /**
   * 通过 device_id和mac 申请分配计算/存储服务提供商
   */
  async ServiceInquiry(
    param_id_device: string,
    param_str_mac: string
  ): Promise<ServiceInquiryResponse[]> {
    const { data, error } = await supabase.rpc('client_service_inquiry', {
      param_id_device,
      param_str_mac,
    });

    if (error) throw new Error(`Service inquiry failed: ${error.message}`);
    return data as ServiceInquiryResponse[];
  }

  async GoodInquiry(
    param_id_device: string,
    param_str_mac: string,
  ): Promise<GoodInquiryResponse[]> {
    const { data, error } = await supabase.rpc('client_good_inquiry', {
      param_id_device,
      param_str_mac,
    });

    if (error) throw new Error(`Good inquiry failed: ${error.message}`);
    return data as GoodInquiryResponse[];
  }

  /**
   * 获取商品具体属性
   */
  async SpecificationInquiry(
    param_id_device: string,
    param_str_mac: string,
    param_id_product: string
  ): Promise<specificationResponse[]> {
    const { data, error } = await supabase.rpc('client_specification_inquiry', {
      param_id_device,
      param_str_mac,
      param_id_product,
    });

    if (error) throw new Error(`Spec inquiry failed: ${error.message}`);
    return data as specificationResponse[];
  }

  /**
   * journey注册（开始游戏）
   */
  async JourneyCreation(
    param_id_device: string,
  ): Promise<JourneyCreationResponse[]> {
    const { data, error } = await supabase.rpc('client_journey_creation', {
      param_id_device,
    });

    if (error) throw new Error(`Journey creation failed: ${error.message}`);
    return data as JourneyCreationResponse[];
  }

  /**
   * 提交埋点记录
   */
  async TrackingCreation(
    param_id_device: string,
    param_id_journey: string,
    param_str_parameters: string,
    param_str_event: string,
  ): Promise<TrackingCreationResponse[]> {
    const { data, error } = await supabase.rpc('client_tracking_creation', {
      param_id_device,
      param_id_journey,
      param_str_parameters,
      param_str_event,
    });

    if (error) throw new Error(`Tracking creation failed: ${error.message}`);
    return data as TrackingCreationResponse[];
  }

  /**
   * 提交商品订单
   */
  async OrderCreation(
    param_str_order_name: string,
    param_id_device: string,
    param_id_journey: string,
    param_json_items: {
      product_id: string;
      quantity: number;
    }[]
  ): Promise<OrderCreationResponse[]> {
    const { data, error } = await supabase.rpc('client_order_creation', {
      param_str_order_name,
      param_id_device,
      param_id_journey,
      param_json_items,
    });

    if (error) throw new Error(`Order creation failed: ${error.message}`);
    return data as OrderCreationResponse[];
  }

  /**
   * 轮询订单支付方式准备状态
   */
  async OrderPolling(
    param_id_order: string,
  ): Promise<OrderPollingResponse[]> {
    const { data, error } = await supabase.rpc('client_order_polling', {
      param_id_order,
    });

    if (error) throw new Error(`Order polling failed: ${error.message}`);
    return data as OrderPollingResponse[];
  }

  /**
   * 查询订单支付方式
   */
  async PaymentInquiry(
    param_id_order: string,
  ): Promise<PaymentInquiryResponse[]> {
    const { data, error } = await supabase.rpc('client_payment_inquiry', {
      param_id_order,
    });

    if (error) throw new Error(`Payment inquiry failed: ${error.message}`);
    return data as PaymentInquiryResponse[];
  }

  /** 
   * 轮询支付完成状态
   */
  async PaymentPolling(
    param_id_order: string,
  ): Promise<PaymentPollingResponse[]> {
    const { data, error } = await supabase.rpc('client_payment_polling', {
      param_id_order,
    });

    if (error) throw new Error(`Payment polling failed: ${error.message}`);
    return data as PaymentPollingResponse[];
  }

  /**
   * 应用代金券
   */
  async CouponApplyToOrder(
    param_id_order: string,
    param_id_device: string,
    param_str_use_code: string,
  ): Promise<CouponApplyToOrderResponse[]> {
    const { data, error } = await supabase.rpc('client_coupon_apply_to_order', {
      param_id_order,
      param_id_device,
      param_str_use_code,
    });

    if (error) throw new Error(`Coupon apply failed: ${error.message}`);
    return data as CouponApplyToOrderResponse[];
  }

  /**
   * 提交生成请求prompt
   */
  async PromptCreation(
    param_id_service: string,
    param_id_device: string,
    param_id_journey: string,
    param_str_parameters: string,
  ): Promise<PromptCreationResponse[]> {
    const { data, error } = await supabase.rpc('client_prompt_creation', {
      param_id_service,
      param_id_device,
      param_id_journey,
      param_str_parameters,
    });

    if (error) throw new Error(`Prompt creation failed: ${error.message}`);
    return data as PromptCreationResponse[];
  }

  /**
   * 更新prompt购买个数
   */
  async PromptUpdate(
    param_id_order: string,
    param_id_device: string,
    param_id_journey: string,
    param_str_mac: string,
    param_json_items: {
      product_id: string;
      quantity: number;
    }[]
  ): Promise<PromptUpdateResponse[]> {
    const { data, error } = await supabase.rpc('client_prompt_update', {
      param_id_order,
      param_id_device,
      param_id_journey,
      param_str_mac,
      param_json_items
    });

    if (error) throw new Error(`Prompt update failed: ${error.message}`);
    return data as PromptUpdateResponse[];
  }
}



export const PG0ExternalServerApi = new PG0ExternalServerAPI();
// 登录用户


