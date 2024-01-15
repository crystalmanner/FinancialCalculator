// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'FeeCalculator',
        component: () => import('@/views/FeeCalculator.vue'),
      },
      {
        path: '/spousalbenefitcalculator',
        name: 'SpousalBenefitCalculator',
        component: () => import('@/views/SpousalBenefitCalculator.vue'),
      },
      {
        path: '/portfoliocalculator',
        name: 'PortfolioCalculator',
        component: () => import('@/views/PortfolioCalculator.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
