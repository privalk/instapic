<template>
  <div class="slider-wrapper">
    <v-slider
      :model-value="modelValue"
      :min="0"
      :max="max"
      :step="1"
      class="custom-slider"
      hide-details
      thumb-size="0"
      :color="color"
      :track-color="trackColor"
    >
      <template #prepend>
        <div 
          class="value-label" 
          :style="{ left: `${(modelValue / max) * 100}%` }"
        >
          {{ modelValue }}<span class="unit">s</span>
        </div>
      </template>
    </v-slider>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TimeSlider',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      default: '#737373'
    },
    trackColor: {
      type: String,
      default: '#FFF5D5'
    }
  }
})
</script>

<style scoped>
.slider-wrapper {
  position: relative;
  width: 527px;
  padding-bottom: 7px;
}

.custom-slider {
  height: 0px;
}

.value-label {
  position: absolute;
  transform: translateX(-30%);
  background: v-bind(color);
  color: white;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 24px;
  white-space: nowrap;
  z-index: 3;
}

.unit {
  font-weight: normal;
  margin-left: 2px;
}

/* 如果需要覆盖 Vuetify 默认样式 */
:deep(.v-slider .v-slider-track__fill) {
  height: 25px !important;
  border-radius: 16px;
  margin-left: 10px;
}

:deep(.v-slider .v-slider-track__background) {
  height: 40px !important;
  border-radius: 40px;
  border: #FFE17D 10px solid;
}
</style>