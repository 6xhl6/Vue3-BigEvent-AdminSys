import axios from 'axios'
import { useUserStore } from '@/stores/user.js'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = 'https://big-event-vue-api-t.itheima.net'

const instance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
})

instance.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      // 确保 token 带有 Bearer 前缀
      config.headers.Authorization = userStore.token.startsWith('Bearer ')
        ? userStore.token
        : `Bearer ${userStore.token}`
      return config
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
instance.interceptors.response.use(
  response => {
    // 业务返回成功
    if (response.data.code === 0) {
      return response
    }
    // 处理业务失败
    ElMessage.error(response.data.message || '服务异常')
    return Promise.reject(response.data)
  },
  error => {
    // 网络错误或 CORS 错误（无 response）
    if (!error.response) {
      ElMessage.error(error.message || '网络异常，请检查网络')
      return Promise.reject(error)
    }
    // 401情况
    if (error.response.status === 401) {
      ElMessage.error('登录过期，请重新登录')
      router.push('/login')
      return Promise.reject(error)
    }
    // 错误默认情况
    ElMessage.error(error.response.data?.message || '服务异常')
    return Promise.reject(error)
  }
)
export default instance
export { baseURL }