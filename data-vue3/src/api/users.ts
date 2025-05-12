import request from '@/utils/request'

// 用户登录-参数类型
type LoginInfo = {
  username: string
  password: string
}

// 用户登录-返回类型
type LoginResult = {
  code: number
  message: string
  data: {
    access_token: string
    token_type: string
    refresh_token: string
  }
}

// 用户请求登录
export const login = (loginInfo: LoginInfo) => {
  return request<LoginResult>({
    method: 'post',
    url: 'api/auth/login',
    data: loginInfo,
  })
}

// 用户注册-参数类型
type RegisterInfo = {
  username: string
  password: string
}

// 用户注册-返回类型
type RegisterResult = {
  code: number
  message: string
  data: {
    id: number
    username: string
  }
}

// 用户注册
export const register = (registerInfo: RegisterInfo) => {
  return request<RegisterResult>({
    method: 'post',
    url: 'api/auth/register',
    data: registerInfo,
  })
}

type UserInfo = {
  code: number
  message: string
  data: {
    username: string
    name: string
  }
}

// 获取用户信息
export const getUserInfo = () => {
  return request<UserInfo>({
    method: 'get',
    url: 'api/account/get_info',
  })
}

// 用户退出
export const logout = () => {
  return request({
    method: 'post',
    url: 'api/auth/logout',
  })
}

// 刷新token
type RefreshToken = {
  code: number
  message: string
  data: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

let promiseRefreshToken: Promise<any>
let isRefreshing = false
export const refreshToken = () => {
  if (isRefreshing) return promiseRefreshToken
  isRefreshing = true
  promiseRefreshToken = request<RefreshToken>({
    method: 'post',
    url: 'api/auth/refresh',
    data: {
      refresh_token: localStorage.getItem('refresh_token'),
    },
  }).finally(() => {
    isRefreshing = false
  })
  return promiseRefreshToken
}
