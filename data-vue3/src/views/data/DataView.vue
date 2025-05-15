<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getSessions } from '@/api/sessions'
import { fileClean, filePreview, fileDownload } from '@/api/file'
import { analyzePredict } from '@/api/analyze'
import * as echarts from 'echarts'

const route = useRoute()
const sessionId = ref(route.params.id as string)
const sessionInfo = ref<any>(null)
const loading = ref(true)
const error = ref('')
const cleanStrategy = ref<'ignore'|'mid'|'left'|'right'>('ignore')
const isCleaned = ref(false)
const previewData = ref<any[][]>([])
const chartType = ref<'line'|'bar'|'pie'>('line')
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<any>(null)
const predictAlgorithm = ref<0|1|2|3>(0)
const predictResult = ref<any>(null)

async function fetchSessionInfo(id: string) {
  try {
    loading.value = true
    error.value = ''
    const res = await getSessions()
    sessionInfo.value = res.data.data.find((item: any) => item.session_id === id)
    if (!sessionInfo.value) error.value = '未找到该数据集'
  } catch (e) {
    error.value = '加载失败'
  } finally {
    loading.value = false
  }
}

async function handleClean() {
  try {
    loading.value = true
    await fileClean(sessionId.value, cleanStrategy.value)
    isCleaned.value = true
    await handlePreview()
  } catch {
    error.value = '清洗失败'
  } finally {
    loading.value = false
  }
}

async function handlePreview() {
  try {
    loading.value = true
    const res = await filePreview(sessionId.value)
    // res.data.data: [header, data]
    previewData.value = res.data.data
    await nextTick()
    renderChart()
  } catch {
    error.value = '预览失败'
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartRef.value || !previewData.value.length) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }
  const [header, data] = previewData.value
  const xData = data.map((row: any) => row[0])
  const seriesData1 = data.map((row: any) => row[1])
  const seriesData2 = data.map((row: any) => row[2])
  const seriesData3 = data.map((row: any) => row[3])
  let option: any = {}
  if (chartType.value === 'line') {
    option = {
      tooltip: { trigger: 'axis' },
      legend: { data: header.slice(1) },
      xAxis: { type: 'category', data: xData },
      yAxis: { type: 'value' },
      series: [
        { name: header[1], type: 'line', data: seriesData1 },
        { name: header[2], type: 'line', data: seriesData2 },
        { name: header[3], type: 'line', data: seriesData3 },
      ]
    }
  } else if (chartType.value === 'bar') {
    option = {
      tooltip: { trigger: 'axis' },
      legend: { data: header.slice(1) },
      xAxis: { type: 'category', data: xData },
      yAxis: { type: 'value' },
      series: [
        { name: header[1], type: 'bar', data: seriesData1 },
        { name: header[2], type: 'bar', data: seriesData2 },
        { name: header[3], type: 'bar', data: seriesData3 },
      ]
    }
  } else if (chartType.value === 'pie') {
    // 以最后一行数据为例
    const lastRow = data[data.length - 1]
    option = {
      tooltip: { trigger: 'item' },
      legend: { },
      series: [
        {
          name: '销量',
          type: 'pie',
          radius: '60%',
          data: [
            { value: lastRow[1], name: header[1] },
            { value: lastRow[2], name: header[2] },
            { value: lastRow[3], name: header[3] },
          ]
        }
      ]
    }
  }
  chartInstance.value.setOption(option)
}

watch(chartType, () => {
  renderChart()
})

async function handleDownload() {
  try {
    const res = await fileDownload(sessionId.value)
    // 假设后端返回的是文件流
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cleaned_${sessionId.value}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch {
    error.value = '下载失败'
  }
}

async function handlePredict() {
  try {
    loading.value = true
    const res = await analyzePredict(sessionId.value, predictAlgorithm.value)
    predictResult.value = res.data
  } catch {
    error.value = '预测失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSessionInfo(sessionId.value)
})

watch(
  () => route.params.id,
  (newId) => {
    if (typeof newId === 'string') {
      sessionId.value = newId
      fetchSessionInfo(newId)
      isCleaned.value = false
      previewData.value = []
      predictResult.value = null
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }
    }
  }
)
</script>

<template>
  <div class="data-view">
    <!-- 清洗区 -->
    <div class="clean-section">
      <el-select v-model="cleanStrategy" placeholder="选择清洗策略" style="width: 180px;">
        <el-option label="忽略空白行" value="ignore" />
        <el-option label="空白=上下月均值" value="mid" />
        <el-option label="空白=上月" value="left" />
        <el-option label="空白=下月" value="right" />
      </el-select>
      <el-button type="primary" @click="handleClean" :loading="loading">清洗</el-button>
    </div>
    <!-- 预览区 -->
    <div v-if="isCleaned" class="preview-section">
      <el-radio-group v-model="chartType" style="margin-bottom: 12px;">
        <el-radio-button label="line">折线图</el-radio-button>
        <el-radio-button label="bar">柱状图</el-radio-button>
        <el-radio-button label="pie">饼状图</el-radio-button>
      </el-radio-group>
      <div ref="chartRef" style="width: 100%; height: 400px; background: #fff;"></div>
      <el-button @click="handleDownload" style="margin-top: 12px;">下载清洗后文件</el-button>
    </div>
    <!-- 预测区 -->
    <div v-if="isCleaned" class="predict-section">
      <el-select v-model="predictAlgorithm" placeholder="选择预测算法" style="width: 180px;">
        <el-option label="线性回归" :value="0" />
        <el-option label="三次样条" :value="1" />
        <el-option label="傅里叶拟合" :value="2" />
        <el-option label="拉格朗日插值" :value="3" />
      </el-select>
      <el-button type="success" @click="handlePredict" :loading="loading">预测</el-button>
      <div v-if="predictResult" class="predict-result">预测结果：{{ predictResult }}</div>
    </div>
    <el-card v-if="loading" class="loading-card">加载中...</el-card>
    <el-card v-else-if="error" class="error-card">{{ error }}</el-card>
  </div>
</template>

<style scoped>
.data-view {
  max-width: 900px;
  margin: 32px auto;
  padding: 16px;
}
.clean-section, .preview-section, .predict-section {
  margin: 24px 0 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
.preview-section {
  flex-direction: column;
  align-items: flex-start;
}
.predict-section {
  flex-direction: row;
  align-items: center;
}
.loading-card, .error-card {
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 32px;
}
.predict-result {
  margin-left: 16px;
  color: #409eff;
  font-weight: bold;
}
</style>
