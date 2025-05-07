<script lang="ts" setup>
import AppAside from './AppAside.vue'
import AppMainLeft from './AppMainLeft.vue'

</script>

<template>
  <div class="common-layout">
    <el-container>
      <AppAside />
      <el-container>
        <el-header class="app-header">Header</el-header>
        <el-container>
          <AppMainLeft />
          <el-main>Main</el-main>
        </el-container>
        <el-footer class="app-footer">Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>


<style lang="scss" scoped>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;

}
.el-footer {
  height: 50px;
  background-color: #111;
  color: #eee;
}
.el-header {
  height: 25px;
  background-color: #fff;
  color: #000;
}

</style>
