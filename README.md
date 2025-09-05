运行： #2ecc71 

告警： #e74c3c 

待机： #3498db 

离线： #95a5a6 

总机床： #00ff2a

### 时间选择器使用方法：
```vue
<template>
  <DateRangePicker
    v-model="dateRange"
    @change="onDateRangeChange"
  />
</template>

<script setup>
import DateRangePicker from '@/components/DateRangePicker.vue'

const dateRange = ref([])
const onDateRangeChange = (value) => {
  // 处理日期变化
}
</script>
```



'总工件数'              zgjs  
'平均设备使用率'        pjsbsyl
'设备时间开动率'        sbsjkdl
'程序加工时间占比'      cxjgsjzb
'平均无故障时间'        pjwgzsj
'故障平均修复时间',     gzpjxfsj
'设备性能开动率',       sbxnkdl
'自动加工时间占比'      zdjgsjzb



['停机开始时间', '停机结束时间', '停机类别', '停机原因']
startDate endDate   shutdownType  shutdownDescription
其中停机类型0为故障停机1为计划停机

   
'工件数'               zgjs
'程序使用率'            pjsbsyl
'设备时间开动率'        sbsjkdl
'程序加工时间占比'      cxjgsjzb
'无故障时间'            pjwgzsj
'故障修复时间'          gzpjxfsj
'设备性能开动率'        sbxnkdl
'自动加工时间'          zdjgsjzb  
