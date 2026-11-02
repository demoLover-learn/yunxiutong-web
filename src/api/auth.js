import request from '@/utils/request'
//管理员登录
export function adminLogin(data) {
    return request.post('/admin/auth/login', data)
}
//退出登录
export function adminLogout() {
    return request.post('/admin/logout')
}
