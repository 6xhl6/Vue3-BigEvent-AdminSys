<script setup>
import PageContainer from '@/components/PageContainer.vue'
import { ref } from 'vue'
import { useUserStore } from '@/stores/index'
import { updateUserInfoService } from '@/api/user'
import { ElMessage } from 'element-plus'

const userstore = useUserStore()
userstore.getUser()
console.log(userstore)

const formModel = ref({
  ...userstore.user
})
const rules = ref({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { pattern: /^\S{2,10}$/, message: '昵称长度必须在2到10个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'}
  ]
})
const form = ref(null)
const onSubmit = async () => {
  await form.value.validate()
  const res = await updateUserInfoService(formModel.value)
  console.log(res)
  ElMessage.success('更新成功')
  userstore.setUser(formModel.value)
}
 
</script>
<template>
  <PageContainer title="基本资料">
    <el-form :model="formModel" :rules="rules" ref="form" label-width="120px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formModel.username" placeholder="请输入用户名" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formModel.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formModel.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item style="margin-left: 50px" @click="onSubmit">
        <el-button type="primary">提交修改</el-button>
      </el-form-item>
    </el-form>
  </PageContainer>
</template>
