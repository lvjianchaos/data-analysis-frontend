import { defineStore } from 'pinia'

interface Token {
  access_token: string | null
  token_type: string | null
  refresh_token: string | null
}

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const useTokenStore = defineStore('token', () => {
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY) || null)
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY) || null)

  const getAccessToken = computed(() => accessToken.value)
  const getRefreshToken = computed(() => refreshToken.value)
  const isLoggedIn = computed(() => !!accessToken.value) // 检查是否已登录

  function setToken(data: Token) {
    accessToken.value = data.access_token || null
    refreshToken.value = data.refresh_token || null

    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }

    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }

  function clearToken() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  return { getAccessToken, getRefreshToken, isLoggedIn, clearToken, setToken }
})
