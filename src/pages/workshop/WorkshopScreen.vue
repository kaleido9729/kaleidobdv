<template>
  <div class="dashboard-container">
    <!-- 粒子背景 -->
    <vue-particles
      class="particles-bg"
      color="#fff"
      :particleOpacity="0.7"
      :particlesNumber="80"
      shapeType="circle"
      :particleSize="4"
      linesColor="#fff"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="2"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    />

    <!-- 页面头部 -->
    <header class="header">
      <DateRangePicker
        v-model="dateRange"
        @change="onDateRangeChange"
      />
      <h1 class="header-title" @click="goBack">{{ workshopName }}车间设备看板</h1>
      <div class="time-display">
        <span class="time-value">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧面板 -->
      <aside class="left-panel panel">
        <dv-border-box-11 :color="['#00aaff', '#00041a']" title="生产设备24小时履历表" class="top-panel-card">
            <EChart :option="barOption" />
        </dv-border-box-11>
        <dv-border-box-11 title="停机时间" class="bottom-panel-card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th v-for="header in downtimeHeaders" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in downtimeData" :key="index">
                  <td>{{ row.startTime }}</td>
                  <td>{{ row.endTime }}</td>
                  <td>{{ row.machine }}</td>
                  <td>{{ row.category }}</td>
                  <td>{{ row.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </dv-border-box-11>
      </aside>

      <!-- 中间面板 -->
      <section class="center-panel">
        <!-- 设备图标区域 -->
        <div class="machine-icons-container">
          <div v-for="(item, index) in barChartData" :key="index" class="machine-icon-item" @click="goToWorkshop(item.route)">
            <img :src="getMachineIcon(item.type, item.status)" :alt="item.name" :title="item.name" class="machine-icon" />
            <span class="machine-name">{{ item.name }}</span>
          </div>
        </div>

        <!-- 设备状态统计 -->
        <div class="count-board">
          <dv-border-box-8>
            <div class="count-box-container">
              <div class="count-item">
                <div class="icon">
                  <img :src="runningIcon" alt="运行" class="status-icon" />
                </div>
                <span class="count-value">运行: {{ statusCount['运行'] || 0 }} 台</span>
              </div>
              <div class="count-item">
                <div class="icon">
                  <img :src="alertIcon" alt="告警" class="status-icon" />
                </div>
                <span class="count-value">告警: {{ statusCount['告警'] || 0 }} 台</span>
              </div>
              <div class="count-item">
                <div class="icon">
                  <img :src="standbyIcon" alt="待机" class="status-icon" />
                </div>
                <span class="count-value">待机: {{ statusCount['待机'] || 0 }} 台</span>
              </div>
              <div class="count-item">
                <div class="icon">
                  <img :src="offlineIcon" alt="离线" class="status-icon" />
                </div>
                <span class="count-value">离线: {{ statusCount['离线'] || 0 }} 台</span>
              </div>
            </div>
          </dv-border-box-8>
        </div>

        <!-- 指标卡片 -->
        <div class="metrics-cards">
          <dv-border-box-7 class="metric-card" v-for="metric in metricsData" :key="metric.id">
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

      <!-- 右侧面板 -->
      <aside class="right-panel panel">
        <dv-border-box-11 :color="['#00aaff', '#00041a']" title="设备状态" class="top-panel-card">
          <EChart :option="pieOption"/>
        </dv-border-box-11>
        <dv-border-box-11 title="设备报警" class="bottom-panel-card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th v-for="header in alarmHeaders" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in alarmData" :key="index" :class="{ 'alarm': row.status === '离线' }">
                  <td>{{ row.name }}</td>
                  <td>{{ row.time }}</td>
                  <td>{{ row.info }}</td>
                  <td>{{ row.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </dv-border-box-11>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EChart from '@/components/EChart.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import { workshopRealTimeValue, workshopDetailValue } from '@/api/workshopApi'

import { useRouter, useRoute } from 'vue-router'

// 导入图标
import runningIcon from '@/assets/运行.svg'
import alertIcon from '@/assets/告警.svg'
import standbyIcon from '@/assets/待机.svg'
import offlineIcon from '@/assets/离线.svg'
import machineIcon from '@/assets/总机床.svg'
import centreRunningIcon from '@/assets/加工中心-运行.svg'
import centreAlertIcon from '@/assets/加工中心-告警.svg'
import centreStandbyIcon from '@/assets/加工中心-待机.svg'
import centreOfflineIcon from '@/assets/加工中心-离线.svg'
import xiangRunningIcon from '@/assets/铣床-运行.svg'
import xiangAlertIcon from '@/assets/铣床-告警.svg'
import xiangStandbyIcon from '@/assets/铣床-待机.svg'
import xiangOfflineIcon from '@/assets/铣床-离线.svg'
import tangRunningIcon from '@/assets/镗床-运行.svg'
import tangAlertIcon from '@/assets/镗床-告警.svg'
import tangStandbyIcon from '@/assets/镗床-待机.svg'
import tangOfflineIcon from '@/assets/镗床-离线.svg'

const router = useRouter()
const route = useRoute()

// 获取车间名称
const workshopName = computed(() => {
  return route.params.workshopId as string || 'C1'
})

// 时间范围选择相关
const dateRange = ref<string[]>([]);


// 日期范围变化处理
const onDateRangeChange = (value: [string, string] | null) => {
  if (value) {
    console.log('选择的日期范围:', value[0], '至', value[1])
    // 调用车间详细数据接口
    loadWorkshopDetailData(value[0], value[1])
  }
}

// 实时时间显示
const currentTime = ref('')
let timeInterval: NodeJS.Timeout | null = null

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
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 图标映射函数
const getMachineIcon = (type: string, status: string) => {
  switch (type) {
    case '加工中心':
      switch (status) {
        case '运行': return centreRunningIcon
        case '告警': return centreAlertIcon
        case '待机': return centreStandbyIcon
        case '离线': return centreOfflineIcon
        default: return machineIcon
      }
    case '铣床':
      switch (status) {
        case '运行': return xiangRunningIcon
        case '告警': return xiangAlertIcon
        case '待机': return xiangStandbyIcon
        case '离线': return xiangOfflineIcon
        default: return machineIcon
      }
    case '镗床':
      switch (status) {
        case '运行': return tangRunningIcon
        case '告警': return tangAlertIcon
        case '待机': return tangStandbyIcon
        case '离线': return tangOfflineIcon
        default: return machineIcon
      }
    default:
      return machineIcon
  }
}
// 设备数据 - 从API获取
const barChartData = ref<any[]>([])

// 统计status数量
const statusCount = computed(() => {
  return barChartData.value.reduce((acc: any, item: any) => {
    const status = item.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});

const downtimeHeaders = ['停机开始时间', '停机结束时间', '停机机台', '停机类别', '停机原因']

const downtimeData = ref<any[]>([])

const alarmHeaders = ['设备名称', '报警时间', '报警信息', '处理状态']
const alarmData = ref<any[]>([])

// 指标数据 - 从API获取
const metricsData = ref([
  { id: 1, value: 0, label: '总工件数' },
  { id: 2, value: 0, label: '平均设备使用率', unit: '%' },
  { id: 3, value: 0, label: '设备时间开动率', unit: '%' },
  { id: 4, value: 0, label: '程序加工时间占比', unit: '%' },
  { id: 5, value: 0, label: '平均无故障时间' },
  { id: 6, value: 0, label: '故障平均修复时间', unit: '%' },
  { id: 7, value: 0, label: '设备性能开动率', unit: '%' },
  { id: 8, value: 0, label: '自动加工时间占比', unit: '%' }
]);

/* ====================================== 横向柱状图设计 ========================================== */
const barOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#888' },
    axisLine: { lineStyle: { color: '#333' } },
    splitLine: { show: false }
  },
  yAxis: {
    type: 'category',
    data: barChartData.value.map((item: any) => item.name),
    axisLabel: { color: '#fff' },
    axisLine: { lineStyle: { color: '#333' } },
    axisTick: { show: false }
  },
  series: [{
    name: '工作时长(小时)',
    type: 'bar',
    data: barChartData.value.map((item: any) => item.value),
    barWidth: '50%',
    showBackground: true,
    backgroundStyle: { color: 'rgba(50, 50, 50, 0.3)' },
    itemStyle: {
      borderRadius: [0, 10, 10, 0],
      shadowColor: 'rgba(0, 170, 255, 0.2)',
        color: (params: any) => {
        // 根据不同的值返回不同的颜色
        const colors = ['#6baed6', '#74c476', '#fd8d3c', '#9e9ac8', '#bdbdbd'];
        return colors[params.dataIndex % colors.length];
      },
      shadowBlur: 10,
      emphasis: {
        shadowBlur: 20,
        shadowColor: '#fff',
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
      
    },
    animationDuration: 2000,
    animationEasing: 'elasticOut'
  }]
}))

/* ====================================== 饼状图设计 ========================================== */
const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    name: '状态',
    type: 'pie',
    radius: ['35%', '60%'],
    center: ['50%', '60%'],
    avoidLabelOverlap: false,
    itemStyle: {    // 圆角
      borderRadius: 5,
      borderColor: '#111',
      borderWidth: 2,
      emphasis: {
        shadowBlur: 20,
        shadowColor: '#fff',
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    },
    label: {
      show: true,
      formatter: '{b|{b}}\n{c|{c}}',
      position: 'outside',
      rich: {
        b: {
          fontSize: 24,
          color: '#ffffff',
          fontWeight: 'bold',
          lineHeight: 30
        },
        c: {
          fontSize: 20,
          color: '#ffffff',
          fontWeight: 'bold'
        }
      }
    },
    labelLine: { show: true, length: 10, length2: 10, lineStyle: { color: '#00ccff' } },
    data: [
      { value: statusCount.value['运行'] || 0, name: '运行', itemStyle: { color: '#00ff2a' } },
      { value: statusCount.value['告警'] || 0, name: '告警', itemStyle: { color: '#ff2d55' } },
      { value: statusCount.value['待机'] || 0, name: '待机', itemStyle: { color: '#3498db' } },
      { value: statusCount.value['离线'] || 0, name: '离线', itemStyle: { color: '#95a5a6' } }
    ]
  }]
}))

/* ====================================== 定时器定时请求实时数据 ========================================== */
// 更新车间数据
function updateWorkshopData(workshopData: any) {
  // 清空现有数据
  barChartData.value = []
  
  // 处理车间数据 - 新数据结构是单个车间对象，包含devices数组
  if (workshopData && workshopData.devices && workshopData.devices.length > 0) {
    workshopData.devices.forEach((device: any) => {
      // 根据设备类型和状态确定图标和状态名称
      const deviceType = getDeviceTypeName(device.type)
      const statusName = getStatusName(device.status)
      
      const deviceItem = {
        name: `${device.label}\n(${device.type})`,
        value: formatRunTime(device.runTime || 0),
        type: deviceType,
        status: statusName,
        route: `/machine/${workshopName.value}/${device.label}`
      }
      
      barChartData.value.push(deviceItem)
    })
  }
}

// 根据设备类型获取设备类型名称
function getDeviceTypeName(type: string): string {
  // 根据设备型号判断设备类型
  if (type.includes('XH') || type.includes('TH')) {
    return '加工中心'
  } else if (type.includes('XK') || type.includes('铣')) {
    return '铣床'
  } else if (type.includes('TK') || type.includes('镗')) {
    return '镗床'
  } else {
    return '机床'
  }
}

// 根据状态编号获取状态名称
function getStatusName(status: number): string {
  switch (status) {
    case 0: return '运行'
    case 1: return '告警'
    case 2: return '待机'
    case 3: return '离线'
    default: return '离线'
  }
}

// 将毫秒转换为小时显示
function formatRunTime(milliseconds: number): number {
  // 将毫秒转换为小时，保留1位小数
  return Math.round((milliseconds / (1000 * 60 * 60)) * 10) / 10
}

// 将日期字符串转换为时间戳（毫秒）
function dateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime()
}

// 将API数据转换为指标格式
function convertApiDataToMetrics(devices: any[]): any[] {
  if (!devices || devices.length === 0) {
    return metricsData.value
  }

  // 计算所有设备的平均值或总和
  const totalDevices = devices.length
  let totalZgjs = 0
  let totalPjsbsyl = 0
  let totalSbsjkdl = 0
  let totalCxjgsjzb = 0
  let totalPjwgzsj = 0
  let totalGzpjxfsj = 0
  let totalSbxnkdl = 0
  let totalZdjgsjzb = 0

  devices.forEach(device => {
    totalZgjs += device.zgjs || 0
    totalPjsbsyl += device.pjsbsyl || 0
    totalSbsjkdl += device.sbsjkdl || 0
    totalCxjgsjzb += device.cxjgsjzb || 0
    totalPjwgzsj += device.pjwgzsj || 0
    totalGzpjxfsj += device.gzpjxfsj || 0
    totalSbxnkdl += device.sbxnkdl || 0
    totalZdjgsjzb += device.zdjgsjzb || 0
  })

  return [
    { id: 1, value: Math.round(totalZgjs * 10) / 10, label: '总工件数' },
    { id: 2, value: Math.round((totalPjsbsyl / totalDevices) * 10000) / 100, label: '平均设备使用率', unit: '%' },
    { id: 3, value: Math.round((totalSbsjkdl / totalDevices) * 10000) / 100, label: '设备时间开动率', unit: '%' },
    { id: 4, value: Math.round((totalCxjgsjzb / totalDevices) * 10000) / 100, label: '程序加工时间占比', unit: '%' },
    { id: 5, value: Math.round((totalPjwgzsj / totalDevices) * 10) / 10, label: '平均无故障时间' },
    { id: 6, value: Math.round((totalGzpjxfsj / totalDevices) * 10000) / 100, label: '故障平均修复时间', unit: '%' },
    { id: 7, value: Math.round((totalSbxnkdl / totalDevices) * 10000) / 100, label: '设备性能开动率', unit: '%' },
    { id: 8, value: Math.round((totalZdjgsjzb / totalDevices) * 10000) / 100, label: '自动加工时间占比', unit: '%' }
  ]
}
// 获取车间实时数据
async function loadWorkshopData() {
  try {
    const response = await workshopRealTimeValue(workshopName.value)

    if (response.data && response.data.data) {
      updateWorkshopData(response.data.data)
    }
  } catch (error) {
    console.error('获取车间数据失败:', error)
  }
}

// 获取车间详细数据
async function loadWorkshopDetailData(startDate?: string, endDate?: string) {
  try {
    // 如果没有提供日期，使用默认的最近7天
    const defaultEndDate = new Date()
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 7)
    
    const start = startDate ? dateToTimestamp(startDate) : defaultStartDate.getTime()
    const end = endDate ? dateToTimestamp(endDate) : defaultEndDate.getTime()
    
    const response = await workshopDetailValue(workshopName.value, start, end)
    
    if (response.data && response.data.data) {
      console.log('车间详细数据:', response.data.data)
      // 这里可以处理详细数据，比如更新指标卡片、停机时间表等
      updateWorkshopDetailData(response.data.data)
    }
  } catch (error) {
    console.error('获取车间详细数据失败:', error)
  }
}

// 更新车间详细数据
function updateWorkshopDetailData(detailData: any) {
  console.log('更新车间详细数据:', detailData)
  
  // 更新指标数据
  if (detailData.devices && detailData.devices.length > 0) {
    metricsData.value = convertApiDataToMetrics(detailData.devices)
  }
  
  // 更新停机时间数据
  updateDowntimeData(detailData.devices)
  
  // 更新报警数据
  updateAlarmData(detailData.devices)
}

// 更新停机时间数据
function updateDowntimeData(devices: any[]) {
  const downtimeList: any[] = []

  devices.forEach(device => {
    if (device.tjsj && device.tjsj.length > 0) {
      device.tjsj.forEach((record: any) => {
        // 转换时间格式
        const startTime = new Date(record.startDate).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        const endTime = new Date(record.endDate).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        // 转换停机类型
        const category = record.shutdownType === 0 ? '计划停机' : '故障停机'
        
        downtimeList.push({
          startTime: startTime,
          endTime: endTime,
          machine: device.label,
          category: category,
          reason: record.shutdownDescription || '无'
        })
      })
    }
  })

  console.log('停机时间数据:', downtimeList)
  
  // 更新停机时间数据
  downtimeData.value.splice(0, downtimeData.value.length, ...downtimeList)
}

// 更新报警数据
function updateAlarmData(devices: any[]) {
  const alarmList: any[] = []
  
  devices.forEach(device => {
    if (device.alarm && device.alarm.length > 0) {
      device.alarm.forEach((alarm: any) => {
        alarmList.push({
          name: `${device.label}(${device.type})`,
          time: new Date(alarm.time || Date.now()).toLocaleString('zh-CN'),
          info: alarm.info || '设备报警',
          status: alarm.status || '待处理'
        })
      })
    }
  })
  
  alarmData.value.splice(0, alarmData.value.length, ...alarmList)
}

// 定时器相关设定
let intervalId: NodeJS.Timeout | null = null

// 组件挂载时获取数据
onMounted(() => {
  // 立即加载一次实时数据
  loadWorkshopData()
  
  // 立即加载一次详细数据
  loadWorkshopDetailData()
  
  // 设置定时器，每30秒刷新一次实时数据
  intervalId = setInterval(() => {
    loadWorkshopData()
  }, 30000)
})

/* ====================================== 路由返回相关操作 =====================================*/
function goToWorkshop(route: string) {
  router.push(route)
}

function goBack() {
  router.go(-1)
}
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
    top: 20px;
    left: 30px;
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
  gap: 20px;
  padding: 20px;
}

/* ===== 面板通用样式 ===== */
.panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 0 0 25%;
  
  .top-panel-card, .bottom-panel-card {
    height: 50%;
    
    :deep(.dv-border-box-8-container) {
      padding: 10px;
    }
  }
  
}

/* ===== 图表容器 ===== */



/* ===== 表格样式 ===== */
.table-container {
  width: 100%;
  max-height: 400px;
  overflow: auto;
  font-size: 14px;
  color: $text-color;
  margin-top: 11%; 
  
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
    width: 95%;
    margin: 0 auto; /* 左右居中 */
    border-collapse: collapse;
    background-color: $card-bg;
    table-layout: fixed;

    th, td {
      padding: 12px 10px;
      text-align: center;
      border: 1px solid $table-border;

      &:nth-child(1) { width: 20%; } // 停机开始时间
      &:nth-child(2) { width: 20%; } // 停机结束时间
      &:nth-child(3) { width: 15%; } // 停机机台
      &:nth-child(4) { width: 10%; } // 停机类别
      &:nth-child(5) { width: 17%; } // 停机原因
    }

    th {
      font-weight: bold;
      color: $primary-color;
      background-color: $table-header-bg;
      position: sticky;
      top: 0;
      z-index: 2;
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

/* ===== 中间面板 ===== */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 设备图标区域 ===== */
.machine-icons-container {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: $card-bg;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 170, 255, 0.2);
  flex-direction: row;
  
  .machine-icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      transform: translateY(-5px) scale(1.1);
      color: $accent-color;
    }
  }


  .machine-icon {
    width: 90%;
    height: 90%;
    filter: drop-shadow(0 0 5px $primary-color);
  }

  .machine-name {
    font-size: 20px;
    text-align: center;
    color: $text-secondary;
    white-space: pre-line;
  }
}

/* ===== 统计面板 ===== */
.count-board {
  display: flex;
  justify-content: space-around;
  padding: 0;
}

.count-box-container {
  display: flex;
  flex-direction: row; 
  justify-content: space-around;
  align-items: center; 
  padding: 60px;
  background-color: $card-bg;
  border-radius: 10px;
  box-shadow: 0 0 10px $primary-color;
  width: 100%;

  .count-item {
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $text-color;
    margin: 0 15px;
    
    span {
      margin-top: 10px;
    }
    .count-value {
      font-size: 24px;
      font-weight: bold;
    }
    .icon {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .status-icon {
        width: 90px;
        height: 90px;
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
      }
    }
  }
}


/* ===== 指标卡片 ===== */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(4, 2fr);
  gap: 20px;
  flex: 1;
  padding: 0;
  
  .metric-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    height: 100%; /* 确保占满容器高度 */
    
    .metric-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%; /* 占满宽度 */
      height: 100%; /* 占满高度 */
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
}

/* ===== 动画定义 ===== */
@keyframes flicker {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

@keyframes flash-red {
  from { background-color: transparent; }
  to { background-color: rgba(255, 0, 0, 0.1); }
}
</style>

<style lang="scss">
.popperClass {

  * {
    color: #dddddd !important;
  }


  .el-picker-panel {
    background-color: #040b31 !important;
  }
  
  .el-date-table td.in-range div, .el-date-table td.in-range div:hover, .el-date-table.is-week-mode .el-date-table__row.current div, .el-date-table.is-week-mode .el-date-table__row:hover div {
    background: #27394a;
  }

  // .el-date-table td span {
  //   color: rgb(13, 228, 13);
  // }

  // .el-date-table th {
  //   color: aqua;
  // }

  .el-date-table td.today span {
    background-color: rgb(139, 50, 50);
  }

  .el-date-range-picker__content .el-date-range-picker__header div {
    color: rgb(28, 14, 233);
  }

  .el-date-table td.end-date span, .el-date-table td.start-date span {
    background-color: #0a4228;
  }

  // .el-date-editor el-range-editor el-input__inner el-date-editor--daterange el-range-editor--small {
  //   background-color: #5c0530 !important;
  // }
  
}
</style>

