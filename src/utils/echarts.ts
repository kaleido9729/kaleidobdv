// src/utils/echarts.ts
import { use } from 'echarts/core'
import {
  BarChart, LineChart, PieChart, GaugeChart, MapChart
} from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent, DatasetComponent, TransformComponent, ToolboxComponent, VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  CanvasRenderer,
  // charts
  BarChart, LineChart, PieChart, GaugeChart, MapChart,
  // components
  GridComponent, TooltipComponent, LegendComponent, TitleComponent, DatasetComponent, TransformComponent, ToolboxComponent, VisualMapComponent
])

// 导出全局通用的 option 片段
export const baseGrid = { left: 10, right: 10, top: 40, bottom: 10, containLabel: true }
