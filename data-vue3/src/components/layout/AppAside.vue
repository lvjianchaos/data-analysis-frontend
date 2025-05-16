<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import router from '@/router'
import { getUserInfo } from '@/api/users'
import {type SessionInfo, updateSessionName,getSessions,deleteSession } from '@/api/sessions'
import { useTokenStore } from '@/stores/token'
import { useRoute } from 'vue-router'

const route = useRoute()
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
  // // 执行退出
  // await logout().catch(()=>{
  //   ElMessage.error('退出登录失败')
  //   return new Promise(()=>{})
  // })
  ElMessage.success('退出登录成功')
  // 清空token
  useTokenStore().clearToken()
  router.push({name: 'login'})
}

const isCollapse = ref(true)

const COLLAPSE_WIDTH = 900 // 阈值，可根据需要调整

function handleResize() {
  isCollapse.value = window.innerWidth < COLLAPSE_WIDTH
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const datasetList = ref<SessionInfo[]>([])

getSessions().then(res => {
  datasetList.value = res.data.data
})

const activeSessionId = ref<string>('')

// 监听路由参数 id 的变化
watch(
  () => route.params.id,
  (newId) => {
    if (typeof newId === 'string') {
      activeSessionId.value = newId
    } else {
      activeSessionId.value = ''
    }
  },
  { immediate: true }
)

function goToDataset(id: string) {
  activeSessionId.value = id
  router.push({ name: 'data', params: { id } })
}

const handleRecordCommand = (command: string, item: any) => {
  if (command === 'rename') {
    ElMessageBox.prompt('请输入新的名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.name,
      inputValidator: (value) => {
        if (!value) {
          return '名称不能为空'
        }
        return true
      }
    }).then(async ({ value: newName }) => {
      // 这里应该调用后端 API 更新名称
      await updateSessionName(item.session_id, newName)
      ElMessage.success('重命名成功')
      // 更新本地数据
      const index = datasetList.value.findIndex(d => d.session_id === item.session_id)
      if (index !== -1) {
        datasetList.value[index].name = newName
      }
    }).catch((error) => {
      if (error !== 'cancel') {
        ElMessage.error('重命名失败')
      }
    })
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除这条记录吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      // 这里应该调用后端 API 删除记录
      await deleteSession(item.session_id)
      ElMessage.success('删除成功')
      // 更新本地数据
      datasetList.value = datasetList.value.filter(d => d.session_id !== item.session_id)
    }).catch((error) => {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    })
  }
}
</script>

<template>
  <el-aside :width="isCollapse ? '68px' : '260px'">
    <div class="aside-content">
      <div class="logo-container" :class="{ collapsed: isCollapse }">
        <router-link to="/" class="logo">
          <img v-if="isCollapse" src="@/assets/logo.png" alt="logo" class="logo-img"/>
          <img v-else src="@/assets/logo-text.png" alt="logo" class="logo-text"/>
        </router-link>
        <el-button text @click="isCollapse = !isCollapse" round class="expand-btn">
            <el-icon v-if="isCollapse" :size="25">
              <IEpExpand />
            </el-icon>
            <el-icon v-else :size="25">
              <IEpFold />
            </el-icon>
        </el-button>
      </div>
      <el-tooltip
          class="box-item"
          effect="dark"
          content="上传数据文件"
          placement="right-end"
        >
        <el-button
          plain
          :style="isCollapse
            ? 'width:44px;height:44px;margin-left:12px;display:flex;align-items:center;justify-content:center;padding:0;'
            : 'width:131px;height:44px;margin-left:20px;display:flex;align-items:center;justify-content:center;'"
          @click="()=>{
            activeSessionId = ''
            router.push({name: 'index'})
          }"
        >
          <el-icon :size="20">
            <IEpUpload />
          </el-icon>
          <span v-if="!isCollapse" style="font-size:medium;font-weight:700;margin-left:8px;">新建数据集</span>
        </el-button>
      </el-tooltip>

      <el-scrollbar
        v-if="!isCollapse"
        height="400px"
        class="dataset-scrollbar"
      >
        <div
          v-for="item in datasetList"
          :key="item.session_id"
          class="dataset-item"
          :class="{ 'is-active': item.session_id === activeSessionId }"
          @click="goToDataset(item.session_id)"
          style="position: relative;"
        >
          <el-icon style="margin-right:8px;"><IEpDocument /></el-icon>
          <span v-if="!isCollapse" class="dataset-title" :title="item.name">{{ item.name }}</span>
          <el-dropdown
            v-if="!isCollapse"
            @command="(command:any) => handleRecordCommand(command, item)"
            trigger="click"
            class="record-dropdown"
          >
            <span class="more-btn" @click.stop>
              <el-icon><IEpMoreFilled /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">
                  <el-icon style="margin-right:4px;"><IEpEdit /></el-icon>
                  重命名
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon style="margin-right:4px;color:#f56c6c;"><IEpDelete /></el-icon>
                  <span style="color:#f56c6c;">删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-scrollbar>
    </div>
    <div class="user-info-popover-wrapper">
      <el-popover
        :width="300"
        popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
        placement="right-end"
      >
        <template #reference>
          <el-button
            plain
            :style="isCollapse
              ? 'width:44px;height:44px;margin-left:3px;display:flex;align-items:center;justify-content:center;padding:0;'
              : 'width:240px;height:44px;margin-left:3px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;'"
          >
            <el-avatar :src="userInfo.portrait" />
            <span v-if="!isCollapse" style="font-size:medium;font-weight:700;margin-left:8px;">个人信息</span>
          </el-button>
        </template>
        <template #default>
          <el-card
            shadow="hover"
            class="user-card-content"
          >
            <div style="display: flex; align-items: center;">
              <el-avatar :size="70" :src="userInfo.portrait" />
              <span style="margin-left: 25px;" class="user-card-name">{{ userInfo.username }}</span>
            </div>
          </el-card>
          <el-button type="danger" plain @click="handleLogout" style="width: 258px;">退出登录</el-button>
        </template>
      </el-popover>
    </div>
  </el-aside>
</template>

<style lang="scss" scoped>
.el-aside {
  background-color: #f9fbff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  height: 100vh;
  .aside-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .user-info-popover-wrapper {
    flex-shrink: 0;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  .logo-container {
    display: flex;
    align-items: center;
    transition: flex-direction 0.3s;
    padding-bottom: 30px;
    &.collapsed {
      flex-direction: column;
      align-items: flex-start;
      .expand-btn {
        margin: 30px 0 0 7px;
      }
    }
    &:not(.collapsed) {
      flex-direction: row;
      .expand-btn {
        margin-left: auto;
        margin-right: 10px;
        margin-top: 30px;
      }
    }
    .logo {
      img {
        padding-top: 20px;
        padding-left: 10px;
      }
      .logo-img {
          width: 50px;
        }
      .logo-text {
        width: 130px;
      }
    }
  }
  .el-scrollbar {
    margin-top:20px;
  }
}

.dataset-scrollbar {
  margin-top: 20px;
  flex: 1;
}
.dataset-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 15px;

  &.is-active {
    background: #ecf5ff;
    color: #409eff;

    .el-icon {
      color: #409eff;
    }
  }
}
.dataset-item:hover {
  background: #f0f4fa;

  &.is-active {
    background: #ecf5ff;
  }
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: background 0.2s;
  cursor: pointer;
  margin-left: auto;
}
.more-btn:hover {
  background: #f0f0f0;
}
.record-dropdown {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.dataset-title {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}

.user-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  min-height: 48px;
  box-shadow: none;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  margin-bottom: 10px;
}

.user-card-name {
  font-size: 23px;
  font-weight: 900;
  color: #333;
}
</style>
