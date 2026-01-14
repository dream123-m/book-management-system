// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 导入 path 模块
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 配置 '@' 指向 'src' 目录
      '@': resolve(__dirname, 'src')
    }
  }
})