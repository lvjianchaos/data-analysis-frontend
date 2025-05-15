<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fileUpload } from '@/api/file'
import { useRouter } from 'vue-router'

const uploadRef = ref()
const router = useRouter()

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function beforeUpload(file: File) {
  const isCsv = file.type === 'text/csv'
  const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')
  if (!isCsv && !isXlsx) {
    ElMessage.error('仅支持csv或xlsx文件上传')
    return false
  }
  return true
}

async function handleUpload({ file }: { file: File }) {
  const session_id = uuidv4()
  const name = file.name
  try {
    await fileUpload(file, session_id, name)
    ElMessage.success('上传成功')
    router.push({ name: 'data', params: { id: session_id } })
  } catch {
    ElMessage.error('上传失败')
  }
}
</script>

<template>
  <div class="upload-center">
    <el-upload
      ref="uploadRef"
      class="upload-btn"
      :show-file-list="false"
      :limit="1"
      :multiple="false"
      :before-upload="beforeUpload"
      :on-exceed="() => ElMessage.error('只能上传一个文件')"
      :http-request="handleUpload"
      accept=".csv,.xlsx"
    >
      <el-icon class="upload-icon"><IEpUpload /></el-icon>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.upload-center {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.upload-btn {
  position: relative;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 3px solid #409eff;
  box-shadow: 0 0 0 0 #409eff33;
  animation: breath 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: visible;
  transition: transform 0.2s;
  .el-upload {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &:hover {
    background: #e6f7ff;
    box-shadow: 0 0 60px 20px #409eff77, 0 0 0 0 #409eff44;
    transform: scale(1.12);
  }
  &:active {
    transform: scale(0.95);
  }
}
.upload-btn::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px dashed #409eff55;
  animation: wave 1.5s infinite linear;
  pointer-events: none;
  box-shadow: 0 0 40px 10px #409eff33;
}
@keyframes breath {
  0%   { box-shadow: 0 0 0 0 #409eff22; }
  40%  { box-shadow: 0 0 24px 8px #409eff33; }
  60%  { box-shadow: 0 0 32px 12px #409eff44; }
  100% { box-shadow: 0 0 0 0 #409eff22; }
}
@keyframes wave {
  0% { transform: translate(-50%, -50%) scale(1);}
  50% { transform: translate(-50%, -50%) scale(1.18);}
  100% { transform: translate(-50%, -50%) scale(1);}
}
.upload-icon {
  font-size: 44px;
  color: #409eff;
  filter: drop-shadow(0 0 8px #409eff88);
}
</style>
