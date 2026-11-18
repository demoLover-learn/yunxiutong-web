import request from '@/utils/request'

// 月度订单趋势 → { months: [], counts: [] }
export function getOrderTrend() {
    return request.get('/admin/statistics/order-count')
}

// 订单状态分布 → [{ name, value }]
export function getStatusCount() {
    return request.get('/admin/statistics/order-status-count')
}

// 师傅接单排行 → [{ workerName, orderCount, rating }]
export function getWorkerRank() {
    return request.get('/admin/statistics/worker-rank')
}