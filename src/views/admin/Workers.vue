<template>
    <div class="major-page">
        <div class="card">
            <div class="search-bar">
                <el-input v-model="query.name" placeholder="请输入师傅姓名" clearable style="width: 200px"
                    @keyup.enter="handleSearch" />
                <el-select v-model="query.status" placeholder="请选择账号状态" clearable style="width: 160px">
                    <el-option label="全部" value="" />
                    <el-option label="正常" value="1" />
                    <el-option label="禁用" value="0" />
                </el-select>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
            </div>
            <div class="formmate"><!--loading:加载状态 -->
                <el-table :data="list" v-loading="loading" style="width: 100%" border stripe>
                    <!--prop 是这一列data从每行数据里取哪个字段来显示:这个就是row.id -->
                    <el-table-column label="Id" prop="id" width="100" />
                    <el-table-column label="姓名" prop="name" width="100" />
                    <el-table-column label="手机号" prop="phone" width="130" />
                    <el-table-column label="性别" prop="gender" width="70">
                        <template #default="{ row }">
                            {{ row.gender === '1' ? '男' : row.gender === '2' ? '女' : '-' }}
                        </template>
                    </el-table-column>
                    <!--show-overflow-tooltip:鼠标悬停显示完整内容-->
                    <el-table-column label="技能描述" prop="skillDesc" width="200" show-overflow-tooltip />
                    <el-table-column label="服务状态" prop="serviceStatusName" width="100" />
                    <el-table-column label="评分" prop="rating" width="80" />
                    <el-table-column label="接单数" prop="orderCount" width="80" align="right" />
                    <el-table-column label="状态" prop="status" width="90">
                        <template #default="{ row }">
                            {{ row.status === 1 ? '正常' : '禁用' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="更新时间" prop="updateTime" width="170">
                        <template #default="{ row }">
                            {{ fmtTime(row.updateTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime" width="170">
                        <template #default="{ row }">
                            {{ fmtTime(row.createTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" fixed="right">
                        <template #default="{ row }">
                            <!--type是用来控制按钮的颜色的-->
                            <el-button :type="row.status === 1 ? 'danger' : 'success'" size="small"
                                @click="handleDisabled(row)">{{ row.status === 1 ? '禁用' : '启用' }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="toolbar">
                    <span class="total-text">共 {{ total }} 条</span>
                    <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total"
                        :page-sizes="[10, 20, 50]" layout="sizes, prev, pager, next, jumper" @current-change="fetchList"
                        @size-change="handleSizeChange" />
                </div>

            </div>
        </div>
    </div>
</template>
<script setup>
import { workerList, workerDisabled } from '@/api/worker'
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
const list = ref([])//表格数据
const total = ref(0)//总条数
const loading = ref(false)//加载状态

const query = reactive({
    page: 1,
    pageSize: 10,
    name: '',
    status: '',
})
// 后端 LocalDateTime 序列化成 2026-11-03T11:22:00，把 T 换成空格、去掉秒
function fmtTime(t) {
    return t ? t.replace('T', ' ').slice(0, 16) : '-'
}
//查询函数
async function fetchList() {
    try {
        loading.value = true
        const res = await workerList(query)


        list.value = res.records
        total.value = res.total
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
//查询按钮函数
function handleSearch() {
    query.page = 1
    fetchList()
}
//查询条件重置函数
function handleReset() {
    query.name = ''
    query.status = ''
    query.page = 1
    fetchList()

}
// 改每页条数必须回第 1 页
function handleSizeChange() {
    query.page = 1
    fetchList()
}
//禁用按钮响应函数
async function handleDisabled(row) {
    const next = row.status === 1 ? 0 : 1//1.正常-》0禁用-》1正常
    const action = next === 0 ? '禁用' : '启用'
    //第一段try:只管确认（用户点取消不执行）
    try {
        await ElMessageBox.confirm(`确认要${action}师傅${row.name}吗？`, '提示',
            { type: 'warning' }
        )
    } catch (e) {
        return
    }
    //第二段try:调后端接口
    try {
        await workerDisabled(row.id, next)
        ElMessage.success(`${action}成功`)
        fetchList()
    } catch (e) {
        console.error(e)
    }


}
//周期函数自动加载数据
onMounted(fetchList)



</script>

<style scoped>
.major-page {
    /* el-main 自带 20px padding，这里设 0 避免叠加成 40px */
    padding: 0;
}

/* 白底卡片：让内容从灰色背景上"浮"起来 */
.card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 搜索区：底部一条分隔线，把它和表格分开 */
.search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 底部栏：左边条数，右边分页 */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
}

.total-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
}

/* 表头浅灰 + 加粗 */
:deep(.el-table th.el-table__cell) {
    background: #fafafa;
    color: var(--el-text-color-primary);
    font-weight: 600;
}
</style>
