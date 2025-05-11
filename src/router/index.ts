import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GridSelect from '@/views/GridSelect.vue'
import WaySelect from '@/views/WaySelect.vue'
import PaySelect from '@/views/PaySelect.vue'
import InputCoupon from '@/views/InputCoupon.vue'
import Pay from '@/views/Pay.vue'
import PhotoFrameSelect from '@/views/PhotoFrameSelect.vue'
import BeautyFilter from '@/views/BeautyFilter.vue'
import TakePhoto from '@/views/TakePhoto.vue'
import EditPhotos from '@/views/EditPhotos.vue'
import FilterSelect from '@/views/FilterSelect.vue'
import Paster from '@/views/Paster.vue'
import PrintAndGet from '@/views/PrintAndGet.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/GridSelect',
      name: 'GridSelect',
      component: GridSelect
    },
    {
      path: '/WaySelect',
      name: 'WaySelect',
      component: WaySelect
    },
    {
      path: '/PaySelect/:isAdd',
      name: 'PaySelect',
      component: PaySelect
    },
    {
      path: '/InputCoupon',
      name: 'InputCoupon',
      component: InputCoupon
    },
    {
      path: '/Pay/:isAdd',
      name: 'Pay',
      component: Pay
    },
    {
      path: '/PhotoFrameSelect',
      name: 'PhotoFrameSelect',
      component: PhotoFrameSelect
    },
    {
      path: '/BeautyFilter',
      name: 'BeautyFilter',
      component: BeautyFilter
    },
    {
      path: '/TakePhoto',
      name: 'TakePhoto',
      component: TakePhoto
    },
    {
      path: '/EditPhotos',
      name: 'EditPhotos',
      component: EditPhotos
    },
    {
      path: '/FilterSelect',
      name: 'FilterSelect',
      component: FilterSelect
    },
    {
      path: '/Paster',
      name: 'Paster',
      component: Paster
    },
    {
      path: '/PrintAndGet',
      name: 'PrintAndGet',
      component: PrintAndGet
    }
  ],
})

export default router

