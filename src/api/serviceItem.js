import request from '@/utils/request'
//服务项目分页查询
export function getServiceItemList(data) {
    return request.get('/admin/service-items', { params: data })
}
//删除服务项目
export function deleteServiceItem(id) {
    return request.delete(`/admin/service-items/${id}`)
}
//更新服务项目状态
export function updateServiceItemStatus(id, status) {
    return request.put(`/admin/service-items/${id}/status`, { status })
}
//更新项目
export function updateServiceItem(id, data) {
    return request.put(`/admin/service-items/${id}`, data)
}
//新增项目
export function createServiceItem(data) {
    return request.post('/admin/service-items', data)
}