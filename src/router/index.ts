import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import BigScreen from '@/pages/BigScreen.vue'

// 引入车间页面
import WorkshopScreen from '@/pages/workshop/WorkshopScreen.vue'

// 引入机床详情页
import machine from '@/pages/machine/Machine.vue'

import TempPage from '@/pages/TempPage.vue'
import HelloWorld from '@/components/HelloWorld.vue'

const routes: RouteRecordRaw[] = [
  // { path: '/', name: 'TempPage', component: TempPage },
  // { path: '/', name: 'HelloWorld', component: HelloWorld },
  
  { path: '/', name: 'BigScreen', component: BigScreen },
  { path: '/workshop/:workshopId', name: 'WorkshopScreen', component: WorkshopScreen },
  
  
  // 车间设备路由 - 所有设备共用C1Machine.vue组件
  { path: '/machine/:workshopId/:machineId', name: 'MachineDetail', component: machine },


]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
