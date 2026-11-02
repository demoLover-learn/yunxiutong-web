<template>
    <div class="order-page">
        <div class="search-bar">
            <el-input v-model="query.orderNo" placeholder="请输入订单编号" style="width: 200px" clearable
                @keyup.enter="handleSearch" />
            <el-input v-model="query.userName" placeholder="请输入用户名称" style="width: 180px" clearable
                @keyup.enter="handleSearch" />
            <el-select v-model="query.orderStatus" placeholder="请选择状态" style="width: 120px" clearable>
                <el-option label="待接单" :value="0" />
                <el-option label="已接单" :value="1" />
                <el-option label="服务中" :value="2" />
                <el-option label="已完成" :value="3" />
                <el-option label="已取消" :value="4" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
        </div>
        <!--:data：用来绑定表格的数据	border显示表格边框线 strip:显示表格的行背景颜色-->
        <!-- 自己不知道"数据有没有返回"，它只看 loading 这个变量的真假。真正控制遮罩的是你手动改值。-->
        <el-table :data="list" v-loading="loading" border stripe>
            <!--单元格内容太长被截断时，鼠标悬停显示完整内容的 tooltip（提示框）-->
            <el-table-column label="订单编号" prop="orderNo" min-width="120" show-overflow-tooltip />
            <el-table-column label="用户" prop="userName" min-width="110" />
            <el-table-column label="服务项目" prop="serviceItemName" min-width="130" show-overflow-tooltip />
            <el-table-column label="师傅" min-width="110">
                <template #default="{ row }">
                    <span v-if="row.workerName">{{ row.workerName }}</span>
                    <span v-else style="color: #999">未派单</span>
                </template>
            </el-table-column>
            <el-table-column label="金额" prop="totalAmount" min-width="100" />
            <!-- 状态：文字后端给了，颜色前端自己映射 -->
            <el-table-column label="状态" min-width="100">
                <template #default="{ row }">
                    <el-tag :type="statusTagType(row.status)">
                        {{ row.orderStatusName }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <!-- 查看详情 -->
                    <el-button size="small" @click="handleView(row)">详情</el-button>
                    <!-- 待接单：可以派单、取消 -->
                    <el-button type="primary" size="small" :disabled="row.status != 0" @click="handleAssign(row)">
                        派单
                    </el-button>
                    <el-button type="danger" size="small" :disabled="![0, 1].includes(row.status)"
                        @click="handleCancel(row)">
                        取消
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="query.page" :page-size="query.pageSize" :total="total"
            layout="total, prev, pager, next" @current-change="fetchList"
            style="margin-top: 20px; justify-content: flex-end" />
        <!-- 派单弹窗 -->
        <el-dialog v-model="assignVisible" title="派单" width="420px" @closed="handleAssignClosed">
            <p>订单编号：{{ currentOrder.orderNo }}</p>
            <el-select v-model="selectedWorkerId" placeholder="请选择师傅" style="width: 100%;margin-top:12px">
                <el-option v-for="w in workerList" :key="w.id" :label="w.name" :value="w.id" />
            </el-select>
            <template #footer>
                <el-button @click="assignVisible = false">取消</el-button>
                <el-button type="primary" :loading="assigning" @click="submitAssign">确认派单</el-button>
            </template>
        </el-dialog>
        <!-- 订单详情列表 -->
        <el-dialog v-model="detailVisible" title="订单详情" width="760px">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="订单编号"> {{ detailRow.orderNo }}</el-descriptions-item>
                <el-descriptions-item label="订单状态">
                    <el-tag :type="statusTagType(detailRow.status)">{{ detailRow.orderStatusName }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户">{{ detailRow.userName }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ detailRow.userPhone }}</el-descriptions-item>
                <el-descriptions-item label="服务项目">
                    {{ detailRow.serviceItemName }}
                </el-descriptions-item>
                <el-descriptions-item label="订单金额">
                    ￥{{ detailRow.totalAmount }}
                </el-descriptions-item>
                <el-descriptions-item label="服务师傅">
                    <span v-if="detailRow.workerName">{{ detailRow.workerName }}</span>
                    <span v-else style="color: #999">未派单</span>
                </el-descriptions-item>
                <el-descriptions-item label="支付状态">
                    {{ detailRow.payStatus === 1 ? '已支付' : '未支付' }}
                </el-descriptions-item>
                <el-descriptions-item label="预约时间">
                    {{ fmtTime(detailRow.appointmentTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="下单时间">
                    {{ fmtTime(detailRow.createTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="服务地址" :span="2">
                    {{ detailRow.address }}
                </el-descriptions-item>
                <el-descriptions-item label="用户备注" :span="2">
                    {{ detailRow.remark || '无' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="detailRow.cancelReason" label="取消原因" :span="2">
                    {{ detailRow.cancelReason }}
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailVisible = false">取消</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList, cancelOrder, assignOrder, getAvailableWorkers } from '@/api/order'
//确认取消订单的组件
import { ElMessageBox, ElMessage } from 'element-plus'

const list = ref([]) //表格数据
const total = ref(0)//总条数
const loading = ref(false)//加载状态
const assignVisible = ref(false)//派单弹窗开还是关
const currentOrder = ref()//当前要派的是哪一单
const workerList = ref([])//可选师傅列表
const selectedWorkerId = ref(undefined)//选中的师傅id
const assigning = ref(false)//派单请求进行中
const detailVisible = ref(false)//订单详情列表关还是开
const detailRow = ref()//当前看的是哪一单

//查询参数
const query = reactive({
    page: 1,
    pageSize: 10,
    orderNo: '',
    userName: '',
    orderStatus: undefined
})
//状态码映射标签颜色
//0待接单 1已接单 2服务中 3已完成 4已取消
const tagMap = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'info',
    4: 'danger'
}
//根据状态码返回标签颜色
function statusTagType(status) {
    return tagMap[status] || 'info'
}
//拉数据
async function fetchList() {
    loading.value = true
    try {
        const res = await getOrderList(query)

        console.log('本页条数：', res.records.length)   // 应该是 10
        console.log('总条数：', res.total)
        list.value = res.records
        total.value = res.total
    } catch (e) {
        console.log(e)
    } finally {
        loading.value = false
    }
}
//搜索函数
function handleSearch() {
    query.page = 1//任何会改变"结果集大小"的操作，都必须把页码重置为 1
    fetchList()
}
//后端返回的时间形如 2026-11-03T10:00:00，去掉 T、截掉秒
function fmtTime(t) {
    return t ? t.replace('T', ' ').slice(0, 16) : '-'
}
//重置函数
function handleReset() {
    query.orderNo = ''
    query.userName = ''
    query.orderStatus = undefined
    query.page = 1
    fetchList()
}
//进入页面就拉数据
onMounted(() => {
    fetchList()
})
// 派单（第 11 步再接真正的弹窗）
async function handleAssign(row) {
    currentOrder.value = row//把这一单存起来
    selectedWorkerId.value = undefined//清空选中的师傅id
    assignVisible.value = true//打开弹窗
    //负责拉可选师傅
    await fetchWorkers()


}

// 取消（第 11 步再接确认框 + 接口）
async function handleCancel(row) {
    //负责问管理员是否确定取消
    try {
        await ElMessageBox.confirm(
            `确定要取消订单${row.orderNo}吗?取消后无法确认`,
            '取消确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '再想想',
                type: 'warning'
            }
        )
    } catch (e) {
        return
    }
    //负责发请求取消订单
    try {
        await cancelOrder(row.id)
        ElMessage.success('订单取消成功')
        fetchList()
    } catch (e) {
        console.log(e)
    }


}

// 查看详情（第 11 步再做详情页）
function handleView(row) {
    detailRow.value = row
    detailVisible.value = true//打开详情列表
}
//拉可选师傅
async function fetchWorkers() {
    const res = await getAvailableWorkers()
    console.log('可选师傅列表：', res.length, res)
    workerList.value = res
}
//确认派单
async function submitAssign() {
    if (!selectedWorkerId.value) {
        ElMessage.error('请选择师傅')
        return
    }
    assigning.value = true
    try {
        await assignOrder(currentOrder.value.id, selectedWorkerId.value)
        ElMessage.success('订单派单成功')
        assignVisible.value = false//关闭弹窗
        fetchList()
    } catch (e) {
        console.log(e)
    } finally {
        assigning.value = false
    }
}
//弹窗完全关闭后清理，不管用哪种方式关的
function handleAssignClosed() {
    selectedWorkerId.value = undefined
    workerList.value = []
}
</script>
<style scoped>
.order-page {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
}

.search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.search-bar .el-button+.el-button {
    margin-left: 0;
    /* 否则和 gap 叠加，两个按钮之间会空一大块 */
}
</style>