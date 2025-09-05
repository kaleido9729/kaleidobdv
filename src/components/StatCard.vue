<!-- src/components/StatCard.vue -->
<template>
  <div class="card" :style="{height}">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:14px;color:var(--muted)">{{ title }}</div>
      <slot name="extra"/>
    </div>
    <div style="margin-top:8px;font-size:28px;font-weight:700;line-height:1;">
      {{ value }}
      <span style="font-size:12px;color:var(--muted);margin-left:8px">{{ unit }}</span>
    </div>
    <div style="margin-top:6px;font-size:12px;color:var(--muted)">{{ subTitle }}</div>
    <div style="height:50%;margin-top:8px">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  unit?: string
  subTitle?: string
  height?: string
}>()
</script>
