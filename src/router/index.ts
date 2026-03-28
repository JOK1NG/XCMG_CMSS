import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Layout,
            redirect: '/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/dashboard/index.vue'),
                    meta: { title: '数据看板' },
                },
                {
                    path: 'equipment/list',
                    name: 'EquipmentList',
                    component: () => import('@/views/equipment/list.vue'),
                    meta: { title: '设备台账' },
                },
                {
                    path: 'workorder/list',
                    name: 'WorkOrderList',
                    component: () => import('@/views/workorder/list.vue'),
                    meta: { title: '工单列表' },
                },
                {
                    path: 'maintain/order',
                    name: 'MaintainOrder',
                    component: () => import('@/views/maintain/order.vue'),
                    meta: { title: '保养工单' },
                },
                {
                    path: 'spare/list',
                    name: 'SpareList',
                    component: () => import('@/views/spare/list.vue'),
                    meta: { title: '备件管理' },
                },
                {
                    path: 'system/user',
                    name: 'SystemUser',
                    component: () => import('@/views/system/user.vue'),
                    meta: { title: '用户管理' },
                },
            ],
        },
    ],
})

export default router