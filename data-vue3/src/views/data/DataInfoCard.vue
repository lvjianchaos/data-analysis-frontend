<script lang="ts" setup>
defineProps<{ info: any }>()
</script>
<template>
  <el-card>
    <h2>数据集名称：{{ info.name }}</h2>
    <div>Session ID: {{ info.session_id }}</div>
    <div>上传时间: {{ info.timestamp }}</div>
    <!-- 其他信息 -->
  </el-card>
</template>
