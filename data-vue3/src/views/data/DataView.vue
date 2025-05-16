<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getSessions } from '@/api/sessions'
import { fileClean, filePreview, fileDownload } from '@/api/file'
import { analyzePredict } from '@/api/analyze'
import type { SessionInfo } from '@/api/sessions'

// mock session 列表
const mockSessions = [
  { session_id: '1', name: '销售数据.csv', created_at: '2024-06-01' },
  { session_id: '2', name: '气温数据.xlsx', created_at: '2024-06-02' },
]

// mock 原始文件内容，结构与后端API一致
const mockRawData: Record<string, [string[], any[][]]> = {
  '1': [
    ["日期", "油车销量（万辆）", "电车销量（万辆）", "混动车销量（万辆）"],
    [
      ["2024 2", 96.6, 27.0, 18.0],
      ["2024 3", 158.1, 52.9, 35.4],
      ["2024 4", 120.0, 40.0, 25.0],
      ["2024 5", 180.0, 60.0, 45.0]
    ]
  ],
  '2': [
    ["日期", "最高气温", "最低气温", "平均气温"],
    [
      ["6/1", 32, 22, 27],
      ["6/2", 33, 23, 28],
      ["6/3", 34, 24, 29],
      ["6/4", 35, 25, 30],
      ["6/5", 36, 26, 31]
    ]
  ]
}

// mock 清洗函数，返回与API一致格式
function mockClean(data: [string[], number[][]], strategy: string): [string[], number[][]] {
  const header = data[0]
  const rows = data[1].map(row => [...row])
  for (let col = 1; col < header.length; col++) {
    const nums = rows.map(r => Number(r[col]) || 0).filter(n => n !== 0)
    const avg = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i][col] && rows[i][col] !== 0) {
        if (strategy === 'ignore') rows[i][col] = 0
        else if (strategy === 'mid') rows[i][col] = avg
        else if (strategy === 'left') rows[i][col] = rows[i - 1]?.[col] ?? 0
        else if (strategy === 'right') rows[i][col] = rows[i + 1]?.[col] ?? 0
      }
    }
  }
  return [header, rows]
}

// mock 预测响应
interface PredictResponse {
  code: number
  message: string
  data: {
    gas_sale_next: number
    ev_sale_next: number
    mix_sale_next: number
  }
}

// mock 预测
function mockPredict(session_id: string, algorithm: string): PredictResponse {
  const mockResponses: Record<string, PredictResponse> = {
    '0': {
      code: 200,
      message: "预测成功!",
      data: {
        gas_sale_next: 123.4567,
        ev_sale_next: 78.9012,
        mix_sale_next: 45.6789
      }
    },
    '1': {
      code: 200,
      message: "预测成功!",
      data: {
        gas_sale_next: 130.1234,
        ev_sale_next: 82.3456,
        mix_sale_next: 48.9012
      }
    },
    '2': {
      code: 200,
      message: "预测成功!",
      data: {
        gas_sale_next: 128.7890,
        ev_sale_next: 80.5678,
        mix_sale_next: 47.3456
      }
    },
    '3': {
      code: 200,
      message: "预测成功!",
      data: {
        gas_sale_next: 125.6789,
        ev_sale_next: 79.2345,
        mix_sale_next: 46.7890
      }
    }
  }
  return mockResponses[algorithm] || {
    code: 400,
    message: "预测失败",
    data: {
      gas_sale_next: 0,
      ev_sale_next: 0,
      mix_sale_next: 0
    }
  }
}

const route = useRoute()
const sessionId = ref(route.params.id as string)
const sessionInfo = ref<{ session_id: string; name: string; created_at: string } | null>(null)
const cleanStrategy = ref<'ignore'|'mid'|'left'|'right'>('ignore')
const isCleaned = ref(false)
const previewData = ref<[string[], number[][]] | null>(null)
const chartType = ref<'line'|'bar'|'pie'>('line')
const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
const predictAlgorithm = ref<'0'|'1'|'2'|'3'>('0')
const predictResult = ref<PredictResponse | null>(null)
const predictChartRef = ref<HTMLElement | null>(null)
const predictChartInstance = ref<echarts.ECharts | null>(null)
const cleanLoading = ref(false)
const predictLoading = ref(false)
const error = ref('')
const loading = ref(false)

// mock 获取 session
async function fetchSessionInfo(id: string) {
  try {
    const res = await getSessions()
    // 确保 res.data 是数组
    if (Array.isArray(res.data)) {
      const found = res.data.find((item: SessionInfo) => item.session_id === id)
      if (!found) {
        error.value = '未找到该数据集'
        sessionInfo.value = null
      } else {
        sessionInfo.value = found
      }
    } else {
      error.value = '数据格式错误'
      sessionInfo.value = null
    }
  } catch (e) {
    error.value = '获取数据集信息失败'
    sessionInfo.value = null
  }
}

// mock 清洗
async function handleClean() {
  cleanLoading.value = true
  error.value = ''
  try {
    await fileClean(sessionId.value, cleanStrategy.value)
    // 清洗后预览
    const res = await filePreview(sessionId.value)
    // 假设后端返回 { code, data: [header, rows] }
    if (res.data.code === 200) {
      previewData.value = res.data
      isCleaned.value = true
      await nextTick()
      renderChart()
      ElMessage.success('数据清洗完成')
      await handlePredict()
    } else {
      error.value = res.data.message || '数据清洗失败'
    }
  } catch (e) {
    error.value = '数据清洗失败'
  }
  cleanLoading.value = false
}

// mock 下载
async function handleDownload() {
  try {
    const res = await fileDownload(sessionId.value)
    if (res.data.code === 200) {
      // 创建一个隐藏的 a 标签来下载文件
      const a = document.createElement('a')
      a.href = res.data.data // 使用返回的 URL
      a.download = `cleaned_${sessionId.value}.xlsx` // 根据实际文件类型修改扩展名
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      ElMessage.success(res.data.message)
    } else {
      ElMessage.error(res.data.message || '文件下载失败')
    }
  } catch (e) {
    ElMessage.error('文件下载失败')
  }
}

// mock 预测
async function handlePredict() {
  predictLoading.value = true
  error.value = ''
  try {
    const res = await analyzePredict(sessionId.value, predictAlgorithm.value)
    predictResult.value = res.data
    await nextTick()
    renderPredictChart()
    if (res.data.code === 200) {
      ElMessage.success(res.data.message)
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (e) {
    ElMessage.error('预测失败')
  }
  predictLoading.value = false
}

// 渲染数据预览图表
function renderChart() {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  if (!chartRef.value || !previewData.value) return
  const [header, rows] = previewData.value
  chartInstance.value = echarts.init(chartRef.value)
  const xData = rows.map(row => row[0])
  const seriesData1 = rows.map(row => row[1])
  const seriesData2 = rows.map(row => row[2])
  const seriesData3 = rows.map(row => row[3])
  let option: echarts.EChartsOption = {}
  if (chartType.value === 'line') {
    option = {
      title: {
        text: '数据预览',
        left: 'center'
      },
      tooltip: { trigger: 'axis' },
      legend: { data: header.slice(1), top: 30 },
      grid: {
        top: 80,
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: { type: 'category', data: xData },
      yAxis: { type: 'value' },
      series: [
        { name: header[1], type: 'line', data: seriesData1, smooth: true },
        { name: header[2], type: 'line', data: seriesData2, smooth: true },
        { name: header[3], type: 'line', data: seriesData3, smooth: true },
      ]
    }
  } else if (chartType.value === 'bar') {
    option = {
      title: {
        text: '数据预览',
        left: 'center'
      },
      tooltip: { trigger: 'axis' },
      legend: { data: header.slice(1), top: 30 },
      grid: {
        top: 80,
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: { type: 'category', data: xData },
      yAxis: { type: 'value' },
      series: [
        { name: header[1], type: 'bar', data: seriesData1 },
        { name: header[2], type: 'bar', data: seriesData2 },
        { name: header[3], type: 'bar', data: seriesData3 },
      ]
    }
  } else if (chartType.value === 'pie') {
    const lastRow = rows[rows.length - 1]
    option = {
      title: {
        text: '数据预览',
        left: 'center'
      },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 30
      },
      series: [
        {
          name: '占比',
          type: 'pie',
          radius: '50%',
          data: [
            { value: lastRow[1], name: header[1] },
            { value: lastRow[2], name: header[2] },
            { value: lastRow[3], name: header[3] },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }
  chartInstance.value.setOption(option)
}

// 渲染预测结果图表
function renderPredictChart() {
  if (predictChartInstance.value) {
    predictChartInstance.value.dispose()
    predictChartInstance.value = null
  }
  if (!predictChartRef.value || !predictResult.value) return
  predictChartInstance.value = echarts.init(predictChartRef.value)
  const { data } = predictResult.value
  const option: echarts.EChartsOption = {
    title: {
      text: '预测结果',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: 80,
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['油车销量（万辆）', '电车销量（万辆）', '混动车销量（万辆）']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '预测值',
        type: 'bar',
        data: [
          { value: data.gas_sale_next, itemStyle: { color: '#91cc75' } },
          { value: data.ev_sale_next, itemStyle: { color: '#5470c6' } },
          { value: data.mix_sale_next, itemStyle: { color: '#fac858' } }
        ],
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }
  predictChartInstance.value.setOption(option)
}

watch(chartType, () => {
  renderChart()
})

watch(predictAlgorithm, () => {
  handlePredict()
})

onMounted(async () => {
  fetchSessionInfo(sessionId.value)
  isCleaned.value = false
  previewData.value = null
  predictResult.value = null
  if (mockRawData[sessionId.value]) {
    await handleClean()
    // handleClean会自动调用handlePredict和渲染
  }
})

watch(
  () => route.params.id,
  async (newId) => {
    if (typeof newId === 'string') {
      sessionId.value = newId
      fetchSessionInfo(newId)
      isCleaned.value = false
      previewData.value = null
      predictResult.value = null
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }
      if (predictChartInstance.value) {
        predictChartInstance.value.dispose()
        predictChartInstance.value = null
      }
      if (mockRawData[newId]) {
        await handleClean()
      }
    }
  }
)
</script>

<template>
  <div class="data-view">
    <el-card v-if="loading" class="loading-card">
      <el-skeleton :rows="3" animated />
    </el-card>
    <el-card v-else-if="error" class="error-card">
      <el-result icon="error" :title="error" />
    </el-card>
    <template v-else>
      <!-- 数据清洗部分 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>数据清洗</span>
          </div>
        </template>
        <div class="clean-section">
          <el-radio-group v-model="cleanStrategy" size="large">
            <el-radio-button label="ignore">忽略空白行</el-radio-button>
            <el-radio-button label="mid">空白=上下月均值</el-radio-button>
            <el-radio-button label="left">空白=上月</el-radio-button>
            <el-radio-button label="right">空白=下月</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleClean" :loading="loading">
            <el-icon><Refresh /></el-icon>重新清洗
          </el-button>
        </div>
      </el-card>

      <!-- 数据预览部分 -->
      <el-card v-if="isCleaned" class="section-card">
        <template #header>
          <div class="card-header">
            <span>数据预览</span>
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button label="line">折线图</el-radio-button>
              <el-radio-button label="bar">柱状图</el-radio-button>
              <el-radio-button label="pie">饼状图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>

      <!-- 下载部分 -->
      <el-card v-if="isCleaned" class="section-card">
        <template #header>
          <div class="card-header">
            <span>下载清洗后文件</span>
          </div>
        </template>
        <div class="download-section">
          <el-button type="success" @click="handleDownload">
            <el-icon><Download /></el-icon>下载CSV文件
          </el-button>
        </div>
      </el-card>

      <!-- 预测分析部分 -->
      <el-card v-if="isCleaned" class="section-card">
        <template #header>
          <div class="card-header">
            <span>预测分析</span>
          </div>
        </template>
        <div class="predict-section">
          <el-radio-group v-model="predictAlgorithm" size="large">
            <el-radio-button label="0">线性回归</el-radio-button>
            <el-radio-button label="1">三次样条</el-radio-button>
            <el-radio-button label="2">傅里叶拟合</el-radio-button>
            <el-radio-button label="3">拉格朗日插值</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handlePredict" :loading="loading">
            <el-icon><TrendCharts /></el-icon>开始预测
          </el-button>
        </div>
        <div v-if="predictResult" class="predict-result">
          <div ref="predictChartRef" class="chart-container"></div>
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.data-view {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
}

.section-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.clean-section,
.predict-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.download-section {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.chart-container {
  width: 100%;
  height: 400px;
  background: #fff;
  border-radius: 4px;
}

.predict-result {
  margin-top: 24px;
}

.loading-card,
.error-card {
  margin-top: 32px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

:deep(.el-radio-button__inner) {
  padding: 8px 20px;
}

:deep(.el-button) {
  padding: 8px 20px;
}
</style>
