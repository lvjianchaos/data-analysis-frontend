<template>
  <el-upload
    action=""
    :auto-upload="false"
    :on-change="handleFileChange"
    accept=".xlsx,.csv"
  >
    <el-button type="primary">上传表格文件</el-button>
  </el-upload>
  <vue-office-excel
    v-if="fileUrl"
    :src="fileUrl"
    @rendered="renderedHandler"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VueOfficeExcel from '@vue-office/excel';

const fileUrl = ref('');

const handleFileChange = (file) => {
  fileUrl.value = URL.createObjectURL(file.raw);
};
</script>