<template>
    <div class="major-page">
        <div class="head">
            <h3>服务分类管理</h3>
            <el-button type="primary" @click="handleAdd">新增分类</el-button>
        </div>

        <div class="content">
            <el-table :data="list" v-loading="loading" border stripe style="width: 100%">
                <el-table-column label="Id" prop="id" width="80" align="center" />
                <el-table-column label="分类名称" prop="name" min-width="180" show-overflow-tooltip />
                <el-table-column label="排序" prop="sort" width="90" align="center" />
                <el-table-column label="状态" width="110" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" disable-transitions>
                            {{ scope.row.status === 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="180" align="center">
                    <template #default="scope">{{ fmtTime(scope.row.createTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right" align="center">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button :type="scope.row.status === 1 ? 'danger' : 'success'" size="small"
                            @click="handleDisable(scope.row)">
                            {{ scope.row.status === 1 ? '禁用' : '启用' }}
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

        <!-- 新增 / 编辑分类弹窗 -->
        <el-dialog v-model="editVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="440px" @closed="handleClosed">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="formData.name" placeholder="如：家电维修" maxlength="20" show-word-limit clearable />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" />
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
import { ref, onMounted, reactive } from 'vue'
import { getServiceItemList, deleteCategory, disableCategory, addCategory, updateCategory } from '@/api/serviceItem';
import { ElMessageBox, ElMessage } from 'element-plus';

const list = ref([])//表格数据
const total = ref(0)//总条数
const loading = ref(false)//加载状态
const editVisible = ref(false)//弹窗是否显示
const submitting = ref(false)//提交中，防止连点两次
const formRef = ref(null)//表单实例对象用来调用validate
const isEdit = ref(false)// false = 新增，true = 编辑
const formData = reactive({//弹窗的表单数据
    id: null,
    name: '',
    sort: 0,
})
const rules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入排序', trigger: 'change' }],
}
const query = reactive({
    page: 1,
    pageSize: 10,
    categoryId: ''
})

// 后端 LocalDateTime 序列化成 2026-11-03T11:22:00，把 T 换成空格、去掉秒
function fmtTime(t) {
    return t ? t.replace('T', ' ').slice(0, 16) : '-'
}

//弹窗关闭后，清掉校验红字
function handleClosed() {
    formRef.value?.clearValidate()
}

//新增分类：打开弹窗
function handleAdd() {
    isEdit.value = false
    formData.id = null
    formData.name = ''
    formData.sort = 0
    editVisible.value = true
}

//编辑分类：打开弹窗并回显数据
function handleEdit(row) {
    isEdit.value = true
    formData.id = row.id
    formData.name = row.name
    formData.sort = row.sort
    editVisible.value = true
}

//点「确定」
async function submitForm() {
    // 第一段：只管校验
    try {
        await formRef.value.validate()
    } catch {
        return
    }

    // 第二段：只管请求
    submitting.value = true
    try {
        if (isEdit.value) {
            await updateCategory(formData.id, { name: formData.name, sort: formData.sort })
            ElMessage.success('修改成功')
        } else {
            await addCategory({ name: formData.name, sort: formData.sort })
            ElMessage.success('新增成功')
        }
        editVisible.value = false
        fetchList()
    } catch (e) {
        console.error(e)
    } finally {
        submitting.value = false
    }
}

//拉取服务分类列表
async function fetchList() {
    try {
        loading.value = true
        const res = await getServiceItemList(query)
        list.value = res.records
        total.value = res.total
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

//每页条数变化：必须回到第 1 页
function handleSizeChange() {
    query.page = 1
    fetchList()
}

//删除按钮
async function handleDelete(row) {
    try {
        await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？删除后不可恢复`, '提示', {
            type: 'warning',
            confirmButtonText: '确定删除',
            cancelButtonText: '取消'
        })
    } catch {
        return
    }
    try {
        await deleteCategory(row.id)
        ElMessage.success('删除成功')
        // 删掉的正好是当前页最后一条，回退一页，避免停在空白页
        if (list.value.length === 1 && query.page > 1) {
            query.page--
        }
        fetchList()
    } catch (e) {
        console.error(e)
    }
}

//服务的禁用以及启用
async function handleDisable(row) {
    const next = row.status === 1 ? 0 : 1
    const action = next === 1 ? '启用' : '禁用'
    try {
        await ElMessageBox.confirm(`确定${action}「${row.name}」吗`, '提示', {
            type: 'warning',
            confirmButtonText: `确定${action}`,
            cancelButtonText: '取消'
        })
    } catch {
        return
    }
    try {
        await disableCategory(row.id, next)
        ElMessage.success(`${action}成功`)
        fetchList()
    } catch (e) {
        console.error(e)
    }
}

//周期函数自动拉取数据
onMounted(fetchList)
</script>

<style scoped>
.major-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 顶部标题栏 */
.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
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