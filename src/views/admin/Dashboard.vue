<template>
    <div class="major-page" v-loading="loading">
        <!-- 标题栏 -->
        <div class="head">
            <h3>数据概况</h3>
            <el-button size="small" @click="loadData">刷新数据</el-button>
        </div>

        <!-- 顶部 4 个统计卡片 -->
        <div class="cards">
            <div class="card">
                <div class="card-label">总单量</div>
                <div class="card-value">{{ total }}</div>
            </div>
            <div class="card">
                <div class="card-label">待接单</div>
                <div class="card-value warn">{{ pending }}</div>
            </div>
            <div class="card">
                <div class="card-label">服务中</div>
                <div class="card-value info">{{ serving }}</div>
            </div>
            <div class="card">
                <div class="card-label">已完成</div>
                <div class="card-value ok">{{ done }}</div>
            </div>
        </div>

        <!-- 饼图 + 柱状图 -->
        <div class="chart-row">
            <div class="chart-card">
                <h3>订单状态分布</h3>
                <div ref="pieRef" style="height: 320px;"></div>
            </div>
            <div class="chart-card">
                <h3>师傅接单排行</h3>
                <div ref="barRef" style="height: 320px;"></div>
            </div>
        </div>

        <!-- 折线图（整行） -->
        <div class="chart-card">
            <h3>月度订单趋势</h3>
            <div ref="lineRef" style="height: 300px;"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { getOrderTrend, getStatusCount, getWorkerRank } from '@/api/statistics'

/* ==================== 数据 ==================== */

const loading = ref(false)

const statusList = ref([])                        // 状态分布（卡片 + 饼图）
const rankList = ref([])                          // 师傅排行（柱状图）
const trend = ref({ months: [], counts: [] })     // 月度趋势（折线图）

/* ==================== 图表容器与实例 ==================== */

const pieRef = ref()
const barRef = ref()
const lineRef = ref()

// 图表实例不是响应式数据，用普通变量存
let pieChart = null
let barChart = null
let lineChart = null

/* ==================== 顶部卡片 ==================== */

// 按状态名取数量，取不到返回 0（后端只返回"存在"的状态）
function countOf(name) {
    const item = statusList.value.find(i => i.name === name)
    return item ? item.value : 0
}

const total = computed(() => statusList.value.reduce((sum, i) => sum + (i.value || 0), 0))
const pending = computed(() => countOf('待接单'))
const serving = computed(() => countOf('服务中'))
const done = computed(() => countOf('已完成'))

/* ==================== 图表渲染 ==================== */

// 状态与颜色的对应表（用名字匹配，后端只给名字不给状态码）
const STATUS_COLOR = {
    '待接单': '#e6a23c',
    '已接单': '#409eff',
    '服务中': '#7b5cff',
    '已完成': '#67c23a',
    '已取消': '#909399'
}

// 数据为空时在图表中间显示的灰字
function emptyTitle(text) {
    return {
        text,
        left: 'center',
        top: 'middle',
        textStyle: { color: '#c0c4cc', fontSize: 14, fontWeight: 'normal' }
    }
}

// 饼图：订单状态分布
function renderPie() {
    if (!pieRef.value) return
    if (!pieChart) pieChart = echarts.init(pieRef.value)

    pieChart.setOption({
        title: statusList.value.length ? { show: false } : emptyTitle('暂无订单数据'),
        tooltip: { trigger: 'item', formatter: '{b}：{c} 单（{d}%）' },
        legend: { bottom: 0 },
        series: [{
            name: '订单状态',
            type: 'pie',
            radius: ['42%', '66%'],
            center: ['50%', '45%'],
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            label: { formatter: '{b} {c}' },
            data: statusList.value.map(i => ({
                name: i.name,
                value: i.value,
                itemStyle: { color: STATUS_COLOR[i.name] || '#909399' }
            }))
        }]
    }, true)
}

// 柱状图：师傅接单排行
function renderBar() {
    if (!barRef.value) return
    if (!barChart) barChart = echarts.init(barRef.value)

    barChart.setOption({
        title: rankList.value.length ? { show: false } : emptyTitle('暂无派单数据'),
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 10, right: 20, top: 20, bottom: 10, containLabel: true },
        xAxis: {
            type: 'category',
            data: rankList.value.map(i => i.workerName),
            axisLabel: { interval: 0 }
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
            name: '接单数',
            type: 'bar',
            barMaxWidth: 40,
            label: { show: true, position: 'top' },
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#79bbff' },
                    { offset: 1, color: '#409eff' }
                ])
            },
            data: rankList.value.map(i => i.orderCount)
        }]
    }, true)
}

// 折线图：月度订单趋势
function renderLine() {
    if (!lineRef.value) return
    if (!lineChart) lineChart = echarts.init(lineRef.value)

    lineChart.setOption({
        title: trend.value.months.length ? { show: false } : emptyTitle('暂无月度数据'),
        tooltip: { trigger: 'axis' },
        grid: { left: 10, right: 30, top: 20, bottom: 10, containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trend.value.months
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
            name: '订单量',
            type: 'line',
            smooth: true,
            symbolSize: 7,
            data: trend.value.counts,
            itemStyle: { color: '#409eff' },
            lineStyle: { width: 3 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(64,158,255,0.35)' },
                    { offset: 1, color: 'rgba(64,158,255,0.02)' }
                ])
            }
        }]
    }, true)
}

// 窗口大小变化时让三个图重算宽高
function resizeCharts() {
    pieChart?.resize()
    barChart?.resize()
    lineChart?.resize()
}

/* ==================== 拉数据 ==================== */

async function loadData() {
    try {
        loading.value = true

        statusList.value = await getStatusCount()
        rankList.value = await getWorkerRank()

        const res = await getOrderTrend()
        trend.value = {
            months: res?.months || [],
            counts: res?.counts || []
        }
    } catch (e) {
        console.error(e)
        // 拦截器已经弹过错误提示了，这里只留痕
    } finally {
        loading.value = false
    }

    // 数据到手后再画（不管成功失败都画一次，失败时显示"暂无数据"）
    renderPie()
    renderBar()
    renderLine()
}

/* ==================== 生命周期 ==================== */

onMounted(() => {
    loadData()
    window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeCharts)
    pieChart?.dispose()
    barChart?.dispose()
    lineChart?.dispose()
    pieChart = barChart = lineChart = null
})
</script>

<style scoped>
.cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.card {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card-label {
    font-size: 14px;
    color: #909399;
}

.card-value {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #303133;
}

.card-value.warn {
    color: #e6a23c;
}

.card-value.info {
    color: #409eff;
}

.card-value.ok {
    color: #67c23a;
}

/* 两张图并排 */
.chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.chart-card {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chart-card h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

/* 窄屏：卡片两列、图表单列，避免被压扁 */
@media (max-width: 1200px) {
    .cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .chart-row {
        grid-template-columns: 1fr;
    }
}
</style>