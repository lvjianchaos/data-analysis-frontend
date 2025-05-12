import { refreshToken } from '@/api/users'
import router from '@/router'
import { useTokenStore } from '@/stores/token'
import axios, { type AxiosRequestHeaders } from 'axios'

const request = axios.create({
  // baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders
  }
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token')
  return config
})

request.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response.status === 401) {
      const { data } = await refreshToken()
      if (data.code === 200) {
        useTokenStore().setToken(data.data)
        return request(error.config)
      } else {
        ElMessage.error('登录过期，请重新登录')
        useTokenStore().clearToken()
        router.push({ name: 'login' })
        return
      }
    }
    return Promise.reject(error)
  },
)

export default request
