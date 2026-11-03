import request from '@/utils/request'
//项目服务分页查询
export function getServiceCategoryList(data) {
    return request.get('/admin/service-categories', { params: data })
}
//服务的删除
export function deleteCategory(id) {
    return request.delete(`/admin/service-categories/${id}`
    )
}
//服务的禁用和启用
export function disableCategory(id, status) {
    return request.put(`/admin/service-categories/${id}/status`, { status })
}
//新增分类
export function addCategory(data) {
    return request.post('/admin/service-categories', data)
}

// 编辑分类
export function updateCategory(id, data) {
    return request.put(`/admin/service-categories/${id}`, data)
}

// 查询所有分类（不分页，给下拉框用）
export function getAllCategories() {
    return request.get('/admin/service-categories/all')
}