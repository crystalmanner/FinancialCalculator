/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import helper from './helper'
// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
app.use(helper);

registerPlugins(app)

app.mount('#app')
