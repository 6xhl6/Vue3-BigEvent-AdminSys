<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/index'
import { useRouter } from 'vue-router'
const isRegister = ref(localStorage.getItem('userInfo') === '{}')
const rememberMe = ref(false)

// 页面加载时读取记住的账号密码
const REMEMBER_KEY = 'remembered_credentials'
onMounted(() => {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      const { username, password } = JSON.parse(saved)
      formModel.value.username = username || ''
      formModel.value.password = password ? atob(password) : ''  // base64 解码
      rememberMe.value = true
    }
  } catch {
    // 存储数据损坏，清除
    localStorage.removeItem(REMEMBER_KEY)
  }
})
// 校验相关
const formModel = ref({
  username: '',
  password: '',
  repassword: ''
})
const form = ref(null)
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名长度必须在3-10之间' ,trigger: 'blur' }
    ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位非空字符', trigger: 'blur' }
  ],
  repassword: [
    { required: true, message: '请再次密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位非空字符', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== formModel.value.password) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
    ]
}
import { userRegisterService, userLoginService } from '@/api/user'
import { ElMessage } from 'element-plus'
const register = async () => {
    await form.value.validate()
    const res = await userRegisterService(formModel.value)
    console.log(res)
    if (res.status === 200) {
      // 注册成功
      ElMessage.success('注册成功')
      isRegister.value = false
    }
    form.value.resetFields()
}
// 切换登录注册时清空表单数据
watch(isRegister, () => {
    form.value.resetFields()
})
const router = useRouter()
const userStore = useUserStore()
const login = async () => {
    await form.value.validate()
    const res = await userLoginService(formModel.value)
    console.log(res)
    if (res.status === 200) {
      // 记住我：保存或清除账号密码到 localStorage
      if (rememberMe.value) {
        const credentials = {
          username: formModel.value.username,
          password: btoa(formModel.value.password)  // base64 编码存储
        }
        localStorage.setItem(REMEMBER_KEY, JSON.stringify(credentials))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      // 登录成功
      ElMessage.success('登录成功')
      console.log(res.data.token)
      userStore.setToken(res.data.token)
      router.push('/')
    } else {
      ElMessage.error(res.data.message || '服务异常')
    }
    form.value.resetFields()
}


</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form ref="form" :model="formModel" :rules="rules" size="large" autocomplete="off" v-if="isRegister">
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User" v-model="formModel.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="formModel.password" prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请再次输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="register">
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="never" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
      <el-form ref="form" size="large" autocomplete="off" v-else :model="formModel" :rules="rules">
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User" v-model="formModel.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" underline="never">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="login"
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="never" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
