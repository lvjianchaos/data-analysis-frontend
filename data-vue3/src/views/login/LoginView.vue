<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus/es/components/form/index.mjs'
import { login } from '@/api/users'
import {useTokenStore} from '@/stores/token'

const router = useRouter()
const store = useTokenStore()

const form = reactive({
  username: '',
  password: '',
})

const onSubmit = async() => {
  isLogining.value = true
  // 表单校验
  await formRef.value?.validate().catch((err) => {
    ElMessage.error("表单校验失败...")
    isLogining.value = false
    throw err
  })

  // 正式发送登陆请求
  const data = await login(form).then((res) => {
    if (res.data.code === 200) {
      return res.data
    } else {
      // 登录失败
      ElMessage.error(res.data.message)
      isLogining.value = false
      throw new Error(res.data.message)
    }
  })

  console.log(data)

  // 保存token
  store.setToken(data.data)

  isLogining.value = false

  ElMessage.success(data.message)

  router.push('/')

}

// 定义表单校验规则
const rules = reactive<FormRules>({
  username: [
    {
      required: true,
      message: "用户名不能为空",
      trigger: ['change']
    },
    {
      min: 3,
      max: 10,
      message: "长度需为3-10位",
      trigger: ['blur']
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "只允许字母、数字和下划线",
      trigger: ['blur']
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空",
      trigger: "change"
    },
    {
      min: 6,
      max: 18,
      message: "长度需为6-18位",
      trigger: ['blur']
    },
  ]
});

// 定义是否登录中
const isLogining = ref(false)

const formRef = ref<FormInstance>()
</script>

<template>
  <div class="login">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="auto" style="max-width: 600px" label-position="top" size='large'>
      <h2>登录</h2>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit" :loading="isLogining">登录</el-button>
    </el-form-item>
  </el-form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .el-form {
    width: 300px;
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;

    .el-form-item {
      margin-top: 20px;
    }

    .el-button {
      width: 100%;
      margin-top: 30px;
    }
  }
}
</style>
