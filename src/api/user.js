import request from '@/utils/request'
//管理段分页查询
export function getUserList(data) {
    return request.get('/admin/users', { params: data })
}
//管理端用户状态设置
export function setUserStatus(id, status) {
    return request.put(`/admin/users/${id}/status`, { status })
}
