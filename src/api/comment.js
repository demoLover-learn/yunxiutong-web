import request from '@/utils/request'
//管理端评价管理
export function getCommentList(data) {
    return request.get('/admin/order-comments', { params: data })
}
//管理端删除数据
export function deleteComment(id) {
    return request.delete(`/admin/order-comments/${id}`)
}