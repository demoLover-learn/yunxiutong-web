import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {//默认跳转到登录页
            path: '/',
            redirect: '/admin/login'
        },
        {
            path: '/admin/login',//匹配的路径
            name: 'adminLogin',//可选：命名路由，方便 router.push({ name: 'AdminLogin' })
            component: () => import('@/views/admin/Login.vue'),//所用到的组件
        },
        {
            path: '/admin',
            name: 'adminLayout',
            component: () => import('@/layout/AdminLayout.vue'),
            redirect: '/admin/dashboard',//默认跳转到dashboard
            meta: {
                requiresAuth: true,//需要登录
            },
            children: [
                {
                    path: 'dashboard',//前端页面匹配的路径
                    name: 'adminDashboard',//可选：命名路由，方便路由跳转 router.push({ name: 'adminDashboard' })
                    component: () => import('@/views/admin/Dashboard.vue'),
                }, {
                    path: 'orders',
                    name: 'adminOrders',
                    component: () => import('@/views/admin/Orders.vue'),
                },
                {
                    path: 'workers',
                    name: 'adminWorkers',
                    component: () => import('@/views/admin/Workers.vue'),
                }, {
                    path: 'users',
                    name: 'adminUsers',
                    component: () => import('@/views/admin/Users.vue'),
                }
            ]
        }

    ]
})

//路由守卫
router.beforeEach((to) => {
    //to:要跳转的路由对象
    const token = localStorage.getItem('admin_token')
    //判断在这个链路上是否需要登录,
    const needAuth = to.matched.some(record => record.meta.requiresAuth)
    //要进后台，没token，跳转到登录页
    if (needAuth && !token) {
        return {
            name: 'adminLogin',
            //用户直接访问的地址是to.fullPath，但是没有token，所以跳转到登录页
            //这时在登录页用户登录之后直接跳转到用户一开始想去的地址to.fullPath
            query: {
                redirect: to.fullPath,
            }
        }
    }
    //情况二：有token已经登录了
    if (to.name === 'adminLogin' && token) {
        return {
            name: 'adminDashboard',
        }
    }
})

export default router