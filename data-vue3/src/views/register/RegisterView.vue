<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus/es/components/form/index.mjs'
import { register } from '@/api/users'
import router from '@/router'

const form = reactive({
  username: '',
  password: '',
  passwordConfirm: ''
})

const onSubmit = async() => {
  isResgistering.value = true
  // 表单校验
  await formRef.value?.validate().catch((err) => {
    ElMessage.error("表单校验失败...")
    isResgistering.value = false
    throw err
  })

  // 正式发送登陆请求
  const data = await register(form).then((res) => {
    if (res.data.code === 201) {
      // 注册成功
      ElMessage.success(res.data.message)
      // 跳转到登录页
      router.push('/login')
      return res.data
    } else {
      // 注册失败
      ElMessage.error(res.data.message)
      isResgistering.value = false
      throw new Error(res.data.message)
    }
  })

  console.log(data)

  isResgistering.value = false
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  passwordConfirm: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 定义石佛偶注册中
const isResgistering = ref(false)

const formRef = ref<FormInstance>()
</script>

<template>
  <div class="register">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="auto" style="max-width: 600px" label-position="top" size='large'>
      <h2>注册</h2>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" />
      </el-form-item>

      <el-form-item label="确认密码" prop="passwordConfirm">
        <el-input v-model="form.passwordConfirm" />
      </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">注册</el-button>
    </el-form-item>
  </el-form>
  </div>
</template>

<style lang="scss" scoped>
.register {
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
