import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
// 获取环境变量，Vite 会自动替换这里的值
const base = import.meta.env.VITE_BASE_URL || '/'
const router = createRouter({
  history: createWebHistory(base),
  routes: [
	{
		path: '/',
		redirect: '/home',
	  },
    {
      path: '/home',
      name: 'Home',
      component: Home,
    },
	{
	  path: '/bookshelf',
	  name: 'Bookshelf',
	  component: () => import('../views/Bookshelf.vue'),
	},{
	  path: '/about',
	  name: 'About',
	  component: () => import('../views/About.vue'),
	}
  ],
  
})
export default router