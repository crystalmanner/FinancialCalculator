/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
// import {
//   VDataTable,
//   VDataTableServer,
//   VDataTableVirtual,
// } from "vuetify/labs/VDataTable";
// import { VDatePicker } from 'vuetify/lib/labs/components.mjs';
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  components: {
    // VDataTable,
    // VDataTableServer,
    // VDataTableVirtual,
    // VDatePicker,
  },
})
