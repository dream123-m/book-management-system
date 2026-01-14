import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons-vue'

//引入公共样式
import '@/assets/css/common.css'

const app = createApp(App)
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component)
}
app.use(router).use(ElementPlus).mount('#app')
