import {createRouter,createWebHistory} from 'vue-router'

const router=createRouter({
    history:createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path:'/admin/login',//匹配的路径
            name:'adminLogin',//可选：命名路由，方便 router.push({ name: 'AdminLogin' })
            component:()=> import('@/views/admin/Login.vue'),//所用到的组件
        },
        {
            path:'/admin/dashboard',
            name:'adminDashboard',
            component:()=> import('@/views/admin/Dashboard.vue'),
        }
    ]
})

export default router