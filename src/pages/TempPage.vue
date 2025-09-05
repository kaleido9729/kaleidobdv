<template>
  <dv-full-screen-container class="screen">
    <div class="header">
      <dv-decoration-8 style="width:250px;height:30px" />
      <div class="title">设备运行监控</div>
      <dv-decoration-8 :reverse="true" style="width:250px;height:30px" />
    </div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="date"
        type="daterange"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        size="small"
        :shortcuts="shortcuts"
      />
      <el-select v-model="selectedDevice" placeholder="选择设备" size="small">
        <el-option
          v-for="(name, id) in devices"
          :key="id"
          :label="name"
          :value="Number(id)"
        />
      </el-select>
    </div>

    <!-- 指标展示 -->
    <div v-if="filteredData" class="metrics">
      <el-card class="metric-card">
        <div class="metric-name">实际切削时间</div>
        <div class="metric-value">{{ filteredData.values[0] }}</div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-name">程序使用率</div>
        <div class="metric-value">{{ filteredData.values[1] }}</div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-name">设备时间开动率</div>
        <div class="metric-value">{{ filteredData.values[2] }}</div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-name">设备性能开动率</div>
        <div class="metric-value">{{ filteredData.values[3] }}</div>
      </el-card>
      <el-card class="metric-card">
        <div class="metric-name">故障平均修复时间</div>
        <div class="metric-value">{{ filteredData.values[4] }}</div>
      </el-card>
    </div>
    <div v-else class="no-data">暂无数据</div>

    <!-- 程序加工时间占比表格 -->
    <div v-if="filteredData && filteredData.programData && filteredData.programData.length > 0" class="program-table-section">
      <h3 class="table-title">程序加工时间占比</h3>
      <div class="table-container">
        <el-table :data="filteredData.programData"
          :max-height="600"
          class="program-table">
          <el-table-column prop="program" label="程序名" />
          <el-table-column prop="cuttingTime" label="切削时间" />
          <el-table-column prop="startDate" label="开始时间" />
          <el-table-column prop="endDate" label="结束时间" />
        </el-table>
      </div>
    </div>
    <div v-else-if="filteredData" class="no-program-data">暂无程序加工时间数据</div>
  </dv-full-screen-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElDatePicker, ElSelect, ElOption, ElCard, ElTable, ElTableColumn } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import { provide } from "vue";

import { fetchMetrics } from "@/api/metrics";  

// 时间 & 设备选择
const date = ref<string[]>([]);
const devices = {
  1: "[D14车间B12柱]090-076/XH2720X10",
  2: "[D14车间B14柱]090-077/XH2720X",
  3: "[C1南跨I05]090-066/TH6513-T2",
  4: "[C1南跨I03]090-067/TH6516",
  5: "[C1南二跨H07]090-015/XK2130",
  6: "[C1南二跨G03]090-069/新XH2130",
  7: "[C1-中跨F06]090-034/TK6916",
  8: "[C1-中跨F06]090-075/TK6920",
  9: "[D14车间-A20]090-008/TK6915",
  10: "[E3车间-C08]016-451/SK509",
  11: "[E3车间-C08]016-452/TK36S",
  12: "[B7车间-A08]090-065/TH6513-T1",
  13: "[B7车间-B08]090-073/WHN110Q",
  14: "[B7车间-A11]090-058/Spirit 230",
  15: "[E3车间-B11]061-058/VMC1270",
  16: "[E3车间-B12]061-060/VMC850E",
};
const selectedDevice = ref(1); // 改为数字ID，默认选择ID为2的设备

provide("elLocale", zhCn);

// 设置默认时间为最近一周
const getDefaultWeekRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return [
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ];
};

// 设置默认值
date.value = getDefaultWeekRange();

const shortcuts = [
  {
    text: "最近一天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  },
  {
    text: "最近三天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 3);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  },
  {
    text: "最近一月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 1);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  },
  {
    text: "最近三月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 3);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  },
  {
    text: "最近一年",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 1);
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ];
    }
  }
];

const mockData = ref<Array<{
  date: string;
  device: number;
  values: string[];
  programData: Array<{
    program: string;
    cuttingTime: string;
    startDate: string;
    endDate: string;
  }>;
}>>([]);

// 根据筛选条件过滤数据
const filteredData = computed(() => {
  if (!selectedDevice.value || date.value.length !== 2) return null;
  return mockData.value.length ? mockData.value[0] : null;
});

// 监听筛选条件变化
watch([selectedDevice, date], async ([deviceId, dateRange]) => {
  if (!deviceId || dateRange.length !== 2) return;
  await fetchData(deviceId, dateRange);
});

// 抽取数据获取逻辑为独立函数
const fetchData = async (deviceId: number, dateRange: string[]) => {
  const [startDate, endDate] = dateRange;
  
  // 将日期字符串转换为时间戳
  const start = new Date(startDate + ' 00:00:00 ').getTime();
  const end = new Date(endDate +  ' 00:00:00 ').getTime();
  
  try {
    // 直接使用数字ID
    const res = await fetchMetrics(deviceId, start, end);
    
    // 处理后端返回的数据格式
    if (res.data && res.data.data) {
      const backendData = res.data.data;
      
      // 处理程序数据
      const programData = backendData.cxyx ? backendData.cxyx.map((item: any) => ({
        program: item.program || '未知程序',
        cuttingTime: formatTime(item.cuttingTime || 0),
        startDate: item.startDate ? new Date(item.startDate).toLocaleString('zh-CN') : '未知',
        endDate: item.endDate ? new Date(item.endDate).toLocaleString('zh-CN') : '未知'
      })) : [];
      
      // 将后端数据转换为前端需要的格式
      const transformedData = {
        date: startDate + ' 00:00:00',
        device: deviceId,
        values: [
          formatValue(backendData.sjqxsj, 'cuttingTime'),           // 实际切削时间 - 直接显示数字
          formatValue(backendData.cxsyl, 'ratio'),            // 程序使用率 - 直接显示数字
          formatValue(backendData.sjkdl, 'ratio'),            // 设备时间开动率 - 直接显示数字
          formatValue(backendData.xnkdl, 'ratio'),            // 设备性能开动率 - 直接显示数字
          formatValue(backendData.gzpjxfsj, 'cuttingTime')          // 故障平均修复时间 - 直接显示数字
        ],
        programData: programData
      };
      
      mockData.value = [transformedData];
    } else {
      mockData.value = [];
    }
  } catch (err) {
    console.error("请求失败", err);
    mockData.value = [];
  }
};

// 组件挂载后自动查询默认数据
onMounted(async () => {
  if (selectedDevice.value && date.value.length === 2) {
    await fetchData(selectedDevice.value, date.value);
  }
});

// 格式化数值的函数 - 修改为直接显示数字
const formatValue = (value: number, unit: string) => {
  if (value === null || value === undefined) return '0';
  
  // 如果是第一个指标（实际切削时间），转换为H:M:S格式
  if (unit === 'cuttingTime') {
    return formatTime(value);
  }
  
  // 如果是比率指标（程序使用率、设备时间开动率、设备性能开动率），转换为百分比
  if (unit === 'ratio') {
    return `${(value * 100).toFixed(2)}%`;
  }
  
  // 其他情况直接显示数字
  return unit ? `${value}${unit}` : `${value}`;
};

// 将秒数转换为H:M:S格式
const formatTime = (milliseconds: number) => {
  if (!milliseconds || milliseconds <= 0) return '0小时00分钟00秒';
  
  // 先将毫秒转换为秒
  const totalSeconds = Math.floor(milliseconds / 1000);
  
  // 计算小时、分钟和秒
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours}小时${minutes.toString().padStart(2, '0')}分钟${seconds.toString().padStart(2, '0')}秒`;
};
</script>

<style scoped>
.screen {
  background: #0a1f44;
  color: #fff;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 35px;
  font-weight: bold;
  color: #00eaff;
}
.filter-bar {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  justify-content: center;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 20px;
}
.metric-card {
  background: rgba(255, 255, 255, 0.05);
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  color: #fff;
}
.metric-name {
  font-size: 16px;
  margin-bottom: 10px;
  color: #00eaff;
}
.metric-value {
  font-size: 20px;
  font-weight: bold;
}
.no-data {
  margin-top: 40px;
  text-align: center;
  font-size: 18px;
  color: #ff8080;
}
.program-table-section {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.table-title {
  color: #00eaff;
  margin-bottom: 20px;
  text-align: center;
}
.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  overflow-x: auto;
}
.program-table {
  background: linear-gradient(135deg, rgba(10, 31, 68, 0.8), rgba(20, 50, 100, 0.6));
  border-radius: 15px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 32px rgba(14, 17, 17, 0.1);
  backdrop-filter: blur(10px);
  min-width: 800px;
}
.program-table :deep(.el-table__header) {
  background: rgba(10, 31, 68, 0.9);
  color: #00eaff;
}
.program-table :deep(.el-table__body) {
  background: rgba(10, 31, 68, 0.7);
}
/* .program-table :deep(.el-table__row:hover) {
  background: rgba(1, 11, 12, 0.15);
} */
.program-table :deep(.el-table__cell) {
  border-bottom: 1px solid rgba(0, 234, 255, 0.2);
  color: #1b0505;
}
.program-table :deep(.el-table__header .el-table__cell) {
  background: rgba(10, 31, 68, 0.9);
  color: #00eaff;
  font-weight: bold;
}
.no-program-data {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: #ff8080;
}
</style>
