<template>
  <div class="dashboard-container">
    <!-- 粒子背景 -->
    <vue-particles class="particles-bg" color="#fff" :particleOpacity="0.7" :particlesNumber="80" shapeType="circle"
      :particleSize="4" linesColor="#fff" :linesWidth="1" :lineLinked="true" :lineOpacity="0.4" :linesDistance="150"
      :moveSpeed="2" :hoverEffect="true" hoverMode="grab" :clickEffect="true" clickMode="push" />

    <!-- 页面头部 -->
    <header class="header">
      <div class="time-selector">
        <DateRangePicker
          v-model="dateRange"
          @change="onDateRangeChange"
        />
      </div>
      <h1 class="header-title" @click="goBack">{{ headerTitle }}</h1>
      <div class="time-display">
        <span class="time-value">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 上部分：时间线图表 -->
      <section class="top-section">
        <EChart :option="timelineOption" ref="timelineRef" />
      </section>

      <!-- 中部分：左右两部分 -->
      <section class="middle-section">
        <!-- 左侧：分为上下两段 -->
        <section class="left-section">
          <!-- 上段：主轴转速相关 -->
          <div class="spindle-section">
            <!-- 左部分：主轴转速指标 -->
            <div class="spindle-metrics">
              <div class="spindle-metric-box">
          <div class="metric-content">
            <div class="value-line">
                    <span class="number-flop">{{ spindleMaxSpeed }}</span>
                    <span class="unit">rpm</span>
            </div>
                  <div class="label-line">主轴最大转速</div>
          </div>
            </div>
              <div class="spindle-metric-box">
                <div class="metric-content">
                  <div class="value-line">
                    <span class="number-flop">{{ spindleAvgSpeed }}</span>
                    <span class="unit">rpm</span>
          </div>
                  <div class="label-line">主轴平均转速</div>
            </div>
          </div>
            </div>
            <!-- 右部分：主轴转速折线图 -->
            <div class="spindle-chart">
              <dv-border-box-11 title="主轴转速" class="chart-card">
                <EChart :option="spindleSpeedOption" ref="spindleSpeedRef" />
              </dv-border-box-11>
          </div>
        </div>

          <!-- 下段：四个性能指标box -->
          <div class="performance-section">
            <dv-border-box-7 class="performance-box" v-for="metric in performanceMetrics" :key="metric.id">
              <div class="metric-content">
                <div class="value-line">
                  <span class="number-flop">{{ metric.value }}</span>
                  <span v-if="metric.unit" class="unit">{{ metric.unit }}</span>
                </div>
                <div class="label-line">{{ metric.label }}</div>
              </div>
            </dv-border-box-7>
          </div>
        </section>

        <!-- 右侧：停机时间和累积起停次数 -->
        <aside class="right-section">
          <!-- 停机时间表格 -->
          <div class="shutdown-table">
            <dv-border-box-11 title="停机时间" class="table-card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th v-for="header in alarmHeaders" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in alarmRows" :key="index">
                    <td>{{ row.startTime }}</td>
                    <td>{{ row.endTime }}</td>
                    <td>{{ row.category }}</td>
                    <td>{{ row.reason }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </dv-border-box-11>
        </div>
          
          <!-- 累积起停次数 -->
          <div class="start-stop-count">
            <dv-border-box-7 class="count-box">
          <div class="metric-content">
            <div class="value-line">
                  <span class="number-flop">{{ startStopCount }}</span>
                  <span class="unit">次</span>
            </div>
                <div class="label-line">累积起停次数</div>
          </div>
        </dv-border-box-7>
          </div>
      </aside>
      </section>

      <!-- 下部分：三个box -->
      <section class="bottom-section">
        <!-- 无故障时间 -->
        <div class="bottom-box fault-free-time">
          <div class="box-content">
            <div class="value-line">
              <span class="number-flop">{{ detailData?.pjwgzsj ?? '-' }}</span>
              <span class="unit">h</span>
            </div>
            <div class="label-line">无故障时间</div>
          </div>
        </div>

        <!-- 故障修复时间 -->
        <div class="bottom-box fault-repair-time">
          <div class="box-content">
            <div class="value-line">
              <span class="number-flop">{{ detailData?.gzpjxfsj ?? '-' }}</span>
              <span class="unit">h</span>
            </div>
            <div class="label-line">故障修复时间</div>
          </div>
        </div>

        <!-- 报警信息 -->
        <div class="bottom-box alarm-info">
          <div class="box-content">
            <div class="value-line">
              <span class="number-flop">{{ currentAlarm.message || '无报警' }}</span>
            </div>
            <div class="label-line">当前报警信息</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EChart from '@/components/EChart.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import { machineRealTimeValue, machineDetailValue } from '@/api/machineApi'

const route = useRoute()
const router = useRouter()

// 返回上一页
function goBack() {
  router.go(-1)
}

// 时间范围选择相关
const dateRange = ref<string[]>([]);

// 当前设备ID，支持刷新后的路由恢复
const machineId = ref<string>('')
const headerTitle = computed(() => {
  const label = realTimeData.value?.label
  const type = realTimeData.value?.type
  if (label && type) return `${label}/${type}`
  return (route.params.machineId as string) || machineId.value || ''
})

// 从路由或会话存储中恢复 machineId
const restoreMachineId = () => {
  const fromRoute = route.params.machineId as string | undefined
  if (fromRoute && fromRoute.length > 0) {
    machineId.value = fromRoute
    sessionStorage.setItem('machineId', fromRoute)
  } else {
    const fromSession = sessionStorage.getItem('machineId')
    if (fromSession) {
      machineId.value = fromSession
    }
  }
}

const fetchRealTime = async () => {
  if (!machineId.value) return
  try {
    const resp = await machineRealTimeValue(machineId.value)
    realTimeData.value = resp.data?.data || null
    console.log('9897realTimeData.value', realTimeData.value);
  } catch (error) {
    console.error('获取设备实时数据失败:', error)
  }
}

// 拉取设备区间详情数据
const detailData = ref<any | null>(null)
const fetchDetailByRange = async (start: string, end: string) => {
  if (!machineId.value) return
  try {
    const startDate = new Date(start).getTime()
    const endDate = new Date(end).getTime()
    const { data } = await machineDetailValue(machineId.value, startDate, endDate)
    detailData.value = data?.data || null
  } catch (error) {
    console.error('获取设备区间详情失败:', error)
  }
}

// 日期范围变化处理：变化时请求一次 machineDetailValue
const onDateRangeChange = (value: [string, string] | null) => {
  if (value) {
    console.log('选择的日期范围:', value[0], '至', value[1])
    fetchDetailByRange(value[0], value[1])
  }
}

// 实时时间显示
const currentTime = ref('')
let timeInterval: NodeJS.Timeout | null = null
let realtimeInterval: NodeJS.Timeout | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  restoreMachineId()
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  // 首次进入与每30秒轮询一次实时数据
  fetchRealTime()
  realtimeInterval = setInterval(fetchRealTime, 30000)
  // 如果没有选择时间范围，默认最近一周并请求一次详情数据
  if (!dateRange.value || dateRange.value.length !== 2) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 7)
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    dateRange.value = [startStr, endStr]
    fetchDetailByRange(startStr, endStr)
  } else {
    // 如果已存在时间范围，也在刷新时请求一次详情数据
    fetchDetailByRange(dateRange.value[0], dateRange.value[1])
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (realtimeInterval) {
    clearInterval(realtimeInterval)
  }
})

// 停机明细表格数据
const alarmRows = computed(() => {
  const rows: Array<{ startTime: string; endTime: string; category: string; reason: string }> = []
  const records = detailData.value?.tjsj || []
  for (const r of records) {
    const start = new Date(r.startDate)
    const end = new Date(r.endDate)
    const category = r.shutdownType === 0 ? '故障停机' : r.shutdownType === 1 ? '计划停机' : '其他'
    rows.push({
      startTime: start.toLocaleString('zh-CN', { hour12: false }),
      endTime: end.toLocaleString('zh-CN', { hour12: false }),
      category,
      reason: r.shutdownDescription || ''
    })
  }
  return rows
})

// 监听路由变化以更新 machineId
watch(
  () => route.params.machineId,
  (val) => {
    if (typeof val === 'string' && val.length > 0) {
      machineId.value = val
      sessionStorage.setItem('machineId', val)
      // 路由变化时立即刷新一次实时数据
      fetchRealTime()
      // 如果已选择日期范围，也刷新详情
      if (dateRange.value && dateRange.value.length === 2) {
        fetchDetailByRange(dateRange.value[0], dateRange.value[1])
      }
    }
  },
  { immediate: false }
)

// 性能指标：设备时间开动率、设备性能开动率、程序使用率、自动加工时间
const performanceMetrics = computed(() => {
  if (!detailData.value) {
    return [
      { id: 1, value: '-', label: '设备时间开动率', unit: '%' },
      { id: 2, value: '-', label: '设备性能开动率', unit: '%' },
      { id: 3, value: '-', label: '程序使用率', unit: '%' },
      { id: 4, value: '-', label: '自动加工时间', unit: '%' }
    ]
  }
  const d = detailData.value
  const formatPercent = (v: number) => {
    if (v === null || v === undefined) return '-'
    return `${(v * 100).toFixed(2)}`
  }
  const percentUnit = '%'
  return [
    { id: 1, value: formatPercent(d.sbsjkdl), label: '设备时间开动率', unit: percentUnit },
    { id: 2, value: formatPercent(d.sbxnkdl), label: '设备性能开动率', unit: percentUnit },
    { id: 3, value: formatPercent(d.pjsbsyl), label: '程序使用率', unit: percentUnit },
    { id: 4, value: formatPercent(d.zdjgsjzb), label: '自动加工时间', unit: percentUnit }
  ]
})

// 主轴转速相关数据（预留接口）
const spindleMaxSpeed = ref<number>(0)
const spindleAvgSpeed = ref<number>(0)

// 累积起停次数（对接数据）
const startStopCount = computed(() => {
  return detailData.value?.zgjs ?? 0
})

// 主轴转速折线图配置（预留接口）
const spindleSpeedOption = computed(() => {
    return {
    textStyle: { color: '#ddd' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>转速: ${params[0].value} rpm`
      }
    },
    grid: { 
      top: 40, 
      left: 40, 
      right: 40, 
      bottom: 40, 
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLabel: { color: '#b8d7ff' },
      axisLine: { lineStyle: { color: 'rgba(0,170,255,0.4)' } },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: 'rgba(0,170,255,0.15)' } }
    },
    yAxis: {
      type: 'value',
      name: '转速(rpm)',
      nameTextStyle: { color: '#8bbdff' },
      axisLabel: { color: '#b8d7ff', formatter: '{value} rpm' },
      axisLine: { lineStyle: { color: 'rgba(0,170,255,0.4)' } },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: 'rgba(0,170,255,0.15)' } }
    },
    series: [{
      name: '主轴转速',
      type: 'line',
      data: [0, 1200, 2400, 1800, 3000, 0], // 示例数据
      smooth: true,
      lineStyle: {
        color: '#00aaff',
        width: 2
      },
      itemStyle: {
        color: '#00aaff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 170, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 170, 255, 0.05)' }
          ]
        }
      }
    }],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }
})

// 当前报警信息
const currentAlarm = computed(() => {
  const alarms = detailData.value?.alarm || []
  if (alarms.length > 0) {
    // 返回最新的报警信息
    const latestAlarm = alarms[alarms.length - 1]
    return {
      message: latestAlarm.message || '未知报警',
      time: latestAlarm.time || Date.now()
    }
  }
  return {
    message: '无报警',
    time: null
  }
})

// 数据
const alarmHeaders = ['停机开始时间', '停机结束时间', '停机类别', '停机原因']

// 格式化时间数据为小时
const formatTimeToHours = (milliseconds: number) => {
  return (milliseconds / (1000 * 60 * 60)).toFixed(1)
}


const devices = ['设备状态'];
const statusData = [
  { run: 1.4, idle: 5.6, fault: 3.2 }  
];

// 计算剩余时间
const remaining = statusData.map(item => 24 - (item.run + item.idle + item.fault));

// 拉取设备实时数据
const realTimeData = ref<any | null>(null)

const statusColor = {
  0: '#91cc75',
  1: '#fac858',
  2: '#ee6666',
  3: '#727483'
}

const statusName = {
  0: '运行',
  1: '告警',
  2: '停机',
  3: '离线'
}

const timelineRef = ref<any>(null)

const timelineOption = computed(() => {
  return {
  textStyle: { color: '#ddd' },
  legend: {
    top: 0,
    // icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 8,
    textStyle: { 
      fontSize: 15,
      color: '#cfe8ff' 
    }
  },
  tooltip: {
    // show: false,
    trigger: 'item',
    formatter: (params: any) => {
      const hours = Number(params.value);
      const totalMinutes = Math.round(hours * 60);
      const displayHours = Math.floor(totalMinutes / 60);
      const displayMinutes = totalMinutes % 60;
      
      const dataIndex = params.dataIndex;
      const seriesData = realTimeData.value?.cncStatusRecords;
      if (seriesData && seriesData[dataIndex]) {
        const record = seriesData[dataIndex];
        const startTime = new Date(record.startDate).toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const endTime = new Date(record.endDate).toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        return `${params.seriesName}<br/>${displayHours}小时${displayMinutes}分钟<br/>开始时间: ${startTime}<br/>结束时间: ${endTime}`;
      }
      
      return `${params.seriesName}<br/>${displayHours}小时${displayMinutes}分钟`;
    }
  },
  grid: { 
    top: 40, 
    left: 40, 
    right: 40, 
    bottom: 20, 
    containLabel: true 
  },
  xAxis: {
    type: 'value',
    name: '小时',
    nameTextStyle: { color: '#8bbdff' },
    min: 0,
    max: 24,
    splitNumber: 12,
    axisLabel: { color: '#b8d7ff', formatter: '{value}h' },
    axisLine: { lineStyle: { color: 'rgba(0,170,255,0.4)' } },
    axisTick: { show: false },
    splitLine: { show: true, lineStyle: { color: 'rgba(0,170,255,0.15)' } }
  },
  yAxis: {
    type: 'category',
    data: devices,
    axisLabel: { color: '#e6f4ff', rotate: 0, fontSize: 14 },
    axisLine: { show: false },
    axisTick: { show: false }
  },
  series: realTimeData.value && realTimeData.value.cncStatusRecords ? realTimeData.value.cncStatusRecords.sort((a: any, b: any) => a.startDate - b.startDate).map((item: any) => ({
    name: statusName[item.status as keyof typeof statusName],
    type: 'bar',
    stack: 'total',
    barWidth: 24,
    data: [
      (item.endDate - item.startDate)/(60 * 60 * 1000),
    ],
    emphasis: {
      focus: 'series',
    },

    itemStyle: { color: statusColor[item.status as keyof typeof statusColor]},
  })) : [],
  animationDuration: 600,
  animationEasing: 'cubicOut'
}
});
</script>

<style lang="scss" scoped>
/* ===== 变量定义 ===== */
$primary-color: #00aaff;
$accent-color: #00ffff;
$bg-color: #00041a;
$card-bg: rgba(0, 170, 255, 0.05);
$text-color: #fff;
$text-secondary: #ddd;
$table-border: rgba(0, 170, 255, 0.2);
$table-header-bg: rgba(0, 170, 255, 0.1);
$table-hover-bg: rgba(0, 170, 255, 0.1);
$scrollbar-color: rgba(0, 170, 255, 0.3);

/* ===== 全局样式 ===== */
.dashboard-container {
  width: 100vw;
  height: 100vh;
  color: $text-color;
  background: linear-gradient(180deg, #00041a 0%, #000c25 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 粒子背景 ===== */
.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* ===== 头部样式 ===== */
.header {
  position: relative;
  z-index: 2;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .time-selector {
    position: absolute;
    top: 10px;
    left: 15px;
    z-index: 3;
  
  }

  .header-title {
    font-size: 3rem;
    color: $text-color;
    text-shadow: 0 0 10px $accent-color, 0 0 20px $accent-color, 0 0 40px $accent-color;
    animation: flicker 2s infinite alternate;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      text-shadow: 0 0 15px $accent-color, 0 0 30px $accent-color, 0 0 50px $accent-color;
      // color: $accent-color;
    }
  }

  .time-display {
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 1.2rem;
    color: $accent-color;
    font-weight: bold;
    text-shadow: 0 0 5px $accent-color;
  }
}



/* ===== 主内容区布局 ===== */
.main-content {
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 80px);
}

/* ===== 上部分：时间线图表 ===== */
.top-section {
  flex: 1;
  min-height: 0;
  background: $card-bg;
  border-radius: 10px;
  border: 1px solid $primary-color;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2);
  padding: 20px;
}

/* ===== 中部分：左右两部分 ===== */
.middle-section {
  flex: 4;
  display: grid;
  grid-template-columns: 5fr 1fr;
  gap: 20px;
  min-height: 0;
}

/* ===== 下部分：三个box ===== */
.bottom-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  gap: 20px;
  min-height: 0;
}

/* ===== 左侧区域 ===== */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

/* ===== 主轴转速区域 ===== */
.spindle-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 5fr;
  gap: 20px;
  min-height: 0;
}

.spindle-chart {
  min-height: 0;
}

.chart-card {
  height: 100%;
  min-height: 200px;
}

.spindle-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.spindle-metric-box {
  background: $card-bg;
  border-radius: 10px;
  border: 1px solid $primary-color;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  flex: 1;
}

/* ===== 性能指标区域 ===== */
.performance-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

.performance-box {
  min-height: 100px;
  
  .metric-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
      text-align: center;
    width: 100%;
    height: 100%;
  }

  .value-line {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .number-flop {
      font-size: 24px;
      font-weight: bold;
      color: $accent-color;
      text-shadow: 0 0 10px $accent-color;
    }

    .unit {
      font-size: 16px;
      color: $accent-color;
      text-shadow: 0 0 10px $accent-color;
      margin-left: 2px;
    }
  }

  .label-line {
    margin-top: 10px;
    font-size: 18px;
    color: $text-secondary;
  }
}

/* ===== 右侧区域 ===== */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.shutdown-table {
  flex: 1;
  min-height: 0;
}

.start-stop-count {
  min-height: 100px;
}

.count-box {
  height: 100%;
  min-height: 100px;
  
  .metric-content {
  display: flex;
  flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
  }

  .value-line {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .number-flop {
      font-size: 24px;
      font-weight: bold;
      color: $accent-color;
      text-shadow: 0 0 10px $accent-color;
    }

    .unit {
      font-size: 16px;
      color: $accent-color;
      text-shadow: 0 0 10px $accent-color;
      margin-left: 2px;
    }
  }

  .label-line {
    margin-top: 10px;
    font-size: 18px;
    color: $text-secondary;
  }
}

/* ===== 下部分box样式 ===== */
.bottom-box {
  background: $card-bg;
  border-radius: 10px;
  border: 1px solid $primary-color;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

.box-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
}

.fault-free-time {
  background: linear-gradient(135deg, rgba(0, 255, 42, 0.1) 0%, rgba(0, 170, 255, 0.1) 100%);
}

.fault-repair-time {
  background: linear-gradient(135deg, rgba(255, 45, 85, 0.1) 0%, rgba(0, 170, 255, 0.1) 100%);
}

.alarm-info {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(0, 170, 255, 0.1) 100%);
}


/* ===== 性能指标卡片 ===== */
.performance-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px;
  height: 100%;
  min-height: 80px;
}


/* ===== 表格卡片 ===== */
.table-card {
  height: 100%;
  min-height: 300px;
}

/* ===== 表格样式 ===== */
.table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  font-size: 14px;
    color: $text-color;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $scrollbar-color;
    border-radius: 3px;
  }

  table {
      width: 100%;
    border-collapse: collapse;
    background-color: transparent;

    th,
    td {
      padding: 8px 6px;
      text-align: center;
      border: 1px solid $table-border;
      font-size: 12px;
    }

    th {
      font-weight: bold;
      color: $primary-color;
      background-color: $table-header-bg;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    tr {
      transition: background-color 0.3s ease;

      &:hover {
        background-color: $table-hover-bg;
      }
    }

    .alarm {
      color: #ff0000;
      animation: flash-red 1s infinite alternate;
    }
  }
}

/* ===== 指标卡片通用样式 ===== */
  .metric-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    height: 100%;
  min-height: 100px;

    .metric-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
      height: 100%;
    }

    .value-line {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .number-flop {
        font-size: 24px;
        font-weight: bold;
        color: $accent-color;
        text-shadow: 0 0 10px $accent-color;
      }

      .unit {
        font-size: 16px;
        color: $accent-color;
        text-shadow: 0 0 10px $accent-color;
        margin-left: 2px;
      }
    }

    .label-line {
      margin-top: 10px;
      font-size: 18px;
      color: $text-secondary;
  }
}


/* ===== 动画定义 ===== */
@keyframes flicker {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    opacity: 1;
  }
}

@keyframes flash-red {
  from {
    background-color: transparent;
  }

  to {
    background-color: rgba(255, 0, 0, 0.1);
  }
}
</style>