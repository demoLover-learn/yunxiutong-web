import request from '@/utils/request'
//查询工单列表
//params:{page:1,pageSize:10,orderNo='',orderStatus:0}
export function getOrderList(params) {
    return request.get('/admin/orders', { params })
}
//取消订单
export function cancelOrder(id) {
    return request.put(`/admin/orders/${id}/cancel`)
}
//获取可选师傅
export function getAvailableWorkers() {
    return request.get('/admin/workers/available')
}
//派单接口
export function assignOrder(id, workerId) {
    return request.put(`/admin/orders/${id}/assign`, { workerId })
}