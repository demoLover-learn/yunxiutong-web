import axios from 'axios'
import { ElMessage } from 'element-plus'

//创建axios实例
const service = axios.create({
    baseURL: '/api',//配合vite proxy:/api/**->http://localhost:8080/api/** */ */
    timeout: 5000,//5秒未响应就是失败的
})
//请求拦截器，每个请求发出去之前都会经过这里
service.interceptors.request.use(
    config => {
        //请求发出前，判断是否有token
        //localStorage就是登陆成功之后后端把token传回，浏览器本身储存的token
        const token = localStorage.getItem('admin_token')
        if (token) {
            //请求发出前把token添加到headers中
            config.headers['token'] = token
        }
        return config
    },
    (error) => Promise.reject(error)
)

//响应式拦截器:每个响应交回“调用方之前”都会经过这里
service.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code === 1) {
            return res.data
        }
        //业务逻辑失败(code===0)
        ElMessage.error(res.msg || "请求失败，请稍后重试")
        return Promise.reject(new Error(res.msg || "请求失败，请稍后重试"))
    },
    (error) => {
        //网络超时，断网，404，500
        ElMessage.error(error.message || "网络异常，稍后重试")
        return Promise.reject(error)
    }
)

export default service
