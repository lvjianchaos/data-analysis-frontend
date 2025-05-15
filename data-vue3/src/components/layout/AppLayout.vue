<script lang="ts" setup>
import AppAside from './AppAside.vue';
</script>

<template>
  <div class="common-layout">
    <el-container>
      <AppAside />
      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;

  .el-container {
    height: 100%;

    .el-main {
      background-color: #fff;
      color: #333;
      text-align: center;
      line-height: 160px;
    }
  }
}
</style>
