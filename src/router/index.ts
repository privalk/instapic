import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',

      component: Home,
    },
    {
      path: '/GridSelect',
      name: 'GridSelect',
      component: () => import('@/views/GridSelect.vue'),
    },
    {
      path: '/WaySelect',
      name: 'WaySelect',
      component: () => import('@/views/WaySelect.vue')
    },
    {
      path: '/PaySelect',
      name: 'PaySelect',
      component: () => import('@/views/PaySelect.vue')
    },
    {
      path: '/InputCoupon',
      name: 'InputCoupon',
      component: () => import('@/views/InputCoupon.vue')
    },
    {
      path: '/Pay',
      name: 'Pay',
      component: () => import('@/views/Pay.vue')
    },
    {
      path: '/PhotoFrameSelect',
      name: 'PhotoFrameSelect',
      component: () => import('@/views/PhotoFrameSelect.vue'),
    },
    {
      path: '/BeautyFilter',
      name: 'BeautyFilter',
      component: () => import('@/views/BeautyFilter.vue'),
    },
    {
      path: '/TakePhoto',
      name: 'TakePhoto',
      component: () => import('@/views/TakePhoto.vue'),
    },
    {
      path: '/EditPhotos',
      name: 'EditPhotos',
      component: () => import('@/views/EditPhotos.vue'),
    },
    {
      path:'/FilterSelect',
      name:'FilterSelect',
      component: () => import('@/views/FilterSelect.vue'),
    }
  ],
})

export default router

