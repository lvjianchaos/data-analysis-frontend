<script lang="ts" setup>
import router from '@/router'
import { getUserInfo,logout } from '@/api/users'
import { useTokenStore } from '@/stores/token'

const userInfo = ref({
  username: 'Chaos',
  portrait: 'https://cdn.jsdelivr.net/gh/lvjianchaos/Images/test/%E7%86%8F.jpg'
})

getUserInfo().then(res => {
  userInfo.value.username = res.data.data.username
  // userInfo.value.portrait = res.data.data.portrait
})

const handleLogout = async () => {
  // 询问确认
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(()=>{
    ElMessage.info('取消退出操作')
    return new Promise(()=>{})
  })
  // 执行退出
  await logout().catch(()=>{
    ElMessage.error('退出登录失败')
    return new Promise(()=>{})
  })
  ElMessage.success('退出登录成功')
  // 清空token
  useTokenStore().clearToken()
  router.push({name: 'login'})
}

const drawer = ref(false)
</script>

<template>
  <el-aside class="app-aside">
    <!--侧边栏logo-->
    <img src="../../assets/logo.png" alt="logo" class="logo">
    <!--侧边栏用户信息-->
    <div class='avatar'>
      <el-popover
        :width="300"
        popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
        placement="right-start"
        >
        <template #reference>
          <div style="display: flex; gap: 10px; flex-direction: column;">
            <el-avatar
            :size="50"
            :src="userInfo.portrait" >
            </el-avatar>
          </div>
        </template>
        <template #default>
        <!--添加用户详情信息-->
          <div
            class="userinfo"
            style="display: flex; gap: 16px;flex-direction: column;"
          >
            <span>目前登陆账户</span>
            <el-card style="max-width: 480px;" shadow="hover">
              <div style="display: flex; align-items: center;">
                <el-avatar
                  :size="60"
                  :src="userInfo.portrait"
                  style="margin-right: 8px;"
                />
                <p style="font-size: large; font-weight: 600; padding-left: 10px;">{{ userInfo.username }}</p>
              </div>
            </el-card>

            <el-button type="danger" plain @click="handleLogout">登出</el-button>
          </div>
        </template>
      </el-popover>
    </div>
    <div class="history-record">
        <div class="history-record-btn" @click="drawer = true">
          <el-icon :size="30"><IEpClock /></el-icon>
          <el-text class="mx-1" type="info">历史记录</el-text>
        </div>

        <el-drawer v-model="drawer" title="历史记录">
          <span>TODO历史记录表格</span>
        </el-drawer>
    </div>

  </el-aside>
</template>

<style lang="scss" scoped>
.app-aside {
    background-color: rgb(252,251,249);
    box-shadow: 5px 0 5px -2px rgba(0, 0, 0, 0.3);
    width: 120px;
    align-items: center;
    flex-direction: column;
    display:flex;
  .logo {
    width:120px;
    padding-top: 10px;
  }
  .avatar {
    padding-top: 40px;
  }
  .history-record {
    align-items: center;
    justify-content: center;
    .history-record-btn {
      border: 10px solid rgb(244,235,223);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: rgb(244,235,223);
      .mx-1 {
        padding-top: 5px;
        font-size: small;
      }
    }

  }
}



</style>
