// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Mortgage',
        component: () => import('@/views/Mortgage.vue'),
      },
      {
        path: '/bincodes',
        name: 'BinCodes',
        component: () => import('@/views/BinCodes.vue'),
      },
      {
        path: '/autoloancalculator',
        name: 'AutoLoan',
        component: () => import('@/views/AutoLoanCalculator.vue'),
      },
      {
        path: '/mcccodes',
        name: 'MCCCodes',
        component: () => import('@/views/MCCCodes.vue'),
      },
      {
        path: '/erccalculator',
        name: 'ERCCalculator',
        component: () => import('@/views/ERCCalculator.vue'),
      },
      {
        path: '/federalincometax',
        name: 'FederalIncomeTax',
        component: () => import('@/views/FederalIncomeTax.vue'),
      },
      {
        path: '/creditcardprocessingfee',
        name: 'CreditCardProceesingFee',
        component: () => import('@/views/CreditCardProcessingFee.vue'),
      },
      {
        path: '/cdcalculator',
        name: 'CDCalculator',
        component: () => import('@/views/CDCalculator.vue'),
      },
      {
        path: '/simpleloancalculator',
        name: 'SimpleLoanCalculator',
        component: () => import('@/views/SimpleLoanCalculator.vue'),
      },
      {
        path: '/amortizationschedulecalculator',
        name: 'AmortizationScheudleCalculator',
        component: () => import('@/views/AmortizationScheduleCalculator.vue'),
      },
      {
        path: '/currencyconverter',
        name: 'CurrencyConverter',
        component: () => import('@/views/CurrencyConverter.vue'),
      },
      {
        path: '/inflationcalculator',
        name: 'InflationCalculator',
        component: () => import('@/views/InflationCalculator.vue'),
      },
      {
        path: '/savingscalculator',
        name: 'SavingsCalculator',
        component: () => import('@/views/SavingsCalculator.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
