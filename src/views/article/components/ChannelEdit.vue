<script setup>
import { ref } from 'vue'
import { updateArticleChannel, addArticleChannel } from '@/api/article'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const formModel = ref({
  id: null,
  cate_name: '',
  cate_alias: ''
})
const form = ref(null)
const rules = {
  cate_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { pattern: /^\S{1,10}$/, message: '分类名称只能包含1~10位字母、数字', trigger: 'blur' }
  ],
  cate_alias: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{1,15}$/, message: '分类别名只能包含1~15位字母、数字', trigger: 'blur' }
  ]
}

const emit = defineEmits(['refresh'])

const openDialog = (row) => {
  dialogVisible.value = true
  if (row) {
    // 编辑：拷贝行数据到表单
    formModel.value.id = row.id
    formModel.value.cate_name = row.cate_name
    formModel.value.cate_alias = row.cate_alias
  } else {
    formModel.value.cate_name = ''
    formModel.value.cate_alias = ''
  }
  // 清除上一次的校验状态
  form.value?.clearValidate()
}

const submit = async () => {
  await form.value.validate()
  if (formModel.value.id) {
    await updateArticleChannel(formModel.value)
    ElMessage.success('更新成功')
  } else {
    await addArticleChannel(formModel.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  form.value.resetFields()
  // 通知父组件刷新表格
  emit('refresh')
}

defineExpose({
  openDialog
})
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="formModel.id ? '编辑' : '添加分类信息'" width="500">
    <el-form :model="formModel" :rules="rules" ref="form" label-width="120px">
      <el-form-item label="分类名称" prop="cate_name">
        <el-input v-model="formModel.cate_name" placeholder="请输入分类名称"></el-input>
      </el-form-item>
      <el-form-item label="分类别名" prop="cate_alias">
        <el-input v-model="formModel.cate_alias" placeholder="请输入分类别名"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>