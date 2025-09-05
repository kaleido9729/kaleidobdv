<!-- WorkshopBox.vue -->
<template>
  <div class="workshop-box-content">
    <div class="box-header">
      <div class="box-title">{{ box.name }}</div>
      <img :src="machineIcon" alt="机床" class="machine-icon" />
      <span class="total-value">{{ box.total }}</span>
    </div>
    <div class="status-icons">
      <div class="icon-item" v-for="status in box.status" :key="status.name">
        <img :src="status.icon" :alt="status.name" class="status-icon" />
        <span class="status-value" :class="status.name">{{ status.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import machineIcon from '@/assets/总机床.svg'

defineProps<{
  box: {
    name: string
    total: number
    status: Array<{
      name: string
      icon: string
      value: number
    }>
  }
}>()
</script>

<style lang="scss" scoped>
.workshop-box-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.box-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-shrink: 0;
}

.machine-icon {
  width: 40px;
  height: 40px;
}

.total-value {
  font-size: 32px;
  font-weight: bold;
  color: #00ff2a;
}

.box-title {
  font-size: 48px;
  font-weight: 900;
  font-family: 'Arial Black', sans-serif;
  color: #e0f2fe;
  text-align: center;
}

.status-icons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 60px;
}

.status-icon {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
}

.status-value {
  font-size: 20px;
  font-weight: bold;
  
  &.运行 { color: #00ff2a; }
  &.告警 { color: #ff2d55; }
  &.待机 { color: #3498db; }
  &.离线 { color: #95a5a6; }
}
</style>