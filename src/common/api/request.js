// common/api/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const instance = axios.create({
  //  删除这行：baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 
instance.interceptors.request.use(
  (config) => {
    console.log(' 发送请求:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 
instance.interceptors.response.use(
  (response) => {
    const res = response.data
    console.log(' 接收响应:', res)
    
    // 后端返回 { code: 1, message: '成功', data: {...} }
    if (res.code === 1) {
      // 返回完整数据
      return res
    } else {
      // 失败
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请登录')
          break
        case 404:
          ElMessage.error(data.message || '请求的资源不存在')
          break
        case 409:
          ElMessage.error(data.message || '数据冲突')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '未知错误')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查服务器是否运行')
    } else {
      ElMessage.error('请求配置错误: ' + error.message)
    }
    
    return Promise.reject(error)
  }
)

export default instance