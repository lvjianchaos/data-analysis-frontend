<script lang="ts" setup>
import router from '@/router'


const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
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
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" >
            </el-avatar>
            <span style="font-weight: 800;">Chaos</span>
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
                  src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                  style="margin-right: 8px;"
                />
                <p style="font-size: large; font-weight: 600; padding-left: 10px;">Chaos</p>
              </div>
            </el-card>

            <el-button type="danger" plain @click="logout">登出</el-button>
          </div>
        </template>
      </el-popover>
      <div class="history-record" style="bottom: 200px;position: absolute;">
        <div style="border: 10px solid rgb(244,235,223);
  border-radius: 10px; display: flex;;flex-direction: column;justify-content: center;align-items: center;background-color: rgb(244,235,223);" @click="drawer = true">
          <el-icon :size="30"><IEpClock /></el-icon>
          <el-text class="mx-1" type="info" style="padding-top: 5px;font-size: small;">历史记录</el-text>
        </div>

        <el-drawer v-model="drawer" title="历史记录">
          <span>Hi there!</span>
        </el-drawer>
      </div>
    </div>
  </el-aside>
</template>

<style lang="scss" scoped>
.app-aside {
  background-color: rgb(252,251,249);
  box-shadow: 5px 0 5px -2px rgba(0, 0, 0, 0.3);
  width: 120px;
}
.logo {
  width:120px;
  padding-top: 10px;
}

.avatar {
  display:flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
}
</style>
