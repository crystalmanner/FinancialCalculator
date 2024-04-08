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
        path: '/spousal-benefit-inflation-calculator',
        name: 'SpousalBenefitInflationCalculator',
        component: () => import('@/views/SpousalBenefitInflationCalculator.vue'),
      },
      {
        path: '/portfoliocalculator',
        name: 'PortfolioCalculator',
        component: () => import('@/views/PortfolioCalculator.vue'),
      },
      {
        path: '/expenseratiocalculator',
        name: 'ExpenseRatioCalculator',
        component: () => import('@/views/ExpenseRatio.vue'),
      },
      {
        path: '/social-security-break-even-calculator',
        name: 'SocialSecurityBreakEvenCalculator',
        component: () => import('@/views/SocialSecurityBreakEvenCalculator.vue'),
      },
      {
        path: '/test',
        name: 'Test',
        component: () => import('@/views/Test.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
