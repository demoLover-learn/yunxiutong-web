<template>
    <div class="major-page">
        <div class="login-page">
            <h2>管理员登录</h2>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="用户名:" prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" type="text"> </el-input>
                </el-form-item>
                <el-form-item label="密码:" prop="password">
                    <el-input v-model="form.password" placeholder="请输入密码" type="password"> </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { adminLogin } from '@/api/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
// 数据容器：存用户输入
const form = reactive({
    username: '',
    password: ''
})
// 组件容器：存 el-form 实例
const formRef = ref()
//参数校验规则
const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
//提交校验
async function handleLogin() {
    try {
        //通过formRef.value组件实例
        //.validate()调用 el-form 实例的 校验方法，校验所有带 prop 的 el-form-item
        //由于校验是异步的所以要去await等待异步结果返回
        await formRef.value.validate()
        console.log('校验通过')
        //调用登录接口，获取token
        const res = await adminLogin(form)
        //将token存储到localStorage
        localStorage.setItem('admin_token', res.token)
        //登录成功后，跳转到管理员后台
        ElMessage.success(res.msg || "登录成功")
        router.push({ name: 'adminDashboard' })
    } catch (err) {
        console.log("校验失败", err)
    }
}
</script>

<style scoped>
.major-page {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中，可选 */
    min-height: 100vh;
    /* 撑满视口高度，方便垂直居中 */
}

.login-page {
    h2 {
        text-align: center;
    }

    width: 400px;
    /* 关键：限制宽度 */
    padding: 30px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>