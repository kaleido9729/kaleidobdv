<!-- src/components/EChart.vue -->
<template>
  <div ref="wrap" class="w-full h-full">
    <VChart
      ref="chart"
      :option="option"
      :autoresize="true"
      :update-options="{ notMerge: false, lazyUpdate: true }"
    />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watchEffect, toRaw } from 'vue'

type Opt = Record<string, any>
const props = defineProps<{ option: Opt }>()

// 用 shallowRef 避免深层响应式开销
const option = shallowRef<Opt>({})
watchEffect(() => { option.value = toRaw(props.option) })
</script>

<style scoped>
.w-full{ width:100%; }
.h-full{ height:100%; }
</style>
