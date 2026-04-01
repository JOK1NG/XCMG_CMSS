import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录', public: true },
    },
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

router.beforeEach((to, _from, next) => {
  const bypassAuth =
    import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
  if (bypassAuth) {
    next()
    return
  }

  if (to.meta.public) {
    if (to.path === '/login' && localStorage.getItem('token')) {
      next({ path: '/dashboard' })
      return
    }
    next()
    return
  }
  if (!localStorage.getItem('token')) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
