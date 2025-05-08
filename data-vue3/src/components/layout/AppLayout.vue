<script lang="ts" setup>
import AppAside from './AppAside.vue'
import AppMainLeft from './AppMainLeft.vue'

</script>

<template>
  <div class="common-layout">
    <el-container>
      <AppAside />
      <el-container>
        <el-header class="app-header"> </el-header>
        <el-container>
          <AppMainLeft />
          <el-main>Main</el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>


<style lang="scss" scoped>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgb(252,251,249);
}
.el-footer {
  height: 50px;
  color: #6C6E72;
}
.el-header {
  height: 25px;
  color: #000;
}

</style>
