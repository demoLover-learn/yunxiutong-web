<template>
    <div class="major-page">
        <div class="head">
            <h3>评价管理</h3>
            <el-form :model="query" inline>
                <el-form-item label="工单号">
                    <el-input v-model="query.orderNo" placeholder="请输入工单号" clearable style="width: 180px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="用户">
                    <el-input v-model="query.userName" placeholder="请输入用户昵称" clearable style="width: 150px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="师傅">
                    <el-input v-model="query.workerName" placeholder="请输入师傅姓名" clearable style="width: 150px"
                        @keyup.enter="handleSearch" />
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
                <el-table-column label="工单号" prop="orderNo" min-width="170" show-overflow-tooltip />
                <el-table-column label="用户" prop="userName" min-width="130" align="center" show-overflow-tooltip />
                <el-table-column label="师傅" prop="workerName" min-width="130" align="center" show-overflow-tooltip />
                <el-table-column label="评分" width="180" align="center">
                    <template #default="{ row }">
                        <el-rate :model-value="row.score" disabled show-score score-template="{value} 分" />
                    </template>
                </el-table-column>
                <!-- 弹性列：多列用 min-width 才能把剩余空间"分摊"，只留一列会被它独吞 -->
                <el-table-column label="评价内容" prop="content" min-width="260" show-overflow-tooltip />
                <el-table-column label="评价时间" min-width="170" align="center">
                    <template #default="{ row }">{{ fmtTime(row.createTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="90" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pager">
                <span class="pager-total">共 {{ total }} 条</span>
                <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total"
                    :page-sizes="[10, 20, 50]" layout="sizes, prev, pager, next, jumper" @current-change="fetchList"
                    @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getCommentList, deleteComment } from '@/api/comment'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])//评价列表
const total = ref(0)//评价总数
const loading = ref(false)//加载中

const query = reactive({
    page: 1,
    pageSize: 10,
    orderNo: '',
    userName: '',
    workerName: ''
})

// 后端 LocalDateTime 序列化成 2026-11-03T11:22:00，换成空格 + 去掉秒
function fmtTime(t) {
    return t ? t.replace('T', ' ').slice(0, 16) : '-'
}

//拉取数据
async function fetchList() {
    try {
        loading.value = true
        const res = await getCommentList(query)
        list.value = res.records
        total.value = res.total
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

//查询按钮：改变结果集，页码必须归 1
function handleSearch() {
    query.page = 1
    fetchList()
}

//重置按钮：三个条件全清 + 页码归 1
function handleReset() {
    query.orderNo = ''
    query.userName = ''
    query.workerName = ''
    query.page = 1
    fetchList()
}

//每页条数变化：也要回第 1 页
function handleSizeChange() {
    query.page = 1
    fetchList()
}

//删除按钮
async function handleDelete(row) {
    //第一段 try：只管确认（用户点"取消"是 reject，直接 return，别继续往下走）
    try {
        await ElMessageBox.confirm(
            `确定删除「${row.userName || '该用户'}」对「${row.workerName || '该师傅'}」的评价吗？`,
            '删除确认',
            { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
        )
    } catch {
        return
    }
    //第二段 try：只管请求
    try {
        await deleteComment(row.id)
        ElMessage.success('删除成功')
        //删掉当前页最后一条时回退一页，否则会停在空白页
        if (list.value.length === 1 && query.page > 1) {
            query.page--
        }
        fetchList()
    } catch (e) {
        console.error(e)
    }
}

//生命周期：进入页面自动查一次
onMounted(fetchList)
</script>