<template>
    <v-container fluid class="container">
        <button class="test-btn" @click="loadTestPhoto">加载测试照片</button>
        <div class="header">
            <TimeSlider v-model="sliderValue" :max="timeAll" style="position: absolute;" />
            <div class="btn_back">

            </div>
            <img src="\FilterSelect\title_FilterSelect.svg" />
            <div class="time">

                <!-- <div class="time2">
                    <div class="time3">
                        {{ formattedTime }}
                    </div>
                </div> -->
            </div>
        </div>

        <div class="body">
            <div class="left">
                <img :src="selectedFrameUrl" class="FramePreview" />
                <!-- <img :src="filterPhoto ?? ''" class="FilterPreview" /> -->
                <!-- 用 Canvas 预览滤镜效果 -->
                <canvas ref="previewCanvas" class="FilterPreview"></canvas>
                <img src="\FilterSelect\btn_Next.png" class="btn" @click="handleConfirm" />
            </div>
            <div class="right">
                <div class="right_">
                    <div v-for="filterKey in filterKeys" :key="filterKey" class="btn_filter"
                        @click="applyFilter(filterKey)" :class="{ 'active': selectedFilterKey === filterKey }">
                        <div :class="`btn_${filterKey}`"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="/GridSelect/img_Footer.svg" />

        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useJourneyStore } from '@/stores/journey';
import { nextTick } from 'process';
import { applyLUT } from '@/utils/applyLut';
import TimeSlider from '@/components/TimeSlider.vue';
import router from '@/router';

type FilterKey = 'filter_1' | 'filter_2' | 'filter_3' | 'filter_4' | 'filter_5' | 'filter_6';

type BlendMode = GlobalCompositeOperation;

// 新的 LUT + 遮罩 配置
// blendMode 可选值：
// ‘lighten’：保留色彩更亮的像素（增亮效果）
// ‘screen’：反相相乘再反相，整体变亮并保留高光（高光增亮）
// ‘overlay’：根据基底亮度使用 screen 或 multiply，提高对比度（增强对比）
// ‘multiply’：按素值相乘，整体变暗（阴影加深）
const lutConfigs: Record<FilterKey, { path: string; size: number; cols: number; mask?: string; blendMode?: BlendMode }> = {
  filter_1: { path: '/luts/filter1.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_1_mask.png' },
  filter_2: { path: '/luts/filter2.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_2_mask.png', blendMode: 'lighten' },
  filter_3: { path: '/luts/filter3.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_3_mask.png', blendMode: 'screen' },
  filter_4: { path: '/luts/filter4.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_4_mask.png' },
  filter_5: { path: '/luts/filter5.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_5_mask.png' },
  filter_6: { path: '/luts/filter6.png', size: 64, cols: 8, mask: '/FilterSelect/Filter_6_mask.png' },
};

export default defineComponent({
  components: { TimeSlider },
  setup() {
    const configStore = useConfigStore();
    const JourneyStore = useJourneyStore();

    // 定时器
    const timeLeft = ref(configStore.WaitTime_GridSelect);
    const timeAll = ref(configStore.WaitTime_GridSelect);

    // 滤镜列表 & 当前选中
    const filterKeys = Object.keys(lutConfigs) as FilterKey[];
    const selectedFilterKey = ref<FilterKey | null>(null);

    // 绑定视图
    const selectedFrameUrl = computed(() => JourneyStore.selectedFrameUrl);
    const sliderValue = computed(() => timeLeft.value);
    // const filterPhoto = computed(() => JourneyStore.filterPhoto);
    const previewCanvas = ref<HTMLCanvasElement | null>(null);

    // 时间格式化
    const formattedTime = computed(() => {
      const mins = Math.floor(timeLeft.value / 60);
      const secs = timeLeft.value % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    });    

    // 加载图片工具
    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = e => reject(e);
      });
      
    // 缓存 LUT Canvas
    const lutCache = new Map<FilterKey, HTMLCanvasElement>();

    // 预加载所有 LUT
    onMounted(async () => {
      for (const key of filterKeys) {
        const cfg = lutConfigs[key];
        try {
          const img = await loadImage(cfg.path);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          canvas.dataset.lutSize = cfg.size.toString();
          canvas.dataset.lutCols = cfg.cols.toString();
          lutCache.set(key, canvas);
        } catch (e) {
          console.error('LUT 预加载失败', key, e);
        }
      }

      // 启动倒计时
      nextTick(() => console.log(JourneyStore.capturedPhoto));
      timer = setInterval(() => {
        if (timeLeft.value > 0) timeLeft.value--; else { handleConfirm(); clearInterval(timer); }
      }, 1000);
    });

    onUnmounted(() => clearInterval(timer));

    let timer: ReturnType<typeof setInterval>;

    // 应用 LUT 滤镜 + 遮罩混合， 直接在 previewCanvas 上绘制
    const applyFilter = async (filterKey: FilterKey) => {

        const start = performance.now();
        console.log('start applyFilter', start);

        // 检查滤镜配置与原图存在与否
        if (selectedFilterKey.value === filterKey) {
            selectedFilterKey.value = null; JourneyStore.filterPhoto = JourneyStore.capturedPhoto || ''; return;
        }
        selectedFilterKey.value = filterKey;
        const cfg = lutConfigs[filterKey];
        const lutCanvas = lutCache.get(filterKey);
        if (!lutCanvas || !JourneyStore.capturedPhoto) return;

        console.log('cache and config ready', performance.now() - start, 'ms');

        try {
            // 加载原图
            const srcImg = await loadImage(JourneyStore.capturedPhoto);
            console.log('loaded srcImg', performance.now() - start, 'ms');
            // 执行颜色查找
            const outputCanvas = document.createElement('canvas');
            applyLUT(srcImg, lutCanvas, outputCanvas);
            console.log('applied LUT', performance.now() - start, 'ms');

            // 如果有遮罩配置，叠加混合
            if (cfg.mask && cfg.blendMode) {
                const outCtx = outputCanvas.getContext('2d')!;
                const maskImg = await loadImage(cfg.mask);
                outCtx.globalCompositeOperation = cfg.blendMode;
                outCtx.drawImage(maskImg, 0, 0, outputCanvas.width, outputCanvas.height);
                outCtx.globalCompositeOperation = 'source-over';
                console.log('applied mask blend', performance.now() - start, 'ms');
            }

            // 渲染到页面 canvas
            const pc = previewCanvas.value!;  // non-null assertion since we've checked above
            pc.width = outputCanvas.width;
            pc.height = outputCanvas.height;
            const pct = pc.getContext('2d')!;
            pct.clearRect(0, 0, pc.width, pc.height);
            pct.drawImage(outputCanvas, 0, 0);
            console.log('rendered to previewCanvas', performance.now() - start, 'ms');
                        
            // 保存结果到 JourneyStore.filterPhoto
            previewCanvas.value?.toBlob(blob => {
                if (blob) {
                JourneyStore.filterPhoto = URL.createObjectURL(blob);
                console.log('saved to store', performance.now() - start, 'ms');
                }
            }, 'image/png');
            console.log('updated store', performance.now() - start, 'ms');

        } catch (err) {
            console.error('LUT 应用失败：', err);
            JourneyStore.filterPhoto = JourneyStore.capturedPhoto || '';
        }
    };

    // 加载测试图
    const loadTestPhoto = () => {
      const url = '/FilterSelect/WIN_20250418_10_47_06_Pro.jpg';
      JourneyStore.capturedPhoto = url;
      // JourneyStore.filterPhoto = url;
      selectedFilterKey.value = null;
      // 初始化 canvas 上直接显示原图
      if (previewCanvas.value) {
        loadImage(url).then(img => {
          previewCanvas.value!.width = img.width;
          previewCanvas.value!.height = img.height;
          previewCanvas.value!.getContext('2d')!.drawImage(img, 0, 0);
        });
      }
    };

    // 合成相框图并跳转
    const drawPhotoFrame = async () => {
      try {
        const [frameImg, filteredImg] = await Promise.all([
          loadImage(JourneyStore.selectedFrameUrl!),
          loadImage(JourneyStore.filterPhoto!),
        ]);
        const canvas = document.createElement('canvas');
        canvas.width = frameImg.width;
        canvas.height = frameImg.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(
          filteredImg,
          0, 0, filteredImg.width, filteredImg.height,
          0, 0, canvas.width, canvas.height
        );
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(frameImg, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            const blobURL = URL.createObjectURL(blob);
            JourneyStore.setPasterPhoto(blobURL);
            JourneyStore.setPasterPhotoBlob(blob);
          }
        }, 'image/png', 1);
      } catch (err) {
        console.error('照片合成失败：', err);
        JourneyStore.setPasterPhoto(JourneyStore.filterPhoto!);
      }
    };

    const handleConfirm = () => {
      drawPhotoFrame();
      router.push({ name: 'Paster' });
    };

    return {
      selectedFrameUrl,
    //   filterPhoto,
      previewCanvas,
      sliderValue,
      timeAll,
      formattedTime,
      filterKeys,
      selectedFilterKey,
      applyFilter,
      loadTestPhoto,
      handleConfirm,
    };
  },
});
</script>

<style scoped>
.test-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #8945FF;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    z-index: 999;
}

.test-btn:hover {
    background: #6a30cc;
}

.test-btn:active {
    transform: scale(0.95);
}

.FilterPreview {
    /* 自动布局子元素 */
    width: 480px;
    height: 715px;


    z-index: 0;
}

.FramePreview {
    position: absolute;

    top: 147.5px;

    width: 480px;
    height: 715px;
    z-index: 1;
}

.left {
    /* 自动布局子元素 */
    width: 850px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 36px;
    flex-grow: 1;
    align-self: stretch;
    z-index: 0;

}

.right {
    /* 自动布局子元素 */
    width: 900px;
    height: 779px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    gap: 64px;
    align-self: stretch;
    z-index: 1;
}

.right_ {
    /* 自动布局子元素 */
    width: 852px;
    height: 464px;
    /* 自动布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    gap: 64px 64px;
    flex-wrap: wrap;
    align-content: center;
    align-self: stretch;
    z-index: 0;
}

.btn_filter {
    /* 自动布局子元素 */
    width: 199px;
    height: 265px;
    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    z-index: 4;
    border-radius: 16px;
    box-sizing: border-box;
    /* border: 10px solid; */
    border-image: linear-gradient(180deg, rgba(135, 135, 135, 0.46) 0%, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 100%) 10;
    box-shadow: inset 0px 1px 10px 0px rgba(255, 255, 255, 0.3), inset 1px 0px 5px 0px rgba(0, 0, 0, 0.3), inset 0px 0px 5px 0px rgba(234, 234, 234, 0.3), inset 0px 1px 5px 0px rgba(0, 0, 0, 0.3);
}

.btn_filter_1 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_1.png') no-repeat center center / cover;

}

.btn_filter_2 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_2.png') no-repeat center center / cover;
}

.btn_filter_3 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_3.png') no-repeat center center / cover;

}

.btn_filter_4 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_4.png') no-repeat center center / cover;

}

.btn_filter_5{
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_5.png') no-repeat center center / cover;
}

.btn_filter_6 {
    /* 自动布局子元素 */
    width: 179px;
    height: 245px;

    background: url('/FilterSelect/btn_filter_6.png') no-repeat center center / cover;
}

.btn_filter:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.btn_filter.active {
    border-image: linear-gradient(180deg, #8945FF 0%, #8945FF 100%) 10;
    box-shadow: 0 0 10px #8945FF;
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
    /* background: rgba(190, 190, 190, 0.3); */
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

.btn:active {
    transform: scale(0.95);
    opacity: 0.8;
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