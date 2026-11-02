import request from '@/utils/request'
//管理页工人查询
export function workerList(data) {
    return request.get('/admin/workers', { params: data })
}
//管理页禁用/禁用
export function workerDisabled(id, status) {
    return request.put(`/admin/workers/${id}/status`, { status })
}