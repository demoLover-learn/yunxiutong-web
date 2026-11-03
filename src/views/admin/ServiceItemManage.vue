<template>
    <div class="major-page">
        <div class="head">
            <h3>服务项目管理</h3>
            <el-form :model="query" inline>
                <el-form-item label="分类">
                    <el-select v-model="query.categoryId" placeholder="全部分类" clearable style="width: 180px;"
                        @change="handleSearch">
                        <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新建服务项目</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div class="content">
            <el-table :data="list" v-loading="loading" border stripe row-key="id" style="width: 100%">
                <el-table-column label="Id" prop="id" width="80" align="center" />
                <el-table-column label="服务名称" prop="name" min-width="180" show-overflow-tooltip />
                <el-table-column label="所属分类" prop="categoryName" min-width="130" show-overflow-tooltip />
                <el-table-column label="价格" width="120" align="right">
                    <template #default="scope">
                        {{ fmtPrice(scope.row.price) }}
                    </template>
                </el-table-column>
                <el-table-column label="时长(分钟)" width="110" align="center">
                    <template #default="scope">
                        {{ scope.row.durationMinutes ?? '-' }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" disable-transitions>
                            {{ scope.row.status === 1 ? '已上架' : '已下架' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="更新时间" min-width="170" align="center">
                    <template #default="scope">
                        {{ fmtTime(scope.row.updateTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right" align="center">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" :type="scope.row.status === 1 ? 'warning' : 'success'"
                            @click="handleUpdateStatus(scope.row)">
                            {{ scope.row.status === 1 ? '下架' : '上架' }}
                        </el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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

        <!-- 新增/编辑弹窗 -->
        <el-dialog v-model="editVisible" :title="isEdit ? '编辑服务项目' : '新增服务项目'" width="520px"
            @closed="handleClosed">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="服务名称" prop="name">
                    <el-input v-model="form.name" placeholder="如：空调清洗" maxlength="50" show-word-limit />
                </el-form-item>

                <el-form-item label="所属分类" prop="categoryId">
                    <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                        <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="form.price" :min="0" :max="99999" :precision="2" :step="10"
                        style="width: 200px" />
                    <span class="unit">元</span>
                </el-form-item>

                <el-form-item label="时长" prop="durationMinutes">
                    <el-input-number v-model="form.durationMinutes" :min="0" :max="1440" :step="30"
                        style="width: 200px" />
                    <span class="unit">分钟</span>
                </el-form-item>

                <el-form-item label="服务说明" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="3" maxlength="255" show-word-limit
                        placeholder="选填" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="editVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import {
    getServiceItemList,
    deleteServiceItem,
    updateServiceItemStatus,
    updateServiceItem,
    createServiceItem
} from '@/api/serviceItem'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllCategories } from '@/api/serviceCategory'

const list = ref([])//服务项目列表
const total = ref(0) //总条数
const loading = ref(false)//加载状态
const categoryList = ref([]) //服务分类列表

//查询参数
const query = reactive({
    page: 1,
    pageSize: 10,
    categoryId: undefined
})

//拉取服务分类列表（只在进页面时拉一次，分类基本不变）
async function fetchCategoriesList() {
    try {
        const res = await getAllCategories()
        categoryList.value = res || []
    } catch (err) {
        console.error(err)
    }
}

//重置按钮
function handleReset() {
    query.categoryId = undefined
    handleSearch()          // 走 handleSearch 会自动把页码归 1
}

//筛选变化：必须回第 1 页
function handleSearch() {
    query.page = 1
    fetchList()
}

//每页条数变化：必须回第 1 页
function handleSizeChange() {
    query.page = 1
    fetchList()
}

//上架 / 下架
async function handleUpdateStatus(row) {
    const next = row.status === 1 ? 0 : 1
    const action = next === 1 ? '上架' : '下架'
    //第一段 try：只管确认
    try {
        await ElMessageBox.confirm(`确定${action}「${row.name}」吗？`, '提示', { type: 'warning' })
    } catch {
        return
    }
    //第二段 try：只管请求
    try {
        await updateServiceItemStatus(row.id, next)
        ElMessage.success(`${action}成功`)
        fetchList()
    } catch (err) {
        console.error(err)
    }
}

//删除
async function handleDelete(row) {
    //先判断是否真的要删除
    try {
        await ElMessageBox.confirm(`确认删除「${row.name}」吗？删除后不可恢复。`, '删除确认', {
            type: 'warning',
            confirmButtonText: '确定删除',
            cancelButtonText: '取消'
        })
    } catch {
        return
    }
    //删除项目
    try {
        await deleteServiceItem(row.id)
        ElMessage.success('删除成功')
        //删的是当前页最后一条时往前翻一页，避免停在空白的下一页
        if (list.value.length === 1 && query.page > 1) query.page--
        fetchList()
    } catch (err) {
        console.error(err)
    }
}

//拉取整页数据
async function fetchList() {
    loading.value = true
    try {
        const res = await getServiceItemList(query)
        list.value = res.records
        total.value = res.total
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

//时间格式化：后端 LocalDateTime 序列化成 2026-11-03T11:22:00
function fmtTime(time) {
    return time ? time.replace('T', ' ').slice(0, 16) : '-'
}

//价格格式化：null 显示 -，否则保留两位小数
function fmtPrice(price) {
    return price === null || price === undefined ? '-' : '￥' + Number(price).toFixed(2)
}

//新增/编辑弹窗状态
const editVisible = ref(false)   // 弹窗开/关
const isEdit = ref(false)        // false=新增，true=编辑
const submitting = ref(false)    // 确定按钮的 loading
const formRef = ref()            // el-form 实例，用来调 validate()

//表单数据容器
const form = reactive({
    id: null,                  // 编辑时记住改的是哪一条
    name: '',
    categoryId: undefined,
    price: 0,
    durationMinutes: 60,
    description: ''
})

//校验规则（key 必须和 form 字段名、prop 完全一致）
const rules = {
    name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入价格', trigger: 'change' }]
}

//把表单恢复成新增时的空状态
function resetForm() {
    Object.assign(form, {
        id: null,
        name: '',
        categoryId: undefined,
        price: 0,
        durationMinutes: 60,
        description: ''
    })
}

//新增按钮
function handleAdd() {
    isEdit.value = false
    resetForm()
    editVisible.value = true
}

//编辑按钮：回显这一行的数据（绝不能用 resetFields，它恢复的是"挂载时"的值）
function handleEdit(row) {
    isEdit.value = true
    Object.assign(form, {
        id: row.id,
        name: row.name,
        categoryId: row.categoryId,
        price: Number(row.price),
        durationMinutes: row.durationMinutes ?? 60,
        description: row.description || ''
    })
    editVisible.value = true
}

//弹窗关掉后清一下校验红字
function handleClosed() {
    formRef.value?.clearValidate()
}

//确定：先校验，再提交
async function submitForm() {
    //第一段 try：只管校验
    try {
        await formRef.value.validate()
    } catch {
        return
    }
    //第二段 try：只管请求
    submitting.value = true
    try {
        const payload = {
            name: form.name,
            categoryId: form.categoryId,
            price: form.price,
            durationMinutes: form.durationMinutes,
            description: form.description
        }
        if (isEdit.value) {
            await updateServiceItem(form.id, payload)
            ElMessage.success('更新成功')
        } else {
            await createServiceItem(payload)
            ElMessage.success('新增成功')
        }
        editVisible.value = false
        fetchList()//刷新列表
    } catch (e) {
        console.error(e)
    } finally {
        submitting.value = false
    }
}

//周期函数自动加载数据
onMounted(() => {
    fetchCategoriesList()
    fetchList()
})
</script>

<style scoped>
.unit {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
}
</style>