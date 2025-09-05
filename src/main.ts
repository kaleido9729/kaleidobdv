// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.scss'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

// ECharts 按需
import './utils/echarts'
// vue-echarts 组件
import VueECharts from 'vue-echarts'  

// DataV
import DataV from '@kjgl77/datav-vue3'

const app = createApp(App)
app.component('VChart', VueECharts)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(DataV)
app.use(router)
app.mount('#app')
