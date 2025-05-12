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
