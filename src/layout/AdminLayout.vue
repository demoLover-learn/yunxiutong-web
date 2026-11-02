<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="200px">
                <h2>管理员后台</h2>
                <!--//router标签，点击菜单项时，会跳转到对应的路由和el-menu-item里面的index配合使用-->
                <el-menu router :default-active="route.path" class="el-menu-vertical">
                    <el-menu-item index="/admin/dashboard">
                        <template #title>
                            <span>首页</span>
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/admin/orders">
                        <template #title>
                            <span>工单管理</span>
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/admin/workers">
                        <template #title>
                            <span>师傅管理</span>
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/admin/users">
                        <template #title>
                            <span>用户管理</span>
                        </template>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-container>
                <el-header>Header</el-header>
                <el-main>
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()


</script>
<style scoped>
.common-layout {
    height: 100vh;
}
</style>