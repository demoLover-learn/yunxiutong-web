import request from '@/utils/request'
//管理员登录
export function adminLogin(data){
    return request.post('/admin/auth/login',data)
}
