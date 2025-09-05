<template>
  <dv-full-screen-container class="big-screen-container">
    <!-- 页面头部 -->
    <header class="header">
      <dv-decoration-8 class="decoration-left" />
      <h1 class="header-title">机加机床联网可视化大屏</h1>
      <dv-decoration-8 class="decoration-right" :reverse="true" />
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧面板 - 机床状态分布图 -->
      <div class="left-panel">
        <dv-border-box-13>
          <div class="pie-echarts-panel">
            <h2 class="pie-panel-title">机床状态分布</h2>
            <EChart :option="pieOption" />
          </div>
        </dv-border-box-13>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 状态汇总区域 -->
        <div class="right-top-panel">
          <dv-border-box-8>
            <div class="status-summary-panel">
              <div class="status-summary">
                <div class="summary-item">
                  <span class="label">运行:</span>
                  <span class="value running">{{ totalRunning }}</span>
                  <span class="unit">台</span>
                </div>
                <div class="summary-item">
                  <span class="label">告警:</span>
                  <span class="value alert">{{ totalAlert }}</span>
                  <span class="unit">台</span>
                </div>
                <div class="summary-item">
                  <span class="label">待机:</span>
                  <span class="value standby">{{ totalStandby }}</span>
                  <span class="unit">台</span>
                </div>
                <div class="summary-item">
                  <span class="label">离线:</span>
                  <span class="value offline">{{ totalOffline }}</span>
                  <span class="unit">台</span>
                </div>
              </div>
            </div>
          </dv-border-box-8>
        </div>

        <!-- 车间状态盒子区域 - 分两行显示 -->
        <div class="workshop-boxes-container">
          <div class="workshop-boxes-row">
            <dv-border-box-6 
              v-for="box in allBoxesData.slice(0, 5)" 
              :key="box.name" 
              class="workshop-box"
              @click="box.route && goToWorkshop(box.route)"
            >
              <WorkshopBox :box="box" />
            </dv-border-box-6>
          </div>
          
          <div class="workshop-boxes-row">
            <dv-border-box-6 
              v-for="box in allBoxesData.slice(5)" 
              :key="box.name" 
              class="workshop-box"
              @click="box.route && goToWorkshop(box.route)"
            >
              <WorkshopBox :box="box" />
            </dv-border-box-6>
          </div>
        </div>
      </div>
    </main>
  </dv-full-screen-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EChart from '@/components/EChart.vue'
import WorkshopBox from '@/components/WorkshopBox.vue'
import { bigScreenRealTimeValue } from '@/api/bigScreenApi'

// 导入图标
import runningIcon from '@/assets/运行.svg'
import alertIcon from '@/assets/告警.svg'
import standbyIcon from '@/assets/待机.svg'
import offlineIcon from '@/assets/离线.svg'


const router = useRouter()

// 下方所有box数据 - 初始化为空数组，将从API获取数据
const allBoxesData = reactive<any[]>([])

// 计算各种运行状态的总数
const totalRunning = computed(() => {
  return allBoxesData.reduce((sum, box) => sum + box.status.find((s: any) => s.name === '运行')!.value, 0)
})

const totalAlert = computed(() => {
  return allBoxesData.reduce((sum, box) => sum + box.status.find((s: any) => s.name === '告警')!.value, 0)
})

const totalStandby = computed(() => {
  return allBoxesData.reduce((sum, box) => sum + box.status.find((s: any) => s.name === '待机')!.value, 0)
})

const totalOffline = computed(() => {
  return allBoxesData.reduce((sum, box) => sum + box.status.find((s: any) => s.name === '离线')!.value, 0)
})

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: {
      itemWidth:48,
      itemHeight:24,
      bottom: '17%',
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'normal',
        color: '#ffffff',
      },
  },
  series: [{
    name: '状态',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '40%'],
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
      formatter: '{b|{b}}\n{c|{c}}台',
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
      { value: totalRunning.value, name: '运行', itemStyle: { color: '#00ff2a' } },
      { value: totalAlert.value, name: '告警', itemStyle: { color: '#ff2d55' } },
      { value: totalStandby.value, name: '待机', itemStyle: { color: '#3498db' } },
      { value: totalOffline.value, name: '离线', itemStyle: { color: '#95a5a6' } }
    ]
  }]
}))


// 更新车间数据
function updateWorkshopData(workshopData: any[]) {
  // 清空现有数据
  allBoxesData.splice(0, allBoxesData.length)
  
  // 根据API返回的数据创建车间盒子
  workshopData.forEach(data => {
    const total = data.run + data.alarm + data.shutdown + data.offline
    
    const box = {
      name: data.label,
      total: total,
      route: `/workshop/${data.label}`, 
      status: [
        { name: '运行', icon: runningIcon, value: data.run },
        { name: '告警', icon: alertIcon, value: data.alarm },
        { name: '待机', icon: standbyIcon, value: data.shutdown },
        { name: '离线', icon: offlineIcon, value: data.offline }
      ]
    }
    
    allBoxesData.push(box)
  })
}
// 获取车间数据
async function loadWorkshopData() {
  try {
    const response = await bigScreenRealTimeValue()
    if (response.data && response.data.data) {
      updateWorkshopData(response.data.data)
    }
  } catch (error) {
    console.error('获取车间数据失败:', error)
  }
}

// 定时器相关设定
let intervalId: NodeJS.Timeout | null = null

// 组件挂载时获取数据
onMounted(() => {
  // 立即加载一次数据
  loadWorkshopData()
  
  // 设置定时器，每30秒刷新一次数据
  intervalId = setInterval(() => {
    loadWorkshopData()
  }, 30000)
})

// 跳转到车间详情页
function goToWorkshop(route: string) {
  router.push(route)
}
</script>

<style lang="scss" scoped>
/* ===== 变量定义 ===== */
$primary-bg: #0d1a26;
$primary-text: #c9e6ff;
$header-text: #e0f2fe;
$accent-color: #00ccff;
$running-color: #00ff2a;
$alert-color: #ff2d55;
$standby-color: #3498db;
$offline-color: #95a5a6;
$header-border: rgba(0, 204, 255, 0.3);
$header-bg: rgba(13, 26, 38, 0.5);

/* ===== 全局样式 ===== */
.big-screen-container {
  background: $primary-bg 
      // url('@/assets/bg.png') 
      center/cover no-repeat;
  color: $primary-text;
  display: flex;
  flex-direction: column;
}

/* ===== 头部样式 ===== */
.header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  background-color: $header-bg;
  backdrop-filter: blur(5px);
  border-bottom: 2px solid $header-border;

  .decoration-left,
  .decoration-right {
    width: 300px;
    height: 40px;
  }

  .header-title {
    font-size: 60px;
    font-weight: 800;
    letter-spacing: 2px;
    color: $header-text;
  }
}

/* ===== 主内容区布局 ===== */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 7fr;
  padding: 20px;
  gap: 20px;
}

/* ===== 左侧面板样式 ===== */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 20px;
  overflow-y: auto;
}

.pie-echarts-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.pie-panel-title {
  font-size: 28px;
  font-weight: bold;
  color: $accent-color;
  text-align: center;
  margin-bottom: 15px;
}

/* ===== 右侧面板样式 ===== */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 20px;
}

/* ===== 状态汇总面板样式 ===== */
.right-top-panel {
  flex: 3;
  flex-shrink: 0;
  min-height: 200px;
}

.status-summary-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.status-summary {
  display: flex;
  gap: 180px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .label {
    font-size: 45px;
    font-weight: bold;
    color: #b0bec5;
  }
  
  .value {
    font-size: 56px;
    font-weight: bold;
    margin-top: 5px;
    
    &.running { color: $running-color; }
    &.alert { color: $alert-color; }
    &.standby { color: $standby-color; }
    &.offline { color: $offline-color; }
  }
  
  .unit {
    font-size: 20px;
    margin-top: 5px;
  }
}

/* ===== 车间盒子容器样式 ===== */
.workshop-boxes-container {
  flex: 4;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workshop-boxes-row {
  display: flex;
  gap: 20px;
  flex: 1;
}

.workshop-box {
  flex: 1;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
}
</style>
