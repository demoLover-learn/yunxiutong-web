<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="200px" class="sidebar">
                <div class="logo">管理员后台</div>
                <!-- router：点击菜单项时跳转到 el-menu-item 的 index 对应的路由 -->
                <el-menu router :default-active="route.path" class="sidebar-menu">
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
                    <el-menu-item index="/admin/ServiceCategoryManage">
                        <template #title>
                            <span>服务分类管理</span>
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/admin/ServiceItemManage">
                        <template #title>
                            <span>服务项目管理</span>
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
                    <el-menu-item index="/admin/CommentManage">
                        <template #title>
                            <span>评价管理</span>
                        </template>
                    </el-menu-item>
                    <el-menu-item index="/admin/AIKnowledge">
                        <template #title>
                            <span>AI知识库文件上传</span>
                        </template>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-container>
                <el-header class="header">
                    <div class="header-left">
                        <h3>
                            <el-icon :size="20">
                                <User />
                            </el-icon>
                            <span>云秀通家政平台管理系统</span>
                        </h3>
                    </div>
                    <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
                </el-header>
                <el-main class="main">
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { adminLogout } from '@/api/auth'

const router = useRouter()
const route = useRoute()

async function handleLogout() {
    try {
        // 调后端退出接口，删掉 Redis 里的 token 记录
        await adminLogout()
        ElMessage.success('退出登录成功')
    } catch (error) {
        // 拦截器已经弹过错误提示，这里不重复弹
        console.error(error)
    } finally {
        // 不管接口成没成功，本地必须清干净，否则用户会被永远锁在后台
        localStorage.removeItem('admin_token')
        router.replace({ name: 'adminLogin' })
    }
}
</script>

<style scoped>
/* ══════════ 整体骨架 ══════════ */
.common-layout {
    height: 100vh;

    >.el-container {
        height: 100%;
    }
}

/* ══════════ 左侧边栏 ══════════ */
.sidebar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #304156;
}

.logo {
    flex-shrink: 0;
    height: 60px;
    line-height: 60px;
    text-align: center;

    color: #fff;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;

    background: #2b3a4a;
}

.sidebar-menu {
    flex: 1;
    overflow-y: auto;
    border-right: none;

    /* Element Plus 菜单配色：用 CSS 变量，一处定义全菜单生效 */
    --el-menu-bg-color: #304156;
    --el-menu-text-color: #bfcbd9;
    --el-menu-active-color: #409eff;
    --el-menu-hover-bg-color: #263445;
}

/* 当前选中项：深一档 + 左侧蓝色竖条 */
.sidebar-menu :deep(.el-menu-item.is-active) {
    background: #263445;
    border-right: 3px solid var(--el-menu-active-color);
}

/* ══════════ 顶部 ══════════ */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e6e8eb;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}

.header-left {
    display: flex;
    align-items: center;
}

.header-left h3 {
    display: flex;
    align-items: center;
    gap: 8px;

    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

/* ══════════ 内容区 ══════════ */
.main {
    background: #f0f2f5;
    padding: 20px;
}
</style>