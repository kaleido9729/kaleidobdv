<template>
  <div class="time-selector">
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      :shortcuts="shortcuts"
      @change="onDateRangeChange"
      popper-class="popperClass"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  modelValue?: string[]
  onChange?: (value: [string, string] | null) => void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  onChange: () => {}
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'change': [value: [string, string] | null]
}>()

// 时间范围选择相关
const dateRange = ref<string[]>([])

// 设置默认时间为最近一周
const getDefaultWeekRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  return [
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ]
}

// 快捷选项
const shortcuts = [
  {
    text: "最近一天",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 1)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  },
  {
    text: "最近三天",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 3)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  },
  {
    text: "最近一月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(end.getMonth() - 1)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  },
  {
    text: "最近三月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(end.getMonth() - 3)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  },
  {
    text: "最近一年",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setFullYear(end.getFullYear() - 1)
      return [
        start.toISOString().slice(0, 19).replace("T", " "),
        end.toISOString().slice(0, 19).replace("T", " ")
      ]
    }
  }
]

// 日期范围变化处理
const onDateRangeChange = (value: [string, string] | null) => {
  if (value) {
    emit('update:modelValue', value)
    emit('change', value)
    props.onChange(value)
  }
}

// 监听外部传入的值变化
const updateDateRange = (newValue: string[]) => {
  if (newValue && newValue.length === 2) {
    dateRange.value = newValue
  }
}

// 监听props变化
onMounted(() => {
  if (props.modelValue && props.modelValue.length === 2) {
    dateRange.value = props.modelValue
  } else {
    dateRange.value = getDefaultWeekRange()
  }
})

// 暴露给父组件的方法
defineExpose({
  updateDateRange
})
</script>

<style lang="scss" scoped>
/* ===== 日期选择器样式 ===== */
:deep(.el-date-editor.el-range-editor) {
  background-color: #1f2937 !important;
  border-color: #4b5563 !important;
  color: #dddddd !important;
}

:deep(.el-date-editor.el-range-editor.is-active) {
  background-color: #374151 !important;
  border-color: #6b7280 !important;
}

:deep(.el-date-editor.el-range-editor .el-range-input) {
  background-color: transparent;
  color: #dddddd !important;
}

:deep(.el-date-editor.el-range-editor .el-range-separator) {
  color: #dddddd !important;
}
</style>

<style lang="scss">
.popperClass {

  * {
    color: #dddddd !important;   // 下拉框所有字体的颜色
  }


  .el-picker-panel {
    background-color: #040b31 !important;
  }
  
  .el-date-table td.in-range div, .el-date-table td
  .in-range div:hover, .el-date-table.is-week-mode 
  .el-date-table__row.current div, .el-date-table
  .is-week-mode .el-date-table__row:hover div {
    background: #27394a;
  }

  .el-date-table td.today span {
    background-color: rgb(139, 50, 50);
  }

  .el-date-range-picker__content .el-date-range-picker__header div {
    color: rgb(28, 14, 233);
  }

  .el-date-table td.end-date span, .el-date-table td.start-date span {
    background-color: #0a4228;
  }
}
</style>
