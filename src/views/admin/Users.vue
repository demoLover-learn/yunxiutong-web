<template>
    <div class="major-page">
        <div class="head">
            <h3>用户管理</h3>
            <el-form :model="query" inline class="search-form">
                <el-form-item label="昵称">
                    <el-input v-model="query.nickname" placeholder="请输入昵称" clearable style="width: 180px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="query.phone" placeholder="请输入手机号" clearable style="width: 180px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.status" placeholder="请选择状态" clearable style="width: 150px">
                        <el-option label="全部" value="" />
                        <el-option label="正常" value="1" />
                        <el-option label="禁用" value="0" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div class="content">
            <el-table :data="list" v-loading="loading" border stripe style="width: 100%">
                <el-table-column label="Id" prop="id" width="80" align="center" />
                <el-table-column label="头像" width="90" align="center">
                    <template #default="scope">
                        <el-avatar :size="40" :src="scope.row.avatar">
                            {{ (scope.row.nickname || '?').slice(0, 1) }}
                        </el-avatar>
                    </template>
                </el-table-column>
                <el-table-column label="昵称" prop="nickname" min-width="140" show-overflow-tooltip />
                <el-table-column label="手机号" prop="phone" width="140" align="center" />
                <el-table-column label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" disable-transitions>
                            {{ scope.row.status === 1 ? '正常' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="注册时间" width="180" align="center">
                    <template #default="scope">{{ fmtTime(scope.row.createTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="scope">
                        <el-button :type="scope.row.status === 1 ? 'danger' : 'success'" size="small"
                            @click="handleDisabled(scope.row)">
                            {{ scope.row.status === 1 ? '禁用' : '启用' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pager">
                <span class="pager-total">共 {{ total }} 条</span>
                <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total"
                    :page-sizes="[10, 20, 50]" layout="sizes, prev, pager, next, jumper"
                    @current-change="fetchList" @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getUserList, setUserStatus } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])//用户列表数据
const total = ref(0)//总条数
const loading = ref(false)//加载状态

const query = reactive({
    page: 1,
    pageSize: 10,
    nickname: '',
    phone: '',
    status: ''
})

// 后端 LocalDateTime 序列化成 2026-11-03T11:22:00，把 T 换成空格、去掉秒
function fmtTime(t) {
    return t ? t.replace('T', ' ').slice(0, 16) : '-'
}

//拉取数据
async function fetchList() {
    try {
        loading.value = true
        const res = await getUserList(query)
        list.value = res.records
        total.value = res.total
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

//禁用按钮
async function handleDisabled(row) {
    const next = row.status === 1 ? 0 : 1
    const action = next === 0 ? '禁用' : '启用'
    //第一段try:只管确认（用户点取消不执行）
    try {
        await ElMessageBox.confirm(`确认要${action}用户「${row.nickname}」吗？`, '提示', {
            type: 'warning',
            confirmButtonText: `确定${action}`,
            cancelButtonText: '取消'
        })
    } catch {
        return
    }
    //第二段try:调后端接口
    try {
        await setUserStatus(row.id, next)
        ElMessage.success(`${action}成功`)
        fetchList()
    } catch (e) {
        console.error(e)
    }
}

//查询按钮
function handleSearch() {
    query.page = 1
    fetchList()
}

//重置按钮
function handleReset() {
    query.nickname = ''
    query.phone = ''
    query.status = ''
    query.page = 1
    fetchList()
}

//每页条数变化：必须回第 1 页
function handleSizeChange() {
    query.page = 1
    fetchList()
}

//周期函数自动加载数据
onMounted(fetchList)
</script>

<style scoped>
.major-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 顶部：标题 + 搜索栏 */
.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.head h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
}

/* el-form inline 自带 margin-bottom，放进标题栏里要清掉 */
.search-form :deep(.el-form-item) {
    margin-bottom: 0;
}

/* 表格卡片 */
.content {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 底部：总数 + 分页 */
.pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
}

.pager-total {
    font-size: 13px;
    color: #909399;
}
</style>