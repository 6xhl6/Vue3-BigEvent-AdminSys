<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ChannelSelect from '@/views/article/components/ChannelSelect.vue'
import { QuillEditor } from '@vueup/vue-quill'
import { addArticle, updateArticle, getArticleDetail } from '@/api/article'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const BASEURL = 'http://big-event-vue-api-t.itheima.net'
async function urlToFile(img_url, filename) {
  // 以 Blob 格式请求图片数据
  const response = await axios.get(img_url, {
    responseType: 'blob',
  })

  // 从响应数据创建 File 对象
  // response.data 此时就是 Blob
  const file = new File([response.data], filename, {
    type: response.data.type || 'image/jpeg' // 保留原始 MIME 类型
  })

  return file
}
const emit = defineEmits(['refresh'])
const drawerVisible = ref(false)
const editorKey = ref(0)
const form = ref(null)
const channelList = defineModel('channelList')
const id = ref('')
const rules = ref({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  cate_id: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  cover_img: [
    {
      validator: (_rule, _value, callback) => {
        if (!formModel.value.cover_img) {
          callback(new Error('请上传文章封面'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})
const rawForm = {
  title: '',
  cate_id: '',
  content: '',
  cover_img: '',
  state: '已发布'
}
const formModel = ref({
  title: '',
  cate_id: '',
  content: '',
  cover_img: '',
  state: '已发布'
})
// 抽屉关闭后重置表单，确保下次打开是干净的状态
const onDrawerClosed = () => {
  formModel.value = { ...rawForm }
  imageUrl.value = ''
  coverFile.value = null
  form.value?.resetFields()
}

const open = async (row) => {
  console.log(row)
  drawerVisible.value = true
  editorKey.value++
  // 先清除上次的校验状态
  form.value?.clearValidate()
  if (row.id) {
    const res = await getArticleDetail(row.id)
    const detail = res.data.data
    formModel.value.title = detail.title
    formModel.value.cate_id = detail.cate_id
    formModel.value.cate_name = detail.cate_name
    formModel.value.content = detail.content
    formModel.value.cover_img = BASEURL + detail.cover_img || ''
    formModel.value.state = detail.state
    imageUrl.value = BASEURL + detail.cover_img || ''
    id.value = row.id
  }
  else {
    formModel.value = {
      title: '',
      cate_id: '',
      cate_name: '',
      content: '',
      cover_img: '',
      state: '草稿'
    }
    imageUrl.value = ''
  }
}
const imageUrl = ref('')
const coverFile = ref(null)  // 保存原始 File 对象，用于 FormData 上传
const fileChange = (file) => {
  imageUrl.value = URL.createObjectURL(file.raw)
  coverFile.value = file.raw  // 保存原始文件对象
  formModel.value.cover_img = file.raw  // 存文件对象用于前端校验
  console.log('cover_img file:', file.raw)
}
const createFd = () => {
  const fd = new FormData()
  fd.append('title', formModel.value.title)
  fd.append('cate_id', formModel.value.cate_id)
  fd.append('content', formModel.value.content)
  fd.append('state', formModel.value.state)
  fd.append('cover_img', formModel.value.cover_img)
  return fd
}
const onSubmit = async (state) => {
  await form.value.validate()
  formModel.value.state = state
  if (!id.value) {
    // 使用 FormData 上传，确保文件以 multipart/form-data 正确发送
    const fd = createFd()
    const res = await addArticle(fd)
    console.log(res)
    ElMessage.success('添加成功')
    emit('refresh','add')
  }
  else {
    // 如果不修改图片，此时图片数据为url，需转换为file对象
    if (typeof formModel.value.cover_img === 'string') {
      formModel.value.cover_img = await urlToFile(formModel.value.cover_img, 'imgFile')
    }
    const fd = createFd()
    fd.append('id', id.value)
    const res = await updateArticle(fd)
    console.log(res)
    ElMessage.success('更新成功')
    emit('refresh','update')
  }

  formModel.value = { ...rawForm }
  imageUrl.value = ''
  coverFile.value = null
  drawerVisible.value = false
  id.value = ''
}

defineExpose({
  open
})

</script>
<template>
  <el-drawer v-model="drawerVisible" :title="id ? '编辑文章' : '添加文章'" size="50%" @closed="onDrawerClosed">
    <el-form width="100%" ref="form" :rules="rules" :model="formModel">
      <el-form-item label="文章标题" prop="title">
        <el-input placeholder="请输入文章标题" v-model="formModel.title"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <ChannelSelect v-model:cate_id="formModel.cate_id" v-model:cate_name="formModel.cate_name" v-model:channelList="channelList" />
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" @change="fileChange">
          <img v-if="imageUrl" :src="imageUrl" class="upload-image" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus style="font-size: 40px;" />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" class="content-editor" prop="content">
        <div style="width: 100%">
          <QuillEditor v-model:content="formModel.content" content-type="html" :key="editorKey" />
        </div>
      </el-form-item>
      <el-form-item class="submit-button">
        <el-button type="primary" @click="onSubmit('已发布')">发布</el-button>
        <el-button @click="onSubmit('草稿')">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style scoped lang="scss">
.avatar-uploader-icon {
  width: 150px;
  height: 150px;
  color: #999;
  background-size: 100% 100%;
  border: 1.5px dashed #999;
  border-radius: 5px;
}

.submit-button {
  margin-left: 70px;
}

.upload-image {
  width: 150px;
  height: 150px;
}

.avatar-uploader-icon {
  width: 150px;
  height: 150px;
}

.content-editor :deep(.ql-container) {
  width: 100%;
  height: auto;
}

:deep(.ql-editor) {
  height: auto;
  min-height: 100px;
}
</style>